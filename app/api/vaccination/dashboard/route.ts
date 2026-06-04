import { NextResponse } from 'next/server';
import { getCampaigns, getVaccines, getVaccinationReports } from '@/lib/vaccination_data';
import { getActiveGroups } from '@/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId') || undefined;

    const [campaigns, vaccines, reports, activeGroups] = await Promise.all([
      getCampaigns(),
      getVaccines(),
      getVaccinationReports(campaignId),
      getActiveGroups()
    ]);

    // If a specific campaign is requested, calculate progress
    if (campaignId) {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

      const vaccinesProgress = campaign.vaccines.map(cv => {
        const vInfo = vaccines.find(v => v.id === cv.vaccineId);
        const vReports = reports.filter(r => r.vaccineId === cv.vaccineId);
        
        let totalAdministered = 0;
        const groupStats = activeGroups.map(def => {
          const total = vReports.reduce((sum, r) => {
            const detail = r.details.find(d => d.groupKey === def.key);
            return sum + (detail ? detail.count : 0);
          }, 0);
          totalAdministered += total;
          return { ...def, total };
        });

        return {
          vaccineId: cv.vaccineId,
          vaccineName: vInfo?.name || 'Unknown',
          totalAllocated: cv.totalAllocated,
          totalAdministered,
          groupStats
        };
      });

      return NextResponse.json({
        campaign,
        vaccinesProgress,
        reports
      });
    }

    // Default: return all campaigns with high-level stats
    const enrichedCampaigns = await Promise.all(campaigns.map(async c => {
      const cReports = await getVaccinationReports(c.id);
      let totalAdministered = 0;
      cReports.forEach(r => {
        totalAdministered += r.details.reduce((sum, d) => sum + d.count, 0);
      });
      
      const totalAllocated = c.vaccines.reduce((sum, v) => sum + v.totalAllocated, 0);

      return {
        ...c,
        vaccinesInfo: c.vaccines.map(cv => ({
          ...cv,
          name: vaccines.find(v => v.id === cv.vaccineId)?.name || 'Unknown'
        })),
        totalAllocated,
        totalAdministered,
      };
    }));

    return NextResponse.json({ campaigns: enrichedCampaigns });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

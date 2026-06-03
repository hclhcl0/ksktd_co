import { prisma } from './prisma';
import { Vaccine, VaccineCampaign, VaccinationReport } from './types';

// --- Vaccines API ---
export async function getVaccines(): Promise<Vaccine[]> {
  const vaccines = await prisma.vaccine.findMany();
  return vaccines.map(v => ({
    id: v.id,
    name: v.name,
    description: v.description || ''
  }));
}

export async function addVaccine(v: Omit<Vaccine, 'id'>): Promise<Vaccine> {
  const newV = await prisma.vaccine.create({
    data: {
      name: v.name,
      description: v.description
    }
  });
  return {
    id: newV.id,
    name: newV.name,
    description: newV.description || ''
  };
}

export async function deleteVaccine(id: string): Promise<boolean> {
  try {
    await prisma.vaccine.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}

// --- Campaigns API ---
export async function getCampaigns(): Promise<VaccineCampaign[]> {
  const campaigns = await prisma.vaccineCampaign.findMany({
    include: { vaccines: true },
    orderBy: { startDate: 'desc' }
  });
  return campaigns.map(c => ({
    id: c.id,
    name: c.name,
    startDate: c.startDate,
    endDate: c.endDate,
    status: c.status as 'active' | 'completed',
    vaccines: c.vaccines.map(cv => ({
      vaccineId: cv.vaccineId,
      totalAllocated: cv.totalAllocated
    }))
  }));
}

export async function getCampaignById(id: string): Promise<VaccineCampaign | undefined> {
  const c = await prisma.vaccineCampaign.findUnique({
    where: { id },
    include: { vaccines: true }
  });
  if (!c) return undefined;
  return {
    id: c.id,
    name: c.name,
    startDate: c.startDate,
    endDate: c.endDate,
    status: c.status as 'active' | 'completed',
    vaccines: c.vaccines.map(cv => ({
      vaccineId: cv.vaccineId,
      totalAllocated: cv.totalAllocated
    }))
  };
}

export async function addCampaign(c: Omit<VaccineCampaign, 'id'>): Promise<VaccineCampaign> {
  const newC = await prisma.vaccineCampaign.create({
    data: {
      name: c.name,
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
      vaccines: {
        create: c.vaccines.map(v => ({
          vaccineId: v.vaccineId,
          totalAllocated: v.totalAllocated
        }))
      }
    },
    include: { vaccines: true }
  });
  return {
    id: newC.id,
    name: newC.name,
    startDate: newC.startDate,
    endDate: newC.endDate,
    status: newC.status as 'active' | 'completed',
    vaccines: newC.vaccines.map(cv => ({
      vaccineId: cv.vaccineId,
      totalAllocated: cv.totalAllocated
    }))
  };
}

export async function updateCampaign(id: string, updates: Partial<VaccineCampaign>): Promise<VaccineCampaign | null> {
  try {
    const { vaccines, ...scalarUpdates } = updates;
    
    // For vaccines, it's easier to delete all existing and recreate
    if (vaccines) {
      await prisma.campaignVaccine.deleteMany({ where: { campaignId: id } });
    }

    const updated = await prisma.vaccineCampaign.update({
      where: { id },
      data: {
        ...scalarUpdates,
        ...(vaccines && {
          vaccines: {
            create: vaccines.map(v => ({
              vaccineId: v.vaccineId,
              totalAllocated: v.totalAllocated
            }))
          }
        })
      },
      include: { vaccines: true }
    });
    
    return {
      id: updated.id,
      name: updated.name,
      startDate: updated.startDate,
      endDate: updated.endDate,
      status: updated.status as 'active' | 'completed',
      vaccines: updated.vaccines.map(cv => ({
        vaccineId: cv.vaccineId,
        totalAllocated: cv.totalAllocated
      }))
    };
  } catch (e) {
    return null;
  }
}

export async function deleteCampaign(id: string): Promise<boolean> {
  try {
    await prisma.vaccineCampaign.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}

// --- Reports API ---
export async function getVaccinationReports(campaignId?: string): Promise<VaccinationReport[]> {
  const reports = await prisma.vaccinationReport.findMany({
    where: campaignId ? { campaignId } : undefined,
    orderBy: { created_at: 'desc' }
  });
  
  return reports.map(r => ({
    ...r,
    created_at: r.created_at.toISOString()
  }));
}

export async function addVaccinationReport(r: Omit<VaccinationReport, 'id' | 'created_at'>): Promise<VaccinationReport> {
  const newR = await prisma.vaccinationReport.create({
    data: {
      campaignId: r.campaignId,
      vaccineId: r.vaccineId,
      don_vi: r.don_vi,
      ngay_tiem: r.ngay_tiem,
      nguoi_nop_bao_cao: r.nguoi_nop_bao_cao,
      nguoi_cao_tuoi: r.nguoi_cao_tuoi,
      nguoi_khuyet_tat: r.nguoi_khuyet_tat,
      ho_ngheo: r.ho_ngheo,
      ho_can_ngheo: r.ho_can_ngheo,
      nguoi_co_cong: r.nguoi_co_cong,
      vung_kho_khan: r.vung_kho_khan,
      tre_em_duoi_6_tuoi: r.tre_em_duoi_6_tuoi
    }
  });
  
  return {
    ...newR,
    created_at: newR.created_at.toISOString()
  };
}

export async function updateVaccinationReport(id: string, updates: Partial<VaccinationReport>): Promise<VaccinationReport | null> {
  try {
    const { id: _id, created_at: _created_at, ...validUpdates } = updates as any;
    const updated = await prisma.vaccinationReport.update({
      where: { id },
      data: validUpdates
    });
    return {
      ...updated,
      created_at: updated.created_at.toISOString()
    };
  } catch (error) {
    return null;
  }
}

export async function deleteVaccinationReport(id: string): Promise<boolean> {
  try {
    await prisma.vaccinationReport.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}

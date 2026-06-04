import { NextResponse } from 'next/server';
import { getCampaigns, addCampaign, deleteCampaign, getVaccines, addVaccine, deleteVaccine } from '@/lib/vaccination_data';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'vaccines') {
      return NextResponse.json(await getVaccines());
    }
    
    // Default to campaigns (and include vaccine names)
    const campaigns = await getCampaigns();
    const vaccines = await getVaccines();
    
    const enriched = campaigns.map(c => ({
      ...c,
      vaccinesInfo: c.vaccines.map(cv => ({
        ...cv,
        name: vaccines.find(v => v.id === cv.vaccineId)?.name || 'Unknown'
      }))
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'admin' && role !== 'admin_cdc') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'create_vaccine') {
      const { name, description } = body.data;
      if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
      const newV = await addVaccine({ name, description: description || '' });
      return NextResponse.json(newV);
    }

    if (action === 'create_campaign') {
      const { name, vaccines, startDate, endDate, status } = body.data;
      if (!name || !vaccines || !Array.isArray(vaccines) || vaccines.length === 0 || !startDate || !endDate) {
        return NextResponse.json({ error: 'Missing required fields or vaccines' }, { status: 400 });
      }
      
      const newC = await addCampaign({ 
        name, 
        vaccines: vaccines.map((v: any) => ({ vaccineId: v.vaccineId, totalAllocated: Number(v.totalAllocated) })), 
        startDate, 
        endDate, 
        status: status || 'active' 
      });
      return NextResponse.json(newC);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'admin' && role !== 'admin_cdc') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    if (type === 'vaccine') {
      await deleteVaccine(id);
      return NextResponse.json({ success: true });
    }

    if (type === 'campaign') {
      await deleteCampaign(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

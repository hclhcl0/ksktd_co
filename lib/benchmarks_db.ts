import { prisma } from './prisma';

export interface BenchmarkDataRecord {
  groupKey: string;
  target: number | null;
}

export interface BenchmarkRecord {
  don_vi: string;
  details: BenchmarkDataRecord[];
}

export async function getBenchmarks(): Promise<BenchmarkRecord[]> {
  const rows = await prisma.benchmark.findMany({
    orderBy: { don_vi: 'asc' },
    include: { details: true }
  });
  
  return rows.map((r) => ({
    don_vi: r.don_vi,
    details: r.details.map(d => ({ groupKey: d.groupKey, target: d.target }))
  }));
}

export async function getBenchmarkByUnit(don_vi: string): Promise<BenchmarkRecord | null> {
  const row = await prisma.benchmark.findUnique({
    where: { don_vi },
    include: { details: true }
  });
  if (!row) return null;
  
  return {
    don_vi: row.don_vi,
    details: row.details.map(d => ({ groupKey: d.groupKey, target: d.target }))
  };
}

export async function upsertBenchmark(
  don_vi: string,
  details: BenchmarkDataRecord[]
): Promise<BenchmarkRecord> {
  const updated = await prisma.$transaction(async (tx) => {
    // Upsert the main benchmark record
    await tx.benchmark.upsert({
      where: { don_vi },
      create: { don_vi },
      update: {}
    });

    // Delete existing details for this unit
    await tx.benchmarkData.deleteMany({
      where: { don_vi }
    });

    // Insert new details
    if (details.length > 0) {
      await tx.benchmarkData.createMany({
        data: details.map(d => ({ don_vi, groupKey: d.groupKey, target: d.target }))
      });
    }

    return tx.benchmark.findUnique({
      where: { don_vi },
      include: { details: true }
    });
  });

  if (!updated) throw new Error('Failed to upsert benchmark');

  return {
    don_vi: updated.don_vi,
    details: updated.details.map(d => ({ groupKey: d.groupKey, target: d.target }))
  };
}

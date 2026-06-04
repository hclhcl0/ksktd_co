import { cache } from 'react';
import { prisma } from './prisma';
import { HealthReport as PrismaHealthReport, HealthReportData as PrismaHealthReportData, DemographicGroup } from '@prisma/client';
import { DashboardStats, GroupStat, StatProgress, UnitProgress, ProgressDashboard, HealthReport } from './types';
import { getBenchmarks } from './benchmarks_db';
import { UNIT_TO_FACILITY } from './facilities';

// Convert Prisma model to our type
function mapPrismaReport(r: PrismaHealthReport & { details: PrismaHealthReportData[] }): HealthReport {
  return {
    id: r.id,
    don_vi: r.don_vi,
    ngay_kham: r.ngay_kham,
    co_so_y_te: r.co_so_y_te,
    nguoi_nop_bao_cao: r.nguoi_nop_bao_cao,
    created_at: r.created_at.toISOString(),
    details: r.details.map(d => ({ groupKey: d.groupKey, count: d.count }))
  };
}

export const getActiveGroups = cache(async (): Promise<DemographicGroup[]> => {
  return prisma.demographicGroup.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' }
  });
});

export const getAllReports = cache(async (): Promise<HealthReport[]> => {
  const reports = await prisma.healthReport.findMany({
    orderBy: { created_at: 'desc' },
    include: { details: true }
  });
  return reports.map(mapPrismaReport);
});

export async function getReportById(id: string): Promise<HealthReport | undefined> {
  const report = await prisma.healthReport.findUnique({
    where: { id },
    include: { details: true }
  });
  return report ? mapPrismaReport(report) : undefined;
}

export async function addReport(report: Omit<HealthReport, 'id' | 'created_at'>): Promise<HealthReport> {
  const newReport = await prisma.healthReport.create({
    data: {
      don_vi: report.don_vi,
      ngay_kham: report.ngay_kham,
      co_so_y_te: report.co_so_y_te,
      nguoi_nop_bao_cao: report.nguoi_nop_bao_cao,
      details: {
        create: report.details.map(d => ({ groupKey: d.groupKey, count: d.count }))
      }
    },
    include: { details: true }
  });
  return mapPrismaReport(newReport);
}

export async function deleteReport(id: string): Promise<boolean> {
  try {
    await prisma.healthReport.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    return false;
  }
}

export async function updateReport(id: string, updates: Partial<HealthReport>): Promise<HealthReport | null> {
  try {
    const { details, ...rest } = updates;
    
    // Using a transaction to replace details
    const updated = await prisma.$transaction(async (tx) => {
      const updatedReport = await tx.healthReport.update({
        where: { id },
        data: rest
      });

      if (details) {
        await tx.healthReportData.deleteMany({ where: { reportId: id } });
        await tx.healthReportData.createMany({
          data: details.map(d => ({ reportId: id, groupKey: d.groupKey, count: d.count }))
        });
      }

      return tx.healthReport.findUnique({
        where: { id },
        include: { details: true }
      });
    });

    return updated ? mapPrismaReport(updated as any) : null;
  } catch (error) {
    return null;
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [reports, groups] = await Promise.all([
    getAllReports(),
    getActiveGroups()
  ]);

  let totalExaminations = 0;
  
  const groupTotalsMap = new Map<string, number>();
  groups.forEach(g => groupTotalsMap.set(g.key, 0));

  const unitMap = new Map<
    string,
    { don_vi: string; co_so_y_te: string; ngay_kham: string; total: number; reportCount: number }
  >();

  for (const r of reports) {
    let rowTotal = 0;
    
    for (const detail of r.details) {
      if (groupTotalsMap.has(detail.groupKey)) {
        groupTotalsMap.set(detail.groupKey, groupTotalsMap.get(detail.groupKey)! + detail.count);
      }
      rowTotal += detail.count;
    }
    totalExaminations += rowTotal;

    const existing = unitMap.get(r.don_vi);
    if (existing) {
      existing.total += rowTotal;
      existing.reportCount += 1;
    } else {
      unitMap.set(r.don_vi, {
        don_vi: r.don_vi,
        co_so_y_te: r.co_so_y_te,
        ngay_kham: r.ngay_kham,
        total: rowTotal,
        reportCount: 1,
      });
    }
  }

  const groupTotals: GroupStat[] = groups.map(g => ({
    label: g.name,
    shortLabel: g.shortLabel,
    key: g.key,
    total: groupTotalsMap.get(g.key) || 0,
    color: g.color || '#3b82f6'
  }));

  const uniqueUnits = new Set(reports.map((r) => r.don_vi)).size;
  const reportsByUnit = Array.from(unitMap.values()).sort((a, b) => b.total - a.total);

  return {
    totalReports: reports.length,
    totalExaminations,
    uniqueUnits,
    groupTotals,
    reportsByUnit,
  };
}

export async function getProgressDashboard(): Promise<ProgressDashboard> {
  const [reports, benchmarks, groups] = await Promise.all([
    getAllReports(),
    getBenchmarks(),
    getActiveGroups()
  ]);

  const achievedMap = new Map<string, {
    achieved: Record<string, number>;
    reportCount: number;
    lastDate: string;
    co_so_y_te: string;
    reportDates: Set<string>;
  }>();

  for (const r of reports) {
    let existing = achievedMap.get(r.don_vi);
    if (!existing) {
      existing = {
        achieved: {},
        reportCount: 0,
        lastDate: '',
        co_so_y_te: r.co_so_y_te,
        reportDates: new Set()
      };
      groups.forEach(g => existing!.achieved[g.key] = 0);
      achievedMap.set(r.don_vi, existing);
    }
    
    for (const d of r.details) {
      if (existing.achieved[d.groupKey] !== undefined) {
        existing.achieved[d.groupKey] += d.count;
      } else {
        existing.achieved[d.groupKey] = d.count;
      }
    }
    
    existing.reportCount += 1;
    if (r.ngay_kham > existing.lastDate) existing.lastDate = r.ngay_kham;
    existing.reportDates.add(r.ngay_kham);
  }

  const unitsNoBenchmark: string[] = [];
  const unitsWith0Reports: string[] = [];

  const units: UnitProgress[] = benchmarks.map((bm) => {
    const unitData = achievedMap.get(bm.don_vi);
    if (!unitData) unitsWith0Reports.push(bm.don_vi);

    const stats: StatProgress[] = groups.map((g) => {
      const achieved = unitData?.achieved[g.key] ?? 0;
      const targetData = bm.details.find(d => d.groupKey === g.key);
      const target = targetData ? targetData.target : null;
      let pct: number | null = null;
      if (target !== null && target > 0) {
        pct = Math.round((achieved / target) * 100);
      }
      return { key: g.key, label: g.name, icon: g.icon || '', achieved, target, pct };
    });

    const validStats = stats.filter((s) => s.pct !== null);
    const overallPct = validStats.length > 0
      ? Math.round(validStats.reduce((sum, s) => sum + (s.pct ?? 0), 0) / validStats.length)
      : null;

    if (overallPct === null && validStats.length === 0) {
      unitsNoBenchmark.push(bm.don_vi);
    }

    return {
      don_vi: bm.don_vi,
      co_so_y_te: unitData?.co_so_y_te ?? UNIT_TO_FACILITY[bm.don_vi] ?? '',
      reportCount: unitData?.reportCount ?? 0,
      lastReportDate: unitData?.lastDate ?? '',
      reportDates: unitData ? Array.from(unitData.reportDates) : [],
      stats,
      overallPct,
    };
  });

  units.sort((a, b) => {
    if (a.reportCount > 0 && b.reportCount === 0) return -1;
    if (a.reportCount === 0 && b.reportCount > 0) return 1;
    return (b.overallPct ?? -1) - (a.overallPct ?? -1);
  });

  const validSystem = units.filter((u) => u.overallPct !== null);
  const systemOverallPct = validSystem.length > 0
    ? Math.round(validSystem.reduce((sum, u) => sum + (u.overallPct ?? 0), 0) / validSystem.length)
    : null;

  return { units, systemOverallPct, unitsWith0Reports, unitsNoBenchmark };
}

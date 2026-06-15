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

export const getUnitActiveGroups = cache(async (don_vi: string): Promise<DemographicGroup[]> => {
  return prisma.demographicGroup.findMany({
    where: { 
      isActive: true,
      OR: [
        { isGlobal: true },
        { appliedUnits: { has: don_vi } }
      ]
    },
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
  const [reports, benchmarks, groups, unitAccounts] = await Promise.all([
    getAllReports(),
    getBenchmarks(),
    getActiveGroups(),
    prisma.account.findMany({ where: { role: 'unit' } })
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
      // We don't need to initialize achieved here since we'll just populate it from details
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

  // Nguồn chuẩn: don_vi từ báo cáo + chỉ tiêu (đây là key nhất quán).
  // Đơn vị nộp báo cáo dùng session.user.name (displayName) làm don_vi.
  // Bổ sung thêm displayName của các tài khoản mới chưa nộp báo cáo/chỉ tiêu.
  const unitNames = new Set<string>();
  benchmarks.forEach(b => unitNames.add(b.don_vi));
  for (const r of reports) {
    unitNames.add(r.don_vi);
  }
  // Bổ sung displayName của tài khoản unit mới (chưa có báo cáo hoặc chỉ tiêu)
  unitAccounts.forEach(a => {
    if (a.displayName && !unitNames.has(a.displayName)) {
      unitNames.add(a.displayName);
    }
  });

  const units: UnitProgress[] = Array.from(unitNames).map((don_vi) => {
    // Tìm tài khoản khớp theo displayName (key nhất quán với báo cáo)
    const acc = unitAccounts.find(a => a.displayName === don_vi);
    const bm = benchmarks.find(b => b.don_vi === don_vi);
    const unitData = achievedMap.get(don_vi);

    if (!unitData) unitsWith0Reports.push(don_vi);

    // Filter groups: global groups + specific applied units
    const unitGroups = groups.filter(g => g.isGlobal || g.appliedUnits.includes(don_vi));

    const stats: StatProgress[] = unitGroups.map((g) => {
      const achieved = unitData?.achieved[g.key] ?? 0;
      const targetData = bm?.details.find(d => d.groupKey === g.key);
      let target = targetData ? targetData.target : null;
      let pct: number | null = null;
      
      if (g.hasNoBenchmark) {
        target = achieved;
        pct = achieved > 0 ? 100 : null;
      } else if (target !== null && target > 0) {
        pct = Math.round((achieved / target) * 100);
      }
      
      return { key: g.key, label: g.name, icon: g.icon || '', achieved, target, pct, hasNoBenchmark: g.hasNoBenchmark };
    });

    const validStats = stats.filter((s) => s.pct !== null);
    const overallPct = validStats.length > 0
      ? Math.round(validStats.reduce((sum, s) => sum + (s.pct ?? 0), 0) / validStats.length)
      : null;

    if (overallPct === null && validStats.length === 0) {
      unitsNoBenchmark.push(don_vi);
    }

    return {
      don_vi: don_vi,
      co_so_y_te: unitData?.co_so_y_te ?? acc?.facilityName ?? UNIT_TO_FACILITY[don_vi] ?? '',
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

  const systemGroupStatsMap = new Map<string, { achieved: number; target: number }>();
  groups.forEach(g => systemGroupStatsMap.set(g.key, { achieved: 0, target: 0 }));

  units.forEach(u => {
    u.stats.forEach(s => {
      const g = systemGroupStatsMap.get(s.key);
      if (g) {
        g.achieved += s.achieved;
        if (s.target !== null) g.target += s.target;
      }
    });
  });

  const systemGroupStats: StatProgress[] = groups.map(g => {
    const data = systemGroupStatsMap.get(g.key)!;
    let pct: number | null = null;
    if (g.hasNoBenchmark) {
      pct = data.achieved > 0 ? 100 : null;
    } else if (data.target > 0) {
      pct = Math.round((data.achieved / data.target) * 100);
    }
    return { 
      key: g.key, 
      label: g.name, 
      icon: g.icon || '', 
      achieved: data.achieved, 
      target: g.hasNoBenchmark ? (data.achieved > 0 ? data.achieved : null) : (data.target > 0 ? data.target : null), 
      pct,
      hasNoBenchmark: g.hasNoBenchmark,
      color: g.color || undefined
    };
  });

  return { units, systemOverallPct, unitsWith0Reports, unitsNoBenchmark, systemGroupStats };
}

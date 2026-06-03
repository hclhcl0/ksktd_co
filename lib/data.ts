import { prisma } from './prisma';
import { HealthReport as PrismaHealthReport } from '@prisma/client';
import { DashboardStats, GroupStat, StatKey, StatProgress, UnitProgress, ProgressDashboard } from './types';
import { getBenchmarks } from './benchmarks';
import { getAccounts } from './accounts';
import { UNIT_TO_FACILITY } from './facilities';

export type HealthReport = {
  id: string;
  don_vi: string;
  ngay_kham: string;
  co_so_y_te: string;
  nguoi_nop_bao_cao: string;
  
  nguoi_cao_tuoi: number;
  nguoi_khuyet_tat: number;
  ho_ngheo: number;
  ho_can_ngheo: number;
  nguoi_co_cong: number;
  vung_kho_khan: number;
  tre_em_duoi_6_tuoi: number;
  
  created_at: string;
};

// Convert Prisma model to our type
function mapPrismaReport(r: PrismaHealthReport): HealthReport {
  return {
    ...r,
    created_at: r.created_at.toISOString()
  };
}

export const GROUP_DEFINITIONS: Omit<GroupStat, 'total'>[] = [
  { label: 'Người cao tuổi', shortLabel: 'Cao tuổi', key: 'nguoi_cao_tuoi', color: '#3b82f6' },
  { label: 'Người khuyết tật', shortLabel: 'Khuyết tật', key: 'nguoi_khuyet_tat', color: '#8b5cf6' },
  { label: 'Hộ nghèo', shortLabel: 'Hộ nghèo', key: 'ho_ngheo', color: '#f59e0b' },
  { label: 'Hộ cận nghèo', shortLabel: 'Cận nghèo', key: 'ho_can_ngheo', color: '#f97316' },
  { label: 'Người có công', shortLabel: 'Có công', key: 'nguoi_co_cong', color: '#10b981' },
  { label: 'Vùng khó khăn / DTTS', shortLabel: 'Vùng khó', key: 'vung_kho_khan', color: '#06b6d4' },
  { label: 'Trẻ em dưới 6 tuổi', shortLabel: 'Trẻ < 6T', key: 'tre_em_duoi_6_tuoi', color: '#ec4899' },
];

export async function getAllReports(): Promise<HealthReport[]> {
  const reports = await prisma.healthReport.findMany({
    orderBy: { created_at: 'desc' }
  });
  return reports.map(mapPrismaReport);
}

export async function getReportById(id: string): Promise<HealthReport | undefined> {
  const report = await prisma.healthReport.findUnique({
    where: { id }
  });
  return report ? mapPrismaReport(report) : undefined;
}

export async function addReport(report: Omit<HealthReport, 'id' | 'created_at'>): Promise<HealthReport> {
  const newReport = await prisma.healthReport.create({
    data: report
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
    const { id: _id, created_at: _created_at, ...validUpdates } = updates as any;
    
    const updated = await prisma.healthReport.update({
      where: { id },
      data: validUpdates
    });
    return mapPrismaReport(updated);
  } catch (error) {
    return null;
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const reports = await getAllReports();

  const totalExaminations = reports.reduce((sum, r) => {
    return (
      sum + r.nguoi_cao_tuoi + r.nguoi_khuyet_tat + r.ho_ngheo + r.ho_can_ngheo +
      r.nguoi_co_cong + r.vung_kho_khan + r.tre_em_duoi_6_tuoi
    );
  }, 0);

  const uniqueUnits = new Set(reports.map((r) => r.don_vi)).size;

  const groupTotals: GroupStat[] = GROUP_DEFINITIONS.map((def) => ({
    ...def,
    total: reports.reduce((sum, r) => sum + (r[def.key] as number), 0),
  }));

  const unitMap = new Map<
    string,
    { don_vi: string; co_so_y_te: string; ngay_kham: string; total: number; reportCount: number }
  >();

  for (const r of reports) {
    const existing = unitMap.get(r.don_vi);
    const rowTotal = r.nguoi_cao_tuoi + r.nguoi_khuyet_tat + r.ho_ngheo + r.ho_can_ngheo +
                     r.nguoi_co_cong + r.vung_kho_khan + r.tre_em_duoi_6_tuoi;

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

  const reportsByUnit = Array.from(unitMap.values()).sort((a, b) => b.total - a.total);

  return {
    totalReports: reports.length,
    totalExaminations,
    uniqueUnits,
    groupTotals,
    reportsByUnit,
  };
}

const STAT_META: { key: StatKey; label: string; icon: string }[] = [
  { key: 'nguoi_cao_tuoi',    label: 'Người cao tuổi',         icon: '👴' },
  { key: 'nguoi_khuyet_tat',  label: 'Người khuyết tật',       icon: '♿' },
  { key: 'ho_ngheo',          label: 'Hộ nghèo',               icon: '🏠' },
  { key: 'ho_can_ngheo',      label: 'Hộ cận nghèo',           icon: '🏡' },
  { key: 'nguoi_co_cong',     label: 'Người có công',          icon: '⭐' },
  { key: 'vung_kho_khan',     label: 'Vùng khó khăn / DTTS',   icon: '🏔️' },
  { key: 'tre_em_duoi_6_tuoi',label: 'Trẻ em dưới 6 tuổi',    icon: '👶' },
];

export async function getProgressDashboard(): Promise<ProgressDashboard> {
  const reports = await getAllReports();
  const benchmarks = getBenchmarks();
  const allAccounts = await getAccounts();

  const achievedMap = new Map<string, {
    achieved: Record<StatKey, number>;
    reportCount: number;
    lastDate: string;
    co_so_y_te: string;
  }>();

  for (const r of reports) {
    const existing = achievedMap.get(r.don_vi);
    const current: Record<StatKey, number> = {
      nguoi_cao_tuoi:    r.nguoi_cao_tuoi,
      nguoi_khuyet_tat:  r.nguoi_khuyet_tat,
      ho_ngheo:          r.ho_ngheo,
      ho_can_ngheo:      r.ho_can_ngheo,
      nguoi_co_cong:     r.nguoi_co_cong,
      vung_kho_khan:     r.vung_kho_khan,
      tre_em_duoi_6_tuoi: r.tre_em_duoi_6_tuoi,
    };
    if (existing) {
      for (const k of Object.keys(current) as StatKey[]) {
        existing.achieved[k] += current[k];
      }
      existing.reportCount += 1;
      if (r.ngay_kham > existing.lastDate) existing.lastDate = r.ngay_kham;
    } else {
      achievedMap.set(r.don_vi, {
        achieved: { ...current },
        reportCount: 1,
        lastDate: r.ngay_kham,
        co_so_y_te: r.co_so_y_te,
      });
    }
  }

  const allUnitNames = allAccounts
    .filter((a) => a.role === 'unit')
    .map((a) => a.displayName);

  const unitsNoBenchmark: string[] = [];
  const unitsWith0Reports: string[] = [];

  const units: UnitProgress[] = benchmarks.map((bm) => {
    const unitData = achievedMap.get(bm.don_vi);
    if (!unitData) unitsWith0Reports.push(bm.don_vi);

    const stats: StatProgress[] = STAT_META.map(({ key, label, icon }) => {
      const achieved = unitData?.achieved[key] ?? 0;
      const target = bm[key];
      let pct: number | null = null;
      if (target !== null && target > 0) {
        pct = Math.min(100, Math.round((achieved / target) * 100));
      }
      return { key, label, icon, achieved, target, pct };
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

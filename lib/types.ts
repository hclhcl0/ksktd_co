export interface DemographicGroup {
  id: string;
  key: string;
  name: string;
  shortLabel: string;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  isGlobal: boolean;
  appliedUnits: string[];
  createdAt: string | Date;
}

export interface HealthReportData {
  groupKey: string;
  count: number;
}

export interface HealthReport {
  id: string;
  don_vi: string;
  ngay_kham: string; // ISO date string "YYYY-MM-DD"
  co_so_y_te: string;
  nguoi_nop_bao_cao: string;
  created_at: string; // ISO datetime string
  details: HealthReportData[];
}

export type HealthReportFormData = Omit<HealthReport, 'id' | 'created_at'>;

export interface GroupStat {
  label: string;
  shortLabel: string;
  key: string;
  total: number;
  color: string;
}

export interface UnitSummary {
  don_vi: string;
  co_so_y_te: string;
  ngay_kham: string;
  total: number;
  reportCount: number;
}

export interface DashboardStats {
  totalReports: number;
  totalExaminations: number;
  uniqueUnits: number;
  groupTotals: GroupStat[];
  reportsByUnit: UnitSummary[];
}

// ─── Benchmark / Progress types ──────────────────────────────────────────────

export interface StatProgress {
  key: string;
  label: string;
  icon: string;
  achieved: number;          // tổng đã khám (cộng gộp tất cả báo cáo)
  target: number | null;     // chỉ tiêu (null = chưa nhập)
  pct: number | null;        // phần trăm (null nếu chưa có chỉ tiêu)
}

export interface UnitProgress {
  don_vi: string;
  co_so_y_te: string;
  reportCount: number;
  lastReportDate: string;
  reportDates: string[];       // tập hợp ngày_kham đã nộp (YYYY-MM-DD)
  stats: StatProgress[];
  overallPct: number | null; // trung bình % các chỉ tiêu có dữ liệu
}

export interface ProgressDashboard {
  units: UnitProgress[];
  systemOverallPct: number | null;
  unitsWith0Reports: string[];   // đơn vị chưa nộp báo cáo nào
  unitsNoBenchmark: string[];    // đơn vị chưa có chỉ tiêu
  systemGroupStats?: StatProgress[];
}

// ─── Vaccination Module Types ────────────────────────────────────────────────

export interface Vaccine {
  id: string;
  name: string;
  description: string;
}

export type CampaignStatus = 'active' | 'completed' | 'upcoming';

export interface CampaignVaccine {
  vaccineId: string;
  totalAllocated: number;
}

export interface VaccineCampaign {
  id: string;
  name: string;
  vaccines: CampaignVaccine[];
  startDate: string; // ISO YYYY-MM-DD
  endDate: string; // ISO YYYY-MM-DD
  status: CampaignStatus;
}

export interface VaccinationReportData {
  groupKey: string;
  count: number;
}

export interface VaccinationReport {
  id: string;
  campaignId: string;
  vaccineId: string;
  don_vi: string;
  ngay_tiem: string; // ISO YYYY-MM-DD
  nguoi_nop_bao_cao: string;
  created_at: string; // ISO datetime
  details: VaccinationReportData[];
}

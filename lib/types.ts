export interface HealthReport {
  id: string;
  don_vi: string;
  ngay_kham: string; // ISO date string "YYYY-MM-DD"
  co_so_y_te: string;
  nguoi_nop_bao_cao: string;
  nguoi_cao_tuoi: number;
  nguoi_khuyet_tat: number;
  ho_ngheo: number;
  ho_can_ngheo: number;
  nguoi_co_cong: number;
  vung_kho_khan: number;
  tre_em_duoi_6_tuoi: number;
  created_at: string; // ISO datetime string
}

export type HealthReportFormData = Omit<HealthReport, 'id' | 'created_at'>;

export interface GroupStat {
  label: string;
  shortLabel: string;
  key: StatKey;
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

export type StatKey =
  | 'nguoi_cao_tuoi'
  | 'nguoi_khuyet_tat'
  | 'ho_ngheo'
  | 'ho_can_ngheo'
  | 'nguoi_co_cong'
  | 'vung_kho_khan'
  | 'tre_em_duoi_6_tuoi';

export interface StatProgress {
  key: StatKey;
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

export interface VaccinationReport {
  id: string;
  campaignId: string;
  vaccineId: string;
  don_vi: string;
  ngay_tiem: string; // ISO YYYY-MM-DD
  nguoi_nop_bao_cao: string;
  created_at: string; // ISO datetime
  // Stats by group
  nguoi_cao_tuoi: number;
  nguoi_khuyet_tat: number;
  ho_ngheo: number;
  ho_can_ngheo: number;
  nguoi_co_cong: number;
  vung_kho_khan: number;
  tre_em_duoi_6_tuoi: number;
}

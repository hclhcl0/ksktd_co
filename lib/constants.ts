import { GroupStat } from './types';

export const GROUP_DEFINITIONS: Omit<GroupStat, 'total'>[] = [
  { label: 'Người cao tuổi', shortLabel: 'Cao tuổi', key: 'nguoi_cao_tuoi', color: '#3b82f6' },
  { label: 'Người khuyết tật', shortLabel: 'Khuyết tật', key: 'nguoi_khuyet_tat', color: '#8b5cf6' },
  { label: 'Hộ nghèo', shortLabel: 'Hộ nghèo', key: 'ho_ngheo', color: '#f59e0b' },
  { label: 'Hộ cận nghèo', shortLabel: 'Cận nghèo', key: 'ho_can_ngheo', color: '#f97316' },
  { label: 'Người có công', shortLabel: 'Có công', key: 'nguoi_co_cong', color: '#10b981' },
  { label: 'Vùng khó khăn / DTTS', shortLabel: 'Vùng khó', key: 'vung_kho_khan', color: '#06b6d4' },
  { label: 'Trẻ em dưới 6 tuổi', shortLabel: 'Trẻ < 6T', key: 'tre_em_duoi_6_tuoi', color: '#ec4899' },
];

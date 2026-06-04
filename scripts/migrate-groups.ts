import { prisma } from '../lib/prisma';

const GROUPS = [
  { key: 'nguoi_cao_tuoi', label: 'Người cao tuổi', shortLabel: 'Cao tuổi', icon: '👴', color: '#3b82f6' },
  { key: 'nguoi_khuyet_tat', label: 'Người khuyết tật', shortLabel: 'Khuyết tật', icon: '♿', color: '#f59e0b' },
  { key: 'ho_ngheo', label: 'Hộ nghèo', shortLabel: 'Hộ nghèo', icon: '🏠', color: '#ef4444' },
  { key: 'ho_can_ngheo', label: 'Hộ cận nghèo', shortLabel: 'Cận nghèo', icon: '🏡', color: '#f97316' },
  { key: 'nguoi_co_cong', label: 'Người có công', shortLabel: 'Có công', icon: '⭐', color: '#10b981' },
  { key: 'vung_kho_khan', label: 'Vùng khó khăn / DTTS', shortLabel: 'Vùng khó', icon: '🏔️', color: '#06b6d4' },
  { key: 'tre_em_duoi_6_tuoi', label: 'Trẻ em dưới 6 tuổi', shortLabel: 'Trẻ < 6T', icon: '👶', color: '#ec4899' },
  { key: 'hoc_sinh_sinh_vien', label: 'Học sinh, Sinh viên', shortLabel: 'HSSV', icon: '🎓', color: '#6366f1' },
  { key: 'luc_luong_vu_trang', label: 'Lực lượng vũ trang', shortLabel: 'LLVT', icon: '👮', color: '#14b8a6' },
  { key: 'nguoi_lao_dong', label: 'Người lao động', shortLabel: 'NLĐ', icon: '👷', color: '#a855f7' },
];

async function main() {
  console.log('Starting migration...');

  // 1. Create DemographicGroups
  console.log('Seeding DemographicGroups...');
  for (const g of GROUPS) {
    await prisma.demographicGroup.upsert({
      where: { key: g.key },
      create: {
        key: g.key,
        name: g.label,
        shortLabel: g.shortLabel,
        icon: g.icon,
        color: g.color,
        isActive: true,
      },
      update: {
        name: g.label,
        shortLabel: g.shortLabel,
        icon: g.icon,
        color: g.color,
      }
    });
  }
  console.log('Seeded DemographicGroups.');

  // 2. Migrate HealthReport
  console.log('Migrating HealthReports...');
  const healthReports = await prisma.healthReport.findMany();
  for (const hr of healthReports) {
    for (const g of GROUPS) {
      const count = (hr as any)[g.key] as number;
      if (count !== undefined) {
        await prisma.healthReportData.upsert({
          where: { reportId_groupKey: { reportId: hr.id, groupKey: g.key } },
          create: { reportId: hr.id, groupKey: g.key, count },
          update: { count }
        });
      }
    }
  }
  console.log('Migrated HealthReports.');

  // 3. Migrate Benchmark
  console.log('Migrating Benchmarks...');
  const benchmarks = await prisma.benchmark.findMany();
  for (const bm of benchmarks) {
    for (const g of GROUPS) {
      const target = (bm as any)[g.key] as number | null;
      if (target !== undefined && target !== null) {
        await prisma.benchmarkData.upsert({
          where: { don_vi_groupKey: { don_vi: bm.don_vi, groupKey: g.key } },
          create: { don_vi: bm.don_vi, groupKey: g.key, target },
          update: { target }
        });
      }
    }
  }
  console.log('Migrated Benchmarks.');

  // 4. Migrate VaccinationReport
  console.log('Migrating VaccinationReports...');
  const vacReports = await prisma.vaccinationReport.findMany();
  for (const vr of vacReports) {
    for (const g of GROUPS) {
      const count = (vr as any)[g.key] as number;
      if (count !== undefined) {
        await prisma.vaccinationReportData.upsert({
          where: { reportId_groupKey: { reportId: vr.id, groupKey: g.key } },
          create: { reportId: vr.id, groupKey: g.key, count },
          update: { count }
        });
      }
    }
  }
  console.log('Migrated VaccinationReports.');

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

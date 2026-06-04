import { z } from 'zod';

export const healthReportSchema = z.object({
  don_vi: z
    .string()
    .min(1, 'Vui lòng nhập tên đơn vị báo cáo')
    .max(200, 'Tên đơn vị không được vượt quá 200 ký tự'),
  ngay_kham: z
    .string()
    .min(1, 'Vui lòng chọn ngày thực hiện khám'),
  co_so_y_te: z
    .string()
    .min(1, 'Vui lòng nhập cơ sở y tế phụ trách')
    .max(200, 'Tên cơ sở y tế không được vượt quá 200 ký tự'),
  nguoi_nop_bao_cao: z
    .string()
    .min(2, 'Vui lòng nhập họ và tên người nộp báo cáo')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự'),
  details: z.array(
    z.object({
      groupKey: z.string(),
      count: z.number().int('Phải là số nguyên').min(0, 'Số liệu không được âm')
    })
  )
});

export type HealthReportFormValues = z.infer<typeof healthReportSchema>;

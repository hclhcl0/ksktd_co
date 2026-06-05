'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';
import { GroupStat } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface GroupBarChartProps {
  data: GroupStat[];
}

export default function GroupBarChart({ data }: GroupBarChartProps) {
  const chartData = data.map((d) => ({
    name: d.shortLabel,
    label: d.label,
    total: d.total,
    fill: d.color,
  }));

  const chartConfig = {
    total: {
      label: "Người được khám",
    },
  } satisfies ChartConfig;

  return (
    <div className="card p-5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Thống kê theo nhóm đối tượng</h2>
          <p className="text-xs text-slate-400 mt-0.5">Tổng hợp toàn hệ thống</p>
        </div>
      </div>
      
      <ChartContainer config={chartConfig} className="w-full h-[360px]">
        <BarChart
          accessibilityLayer
          layout="vertical"
          data={chartData}
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} vertical={true} />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatNumber(v)}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            width={160}
          />
          <ChartTooltip
            cursor={{ fill: '#f8fafc', radius: 4 }}
            content={<ChartTooltipContent hideIndicator={false} />}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

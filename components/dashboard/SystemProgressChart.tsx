'use client';

import {
  RadialBarChart,
  RadialBar,
  Legend,
  PolarAngleAxis,
} from 'recharts';
import { StatProgress } from '@/lib/types';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface SystemProgressChartProps {
  data: StatProgress[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function SystemProgressChart({ data }: SystemProgressChartProps) {
  // Filter out groups that don't have a target
  const chartData = data
    .filter(d => d.target !== null && d.target > 0)
    .map((d, i) => ({
      name: d.label,
      pct: Math.min(d.pct ?? 0, 150), // Cap at 150% for visual sanity in radial chart
      actualPct: d.pct ?? 0,
      achieved: d.achieved,
      target: d.target,
      fill: COLORS[i % COLORS.length]
    }));

  const chartConfig = {} satisfies ChartConfig;

  if (chartData.length === 0) {
    return (
      <div className="card p-5 flex flex-col justify-between h-full items-center text-center">
        <p className="text-slate-500 text-sm py-10">Chưa có dữ liệu chỉ tiêu để hiển thị biểu đồ</p>
      </div>
    );
  }

  return (
    <div className="card p-5 flex flex-col justify-between h-full">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-800">Tỷ lệ Hoàn thành (Toàn Thành phố)</h2>
        <p className="text-xs text-slate-400 mt-0.5">Tiến độ theo nhóm đối tượng</p>
      </div>
      
      <ChartContainer config={chartConfig} className="w-full h-[320px]">
        <RadialBarChart
          innerRadius="30%"
          outerRadius="100%"
          data={chartData}
          startAngle={90}
          endAngle={-270}
          barSize={16}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#f1f5f9' }}
            dataKey="pct"
            cornerRadius={10}
          />
          <ChartTooltip
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
                    <p className="text-sm font-semibold text-slate-700 mb-1">{data.name}</p>
                    <p className="text-xl font-bold" style={{ color: data.fill }}>
                      {data.actualPct}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {data.achieved.toLocaleString('vi-VN')} / {data.target.toLocaleString('vi-VN')}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadialBarChart>
      </ChartContainer>

      {/* Custom Legend */}
      <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-100">
        {chartData.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-xs font-medium text-slate-600">{entry.name}</span>
            </div>
            <span className="text-xs font-bold" style={{ color: entry.fill }}>
              {entry.actualPct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

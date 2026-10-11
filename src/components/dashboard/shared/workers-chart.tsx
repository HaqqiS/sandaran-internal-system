"use client";

import { IconUsers } from "@tabler/icons-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

export interface WorkerTrendData {
  date: string;
  totalWorkers: number;
}

interface WorkersChartProps {
  data: WorkerTrendData[];
  isLoading?: boolean;
  className?: string;
}

const chartConfig = {
  totalWorkers: {
    label: "Total Pekerja",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function WorkersChart({
  data,
  isLoading = false,
  className,
}: WorkersChartProps) {
  if (isLoading) {
    return (
      <Card className={cn("p-5 space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-[220px] w-full rounded-lg" />
      </Card>
    );
  }

  const hasData = data.some((d) => d.totalWorkers > 0);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="p-4 md:p-5 border-b pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <IconUsers className="h-4 w-4 text-primary shrink-0" />
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight">
              Tren Tenaga Kerja Lapangan
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Akumulasi pekerja harian di proyek aktif (30 Hari Terakhir)
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-5">
        {!hasData ? (
          <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
            Belum ada catatan tenaga kerja pada laporan harian 30 hari terakhir.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="workerFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
                tickFormatter={(val: string) => val}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="totalWorkers"
                type="monotone"
                fill="url(#workerFill)"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { IconCash } from "@tabler/icons-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Skeleton } from "~/components/ui/skeleton";
import { cn, formatIDR } from "~/lib/utils";

export interface MonthlyFundData {
  month: string;
  deposits: number;
  withdrawals: number;
}

interface FundFlowChartProps {
  data: MonthlyFundData[];
  totalBalance: number;
  monthlyWithdrawals: number;
  isLoading?: boolean;
  className?: string;
}

const chartConfig = {
  deposits: {
    label: "Kas Masuk (Deposit)",
    color: "var(--chart-1)",
  },
  withdrawals: {
    label: "Penarikan (Keluar)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function FundFlowChart({
  data,
  totalBalance,
  monthlyWithdrawals,
  isLoading = false,
  className,
}: FundFlowChartProps) {
  if (isLoading) {
    return (
      <Card className={cn("p-5 space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-[220px] w-full rounded-lg" />
      </Card>
    );
  }

  return (
    <Card
      className={cn("overflow-hidden flex flex-col justify-between", className)}
    >
      <CardHeader className="p-4 md:p-5 border-b pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCash className="h-4 w-4 text-primary shrink-0" />
            <CardTitle className="text-sm font-semibold tracking-tight">
              Posisi Dana Darurat
            </CardTitle>
          </div>
          <span className="text-xs font-semibold text-foreground">
            Saldo: {formatIDR(totalBalance)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
          <span>Arus Kas 6 Bulan Terakhir</span>
          <span>Penarikan Bulan Ini: {formatIDR(monthlyWithdrawals)}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-5">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(val: number) => {
                if (val >= 1_000_000)
                  return `${(val / 1_000_000).toFixed(0)} jt`;
                if (val >= 1_000) return `${(val / 1_000).toFixed(0)} rb`;
                return `${val}`;
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="text-muted-foreground">
                        {name === "deposits" ? "Deposit" : "Penarikan"}:
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatIDR(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="deposits"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="withdrawals"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

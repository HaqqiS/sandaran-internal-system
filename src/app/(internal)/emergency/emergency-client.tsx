"use client";

import { IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { PageLayout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { useEmergencyAnalytics } from "~/hooks";

const chartConfig = {
  deposit: {
    label: "Dana Masuk",
    color: "var(--chart-1)",
  },
  withdrawal: {
    label: "Penarikan",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function EmergencyClient() {
  const { data, isLoading } = useEmergencyAnalytics();

  if (isLoading) {
    return (
      <PageLayout title="Dana Darurat">
        <div className="flex h-full items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (!data?.projects.length) {
    return (
      <PageLayout title="Dana Darurat">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Belum ada proyek.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Dana Darurat">
      <div className="grid gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 md:p-6">
        {data.projects.map((project) => (
          <Card
            key={project.id}
            className="flex flex-col overflow-hidden transition-all hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="truncate font-bold text-lg">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5">
                    Saldo Saat Ini:
                    <span className="font-bold text-primary">
                      Rp {Number(project.balance).toLocaleString("id-ID")}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
              <div className="h-[180px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart accessibilityLayer data={project.monthlyActivity}>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      opacity={0.4}
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="deposit"
                      fill="var(--color-deposit)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="withdrawal"
                      fill="var(--color-withdrawal)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/projects/${project.slug}/emergency`}>
                  Lihat Detail
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}

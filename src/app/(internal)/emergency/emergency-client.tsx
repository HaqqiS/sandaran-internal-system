"use client";

import { IconLoader2 } from "@tabler/icons-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { PageLayout } from "~/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
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
    label: "Funding",
    color: "var(--foreground)",
  },
  withdrawal: {
    label: "Withdrawal",
    color: "var(--foreground)",
  },
} satisfies ChartConfig;

export function EmergencyClient() {
  const { data, isLoading } = useEmergencyAnalytics();

  if (isLoading) {
    return (
      <PageLayout title="Emergency Fund">
        <div className="flex h-full items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (!data?.projects.length) {
    return (
      <PageLayout title="Emergency Fund">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">No projects found.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Emergency Fund">
      <div className="grid gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 md:p-6">
        {data.projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="truncate font-medium">
                {project.name}
              </CardTitle>
              <CardDescription>
                Balance:{" "}
                <span className="font-bold text-foreground">
                  Rp {Number(project.balance).toLocaleString("id-ID")}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              <div className="h-[200px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart accessibilityLayer data={project.monthlyActivity}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="deposit"
                      fill="var(--color-deposit)"
                      radius={[4, 4, 0, 0]}
                      name="Funding"
                    />
                    <Bar
                      dataKey="withdrawal"
                      fill="var(--color-withdrawal)"
                      radius={[4, 4, 0, 0]}
                      name="Withdrawal"
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}

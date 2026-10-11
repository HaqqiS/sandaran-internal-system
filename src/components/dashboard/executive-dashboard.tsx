"use client";

import {
  IconAlertTriangle,
  IconBuildingSkyscraper,
  IconFileText,
  IconUsers,
} from "@tabler/icons-react";
import { useExecutiveOverview, useExecutiveTrends } from "~/hooks/useDashboard";
import {
  DashboardLayout,
  FundFlowChart,
  IssueFeed,
  MetricCard,
  PortfolioTable,
  StatsGrid,
  WorkersChart,
} from "./shared";

export function ExecutiveDashboard() {
  const {
    data: overview,
    isLoading: overviewLoading,
    isError: overviewError,
    refetch: refetchOverview,
  } = useExecutiveOverview();

  const { data: trends, isLoading: trendsLoading } = useExecutiveTrends();

  const kpis = overview?.kpis;

  return (
    <DashboardLayout
      title="Dashboard Eksekutif"
      description="Tinjauan menyeluruh portofolio proyek, progres riil vs jadwal kalender, tenaga kerja, dan arus kas."
    >
      {/* 1. Baris Kartu KPI Eksekutif */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 4 }}>
        <MetricCard
          label="Proyek Aktif"
          value={overviewLoading ? "-" : (kpis?.totalActiveProjects ?? 0)}
          caption={
            overviewLoading
              ? undefined
              : `Dari ${kpis?.totalProjects ?? 0} proyek terdaftar`
          }
          href="/projects"
          icon={IconBuildingSkyscraper}
          isLoading={overviewLoading}
          isError={overviewError}
          onRetry={() => void refetchOverview()}
        />

        <MetricCard
          label="Laporan 7 Hari"
          value={overviewLoading ? "-" : (kpis?.reportsLast7Days ?? 0)}
          previous={
            kpis !== undefined
              ? {
                  value: kpis.reportsPrevious7Days,
                  periodLabel: "dari pekan lalu",
                }
              : undefined
          }
          href="/reports"
          icon={IconFileText}
          isLoading={overviewLoading}
          isError={overviewError}
          onRetry={() => void refetchOverview()}
        />

        <MetricCard
          label="Pekerja Hari Ini"
          value={
            overviewLoading ? "-" : `${kpis?.totalWorkersToday ?? 0} Orang`
          }
          caption={
            overviewLoading
              ? undefined
              : `${kpis?.reportedProjectsTodayCount ?? 0} proyek melapor hari ini`
          }
          icon={IconUsers}
          isLoading={overviewLoading}
          isError={overviewError}
          onRetry={() => void refetchOverview()}
        />

        <MetricCard
          label="Kendala Dilaporkan"
          value={
            overviewLoading ? "-" : `${kpis?.recentIssuesCount ?? 0} Laporan`
          }
          caption="7 hari terakhir di lapangan"
          icon={IconAlertTriangle}
          tone={(kpis?.recentIssuesCount ?? 0) > 0 ? "attention" : "default"}
          isLoading={overviewLoading}
          isError={overviewError}
          onRetry={() => void refetchOverview()}
        />
      </StatsGrid>

      {/* 2. Portofolio Proyek: Waktu vs Progres Kumulatif */}
      <PortfolioTable projects={overview?.portfolio ?? []} />

      {/* 3. Split 2 Kolom: Feed Kendala & Posisi Kas Darurat */}
      <div className="grid gap-6 lg:grid-cols-2">
        <IssueFeed issues={overview?.recentIssues ?? []} />

        <FundFlowChart
          data={trends?.fundMonthly6m ?? []}
          totalBalance={overview?.fundSummary.totalBalance ?? 0}
          monthlyWithdrawals={overview?.fundSummary.monthlyWithdrawals ?? 0}
          isLoading={trendsLoading}
        />
      </div>

      {/* 4. Tren Tenaga Kerja Lapangan 30 Hari */}
      <WorkersChart
        data={trends?.workersDaily30d ?? []}
        isLoading={trendsLoading}
      />
    </DashboardLayout>
  );
}

"use client";

import {
  IconBuildingSkyscraper,
  IconCalendarCheck,
  IconCash,
  IconFileSpreadsheet,
  IconPackages,
  IconPlus,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import { ProjectDialog } from "~/components/project/project-dialog";
import { useAdminOverview } from "~/hooks/useDashboard";
import {
  AttentionList,
  DashboardLayout,
  MetricCard,
  QuickActionCard,
  StatsGrid,
} from "./shared";
import { PendingUsersCard } from "./shared/pending-users-card";
import { ProjectHealthTable } from "./shared/project-health-table";

export function AdminDashboard() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useAdminOverview();

  const counts = data?.counts;

  return (
    <DashboardLayout
      title="Dashboard Administrator"
      description="Kelola persetujuan anggota, pantau kepatuhan pelaporan, dan deteksi anomali operasional."
    >
      {/* 1. Attention List (Hanya muncul jika terdapat isu riil di sistem) */}
      <AttentionList items={data?.attention ?? []} />

      {/* 2. KPI Metrics Grid */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 4 }}>
        <MetricCard
          label="Proyek Aktif"
          value={isLoading ? "-" : `${counts?.activeProjects ?? 0} Aktif`}
          caption={
            isLoading
              ? undefined
              : `${counts?.pausedProjects ?? 0} tunda · ${counts?.doneProjects ?? 0} selesai`
          }
          href="/projects"
          icon={IconBuildingSkyscraper}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
        />

        <MetricCard
          label="Pengguna"
          value={isLoading ? "-" : `${counts?.activeUsers ?? 0} Aktif`}
          caption={
            isLoading
              ? undefined
              : `${counts?.pendingUsers ?? 0} tunggu · ${counts?.rejectedUsers ?? 0} ditolak`
          }
          href="/users"
          icon={IconUsers}
          tone={(counts?.pendingUsers ?? 0) > 0 ? "attention" : "default"}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
        />

        <MetricCard
          label="Lapor Hari Ini"
          value={
            isLoading
              ? "-"
              : `${counts?.reportedTodayCount ?? 0} dari ${counts?.activeProjects ?? 0}`
          }
          caption="proyek aktif sudah melapor"
          href="/reports"
          icon={IconCalendarCheck}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
        />

        <MetricCard
          label="Kas Belum Ditinjau"
          value={
            isLoading
              ? "-"
              : `${counts?.unreviewedEmergencyCount ?? 0} Transaksi`
          }
          caption="Pengajuan dana darurat butuh aksi"
          href="/emergency"
          icon={IconCash}
          tone={
            (counts?.unreviewedEmergencyCount ?? 0) > 0
              ? "attention"
              : "default"
          }
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
        />
      </StatsGrid>

      {/* 3. Main Split View: Pending Approvals & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <PendingUsersCard
            users={data?.pendingUsers ?? []}
            totalPendingCount={counts?.pendingUsers ?? 0}
          />
        </div>

        <div className="lg:col-span-3">
          <QuickActionCard
            title="Aksi Cepat"
            description="Akses instan fungsi manajemen sistem"
            actions={[
              {
                label: "Tinjau Pengguna Baru",
                icon: <IconUserCheck className="h-4 w-4" />,
                href: "/users",
                variant: "outline",
              },
              {
                label: "Buat Proyek Baru",
                icon: <IconPlus className="h-4 w-4" />,
                onClick: () => setIsCreateProjectOpen(true),
                variant: "outline",
              },
              {
                label: "Periksa Logistik & Stok",
                icon: <IconPackages className="h-4 w-4" />,
                href: "/logistics",
                variant: "outline",
              },
              {
                label: "Rekap Laporan Harian",
                icon: <IconFileSpreadsheet className="h-4 w-4" />,
                href: "/reports",
                variant: "outline",
              },
            ]}
          />
        </div>
      </div>

      {/* 4. Project Health Table */}
      <ProjectHealthTable projects={data?.projectHealth ?? []} />

      {/* Modal/Drawer Pembuatan Proyek Baru */}
      <ProjectDialog
        open={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
      />
    </DashboardLayout>
  );
}

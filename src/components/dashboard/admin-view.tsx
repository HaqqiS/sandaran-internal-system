"use client";

import {
  IconAlertTriangle,
  IconBuildingSkyscraper,
  IconCloud,
  IconPlus,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useAdminStats, useUserListWithFilter } from "~/hooks";
import { DashboardLayout } from "./shared/DashboardLayout";
import { QuickActionCard } from "./shared/QuickActionCard";
import { StatsGrid } from "./shared/StatsGrid";
import { StatCard } from "./stat-card";

export function AdminView() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: pendingUsers, isLoading: usersLoading } = useUserListWithFilter(
    { filter: "pending", search: "" },
  );

  return (
    <DashboardLayout
      title="Dashboard Admin"
      description="Manajemen sistem dan pengawasan"
    >
      {/* Top Stats */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 5 }}>
        <StatCard
          title="Proyek Aktif"
          value={stats?.activeProjects ?? 0}
          icon={IconBuildingSkyscraper}
          description="Sedang berlangsung"
          isLoading={statsLoading}
        />
        <StatCard
          title="Pengguna"
          value={stats?.totalUsers ?? 0}
          icon={IconUsers}
          description={`${stats?.activeUsers ?? 0} Aktif · ${stats?.pendingUsers ?? 0} Menunggu · ${stats?.rejectedUsers ?? 0} Ditolak`}
          variant={
            stats?.pendingUsers && stats.pendingUsers > 0
              ? "warning"
              : "default"
          }
          isLoading={statsLoading}
        />
        <StatCard
          title="Peringatan Logistik"
          value={stats?.lowStockItems ?? 0}
          icon={IconAlertTriangle}
          description="Barang butuh perhatian"
          isLoading={statsLoading}
        />
        <StatCard
          title="Penyimpanan"
          value="2.4 GB"
          icon={IconCloud}
          description="Kapasitas Cloudinary"
          trend={{ value: "+12%", label: "bulan ini", positive: false }}
          isLoading={statsLoading}
        />
      </StatsGrid>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pending Users Preview */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Persetujuan Pengguna</CardTitle>
                <CardDescription>
                  Pengguna terbaru yang menunggu aktivasi
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/users?tab=pending">Lihat Semua</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">
                  Memuat pengguna...
                </p>
              </div>
            ) : !pendingUsers?.length ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">
                  Tidak ada pengguna yang menunggu
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((user, index) => (
                  <div key={user.id}>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/users?highlight=${user.id}`}>Tinjau</Link>
                      </Button>
                    </div>
                    {index < pendingUsers.length - 1 && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="col-span-4 lg:col-span-3">
          <QuickActionCard
            title="Aksi Cepat"
            description="Tugas administratif umum"
            actions={[
              {
                label: "Tinjau Pengguna",
                icon: <IconUserCheck className="h-4 w-4" />,
                href: "/users?tab=pending",
                variant: "outline",
              },
              {
                label: "Buat Proyek Baru",
                icon: <IconPlus className="h-4 w-4" />,
                href: "/projects/new",
                variant: "outline",
              },
              {
                label: "Cek Stok Menipis",
                icon: <IconAlertTriangle className="h-4 w-4" />,
                href: "/logistics",
                variant: "outline",
              },
            ]}
          />
        </div>
      </div>

      {/* System Overview Placeholder */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle>Ringkasan Sistem</CardTitle>
          <CardDescription>
            Metrik aktivitas dan kesehatan sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <IconBuildingSkyscraper className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Grafik aktivitas sistem segera hadir...
            </p>
            <p className="text-xs text-muted-foreground">
              Pemantauan dan analitik real-time akan ditambahkan pada pembaruan
              mendatang
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

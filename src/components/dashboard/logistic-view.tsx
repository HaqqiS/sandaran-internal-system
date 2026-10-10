"use client";

import {
  IconBox,
  IconBuildingWarehouse,
  IconFolder,
  IconListCheck,
  IconPackage,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useLogisticRecentTransactions, useLogisticStats } from "~/hooks";
import { DashboardLayout } from "./shared/DashboardLayout";
import { QuickActionCard } from "./shared/QuickActionCard";
import { StatsGrid } from "./shared/StatsGrid";
import { StatCard } from "./stat-card";

export function LogisticView() {
  const { data: stats, isLoading: statsLoading } = useLogisticStats();
  const { data: recentTransactions, isLoading: txLoading } =
    useLogisticRecentTransactions(5);

  return (
    <DashboardLayout title="Dashboard Logistik">
      {/* Top Stats */}
      <StatsGrid cols={{ mobile: 2, tablet: 3, desktop: 3 }}>
        <StatCard
          title="Proyek Ditugaskan"
          value={stats?.projectCount ?? 0}
          icon={IconFolder}
          isLoading={statsLoading}
        />
        <StatCard
          title="Total Master Item"
          value={stats?.totalItems ?? 0}
          icon={IconPackage}
          description="Item material di semua proyek"
          isLoading={statsLoading}
        />
        <StatCard
          title="Mutasi Bulan Ini"
          value={stats?.monthlyTransactionsCount ?? 0}
          icon={IconBuildingWarehouse}
          description="Transaksi masuk & keluar"
          isLoading={statsLoading}
        />
      </StatsGrid>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Project Logistics Overview */}
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventaris Proyek</CardTitle>
              <CardDescription>
                Proyek aktif dengan pengelolaan stok material
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-sm text-muted-foreground">
                    Memuat data proyek...
                  </p>
                </div>
              ) : !stats?.projects.length ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-sm text-muted-foreground">
                    Belum ada proyek yang ditugaskan ke Anda sebagai Logistik.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.projects.map((project, index) => (
                    <div key={project.id}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-semibold">
                            {project.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {project._count.logistics} item material terdaftar
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" asChild>
                            <Link href={`/projects/${project.slug}/logistics`}>
                              <IconBox className="mr-1.5 size-4" />
                              Buka Logistik
                            </Link>
                          </Button>
                        </div>
                      </div>
                      {index < stats.projects.length - 1 && (
                        <Separator className="mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Navigation */}
        <div className="lg:col-span-3 col-span-4 space-y-4">
          <QuickActionCard
            title="Navigasi Cepat"
            description="Pintasan modul logistik"
            actions={[
              {
                label: "Lihat Semua Proyek",
                icon: <IconListCheck className="h-4 w-4" />,
                href: "/projects",
              },
            ]}
          />

          {/* Quick Tip Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Peran & Tanggung Jawab
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>
                Sebagai tim Logistik, Anda berwenang mengelola master data
                barang material (tambah, edit, hapus) dan mencatat mutasi stok
                masuk/keluar gudang proyek.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Mutasi Stok Terbaru</CardTitle>
          <CardDescription>
            Transaksi masuk (IN) dan keluar (OUT) material terbaru
          </CardDescription>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">
                Memuat riwayat transaksi...
              </p>
            </div>
          ) : !recentTransactions?.length ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">
                Belum ada transaksi logistik yang tercatat.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Proyek</TableHead>
                    <TableHead>Barang</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Petugas</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(tx.createdAt), "dd MMM yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/projects/${tx.item.project.slug}/logistics`}
                          className="hover:underline"
                        >
                          {tx.item.project.name}
                        </Link>
                      </TableCell>
                      <TableCell>{tx.item.name}</TableCell>
                      <TableCell>
                        {tx.type === "IN" ? (
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                          >
                            <IconTrendingUp className="mr-1 size-3" /> Masuk
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                          >
                            <IconTrendingDown className="mr-1 size-3" /> Keluar
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {tx.quantity} {tx.item.unit}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {tx.user.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {tx.notes ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

"use client";

import {
  IconArrowUpRight,
  IconChartBar,
  IconChecklist,
  IconFolder,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useCEOStats } from "~/hooks";
import { DashboardLayout } from "./shared/DashboardLayout";
import { StatsGrid } from "./shared/StatsGrid";
import { StatCard } from "./stat-card";

export function CEOView() {
  const { data: stats, isLoading } = useCEOStats();

  return (
    <DashboardLayout title="Ringkasan Eksekutif">
      {/* Top Stats */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 4 }}>
        <StatCard
          title="Total Proyek"
          value={stats?.totalProjects ?? 0}
          icon={IconFolder}
          isLoading={isLoading}
        />
        <StatCard
          title="Proyek Aktif"
          value={stats?.activeProjects ?? 0}
          icon={IconChecklist}
          isLoading={isLoading}
        />
        <StatCard
          title="Progres Keseluruhan"
          value="75%"
          icon={IconChartBar}
          description="Rata-rata proyek aktif"
          trend={{ value: "+5%", label: "bulan ini", positive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Kesehatan Keuangan"
          value="Sehat"
          icon={IconArrowUpRight}
          description="Berdasarkan pemakaian anggaran"
          trend={{ value: "Sesuai Target", label: "", positive: true }}
          isLoading={isLoading}
        />
      </StatsGrid>

      {/* Projects Overview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Proyek</CardTitle>
          <CardDescription>
            Status tingkat tinggi semua proyek yang sedang berjalan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Memuat proyek...</p>
            </div>
          ) : !stats?.projects.length ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Belum ada proyek.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Proyek</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Laporan (Total)</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {project.name}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                      ${
                        project.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : project.status === "DONE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                      >
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell>{project._count.dailyReports}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/projects/${project.slug}`}>
                            Lihat Detail
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/projects/${project.slug}/reports`}>
                            Lihat Laporan
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Future: Charts & Analytics Section */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle>Analitik & Tren</CardTitle>
          <CardDescription>Data historis dan metrik kinerja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <IconChartBar className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Grafik dan analisis tren segera hadir...
            </p>
            <p className="text-xs text-muted-foreground">
              Agregasi data historis akan ditambahkan pada pembaruan mendatang
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

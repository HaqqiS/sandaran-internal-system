"use client";

import { IconBuildingSkyscraper, IconLoader2 } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useUserOverview } from "~/hooks/useDashboard";
import { useSession } from "~/stores/use-session-store";
import {
  ArchitectLens,
  FinanceLens,
  LogisticLens,
  RoleLensTabs,
  type RoleLensType,
  SupervisorLens,
} from "./lenses";
import { DashboardLayout } from "./shared";

export function UserDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSession();

  const { data, isLoading, isError, refetch } = useUserOverview();

  const memberships = data?.memberships ?? [];

  // Hitung peran unik yang dimiliki user pada proyek-proyek aktif
  const availableRoles = useMemo<RoleLensType[]>(() => {
    const rolesOrder: RoleLensType[] = [
      "SUPERVISOR",
      "LOGISTIC",
      "FINANCE",
      "ARCHITECT",
    ];
    const userRoles = new Set(memberships.map((m) => m.role));
    return rolesOrder.filter((r) => userRoles.has(r));
  }, [memberships]);

  // Baca lens aktif dari query param ?lens=
  const urlLens = searchParams.get("lens")?.toUpperCase() as
    | RoleLensType
    | undefined;

  const activeRole: RoleLensType = useMemo(() => {
    if (urlLens && availableRoles.includes(urlLens)) {
      return urlLens;
    }
    return availableRoles[0] ?? "SUPERVISOR";
  }, [urlLens, availableRoles]);

  const handleRoleChange = (newRole: RoleLensType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lens", newRole.toLowerCase());
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Ringkasan Proyek & Peran untuk Subtitle
  const projectSummary = useMemo(() => {
    const projMap = new Map<string, string[]>();
    for (const m of memberships) {
      const roles = projMap.get(m.projectName) ?? [];
      roles.push(m.role);
      projMap.set(m.projectName, roles);
    }
    return Array.from(projMap.entries()).map(([name, roles]) => ({
      name,
      roles: roles.join(", "),
    }));
  }, [memberships]);

  if (isLoading) {
    return (
      <DashboardLayout
        title="Dashboard Pengguna"
        description="Memuat penugasan proyek dan data lensa peran Anda..."
      >
        <div className="flex h-64 items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Dashboard Pengguna">
        <Card className="p-8 text-center border-destructive/40 bg-destructive/5 space-y-3">
          <p className="text-sm font-semibold text-destructive">
            Gagal memuat data dashboard
          </p>
          <p className="text-xs text-muted-foreground">
            Terjadi kendala saat mengambil data penugasan proyek Anda.
          </p>
          <Button size="sm" variant="outline" onClick={() => void refetch()}>
            Coba Lagi
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  // State: Belum ditugaskan ke proyek aktif mana pun
  if (memberships.length === 0) {
    return (
      <DashboardLayout
        title="Dashboard Pengguna"
        description={`Selamat datang kembali, ${user?.name ?? "Pengguna"}.`}
      >
        <Card className="rounded-xl border border-dashed bg-muted/20 p-8 md:p-12 text-center space-y-3">
          <IconBuildingSkyscraper className="h-10 w-10 text-muted-foreground/60 mx-auto" />
          <h2 className="text-base font-semibold text-foreground">
            Belum Ditugaskan ke Proyek Aktif
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Akun Anda telah disetujui dan aktif, namun belum ada penugasan
            proyek yang terdaftar. Silakan hubungi Administrator untuk penugasan
            tim.
          </p>
        </Card>
      </DashboardLayout>
    );
  }

  const badgeCounts = {
    SUPERVISOR: data?.supervisor?.kpis.pendingReportsToday,
    LOGISTIC: data?.logistic?.kpis.negativeStockItemCount,
    FINANCE: data?.finance?.kpis.unreviewedCount,
    ARCHITECT: 0,
  };

  return (
    <DashboardLayout
      title="Dashboard Proyek Saya"
      description={`Selamat datang kembali, ${user?.name ?? "Pengguna"}.`}
    >
      {/* Header Penugasan Proyek Saya */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Penugasan Aktif:</span>
        {projectSummary.map((proj) => (
          <Badge
            key={proj.name}
            variant="outline"
            className="text-[11px] font-normal"
          >
            <span className="font-semibold text-foreground mr-1">
              {proj.name}
            </span>
            ({proj.roles})
          </Badge>
        ))}
      </div>

      {/* Tabs Lensa Peran (Sinkron URL ?lens=) */}
      <RoleLensTabs
        availableRoles={availableRoles}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        badges={badgeCounts}
      />

      {/* Render Lensa Aktif Sesuai Pilihan */}
      {activeRole === "SUPERVISOR" && data?.supervisor && (
        <SupervisorLens
          data={data.supervisor}
          onRefresh={() => void refetch()}
        />
      )}

      {activeRole === "LOGISTIC" && data?.logistic && (
        <LogisticLens data={data.logistic} onRefresh={() => void refetch()} />
      )}

      {activeRole === "FINANCE" && data?.finance && (
        <FinanceLens data={data.finance} onRefresh={() => void refetch()} />
      )}

      {activeRole === "ARCHITECT" && data?.architect && (
        <ArchitectLens data={data.architect} onRefresh={() => void refetch()} />
      )}
    </DashboardLayout>
  );
}

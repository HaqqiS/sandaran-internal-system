"use client";

import { IconLoader2 } from "@tabler/icons-react";
import {
  AdminDashboard,
  ExecutiveDashboard,
  UserDashboard,
} from "~/components/dashboard";
import { useUserRole } from "~/hooks/use-user-role";

export default function DashboardPage() {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Percabangan Bersih Berdasarkan roleGlobal (Fase 5 Switch Routing):
  // 1. ADMIN -> AdminDashboard (kelancaran sistem, staf proyek, persetujuan, anomali)
  if (role === "ADMIN") {
    return <AdminDashboard />;
  }

  // 2. EXECUTIVE -> ExecutiveDashboard (tinjauan portofolio eksekutif read-only & tren)
  if (role === "EXECUTIVE") {
    return <ExecutiveDashboard />;
  }

  // 3. USER -> UserDashboard (eksekusi harian pada proyek aktif via Role Lenses)
  return <UserDashboard />;
}

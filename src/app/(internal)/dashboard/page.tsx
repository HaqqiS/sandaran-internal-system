"use client";

import { IconLoader2 } from "@tabler/icons-react";
import {
  AdminView,
  ArchitectView,
  CEOView,
  FinanceView,
  MandorView,
} from "~/components/dashboard";
import { useUserRole } from "~/hooks/use-user-role";
import { useSession } from "~/stores/use-session-store";

export default function DashboardPage() {
  const { user } = useSession();
  const { isAdmin, isCEO, isMandor, isArchitect, isFinance, isLoading } =
    useUserRole();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If user has a role, show their dashboard
  if (isCEO || isAdmin || isMandor || isArchitect || isFinance) {
    return (
      <>
        {isCEO && <CEOView />}
        {isAdmin && !isCEO && <AdminView />}
        {isMandor && <MandorView />}
        {isArchitect && <ArchitectView />}
        {isFinance && <FinanceView />}
      </>
    );
  }

  // Fallback for users with no specific role
  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name ?? "User"}.
        </p>
      </div>

      <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
        <h3 className="text-lg font-medium">Hello, {user?.name}!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You are logged in, but you don't have any active project roles
          assigned yet.
          <br />
          Please contact an administrator to be assigned to a project.
        </p>
      </div>
    </div>
  );
}

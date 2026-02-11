"use client"

import {
  AdminView,
  ArchitectView,
  CEOView,
  FinanceView,
  MandorView,
} from "~/components/dashboard"
import { useUserRole } from "~/hooks/use-user-role"
import { useSession } from "~/stores/use-session-store"

export default function DashboardPage() {
  const { user } = useSession()
  const { isAdmin, isCEO, isMandor, isArchitect, isFinance, isLoading } =
    useUserRole()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading specific dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name ?? "User"}. Here's what's happening today.
        </p>
      </div>

      <div className="space-y-10">
        {/* CEO View */}
        {isCEO && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Executive Overview</h2>
            </div>
            <CEOView />
          </section>
        )}

        {/* Admin View */}
        {isAdmin && !isCEO && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">System Administration</h2>
            </div>
            <AdminView />
          </section>
        )}

        {/* Mandor View */}
        {isMandor && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Field Operations</h2>
            </div>
            <MandorView />
          </section>
        )}

        {/* Architect View */}
        {isArchitect && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Design & Documents</h2>
            </div>
            <ArchitectView />
          </section>
        )}

        {/* Finance View */}
        {isFinance && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Financial Approvals</h2>
            </div>
            <FinanceView />
          </section>
        )}

        {/* Fallback for users with no specific role data yet */}
        {!isAdmin && !isCEO && !isMandor && !isArchitect && !isFinance && (
          <div className="rounded-lg border border-dashed p-8 text-center bg-muted/30">
            <h3 className="text-lg font-medium">Hello, {user?.name}!</h3>
            <p className="text-sm text-muted-foreground mt-2">
              You are logged in, but you don't have any active project roles
              assigned yet.
              <br />
              Please contact an administrator to be assigned to a project.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

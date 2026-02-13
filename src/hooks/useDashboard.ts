import { api } from "~/trpc/react"

/**
 * Dashboard Hooks
 *
 * Consolidated hooks for all role-based dashboards
 */

// ============================================
// CEO Dashboard Hooks
// ============================================

export function useCEOStats() {
  return api.dashboard.getCEOStats.useQuery()
}

export function useCEORecentReports(limit?: number) {
  return api.dashboard.getCEORecentReports.useQuery({ limit })
}

// ============================================
// Admin Dashboard Hooks
// ============================================

export function useAdminStats() {
  return api.dashboard.getAdminStats.useQuery()
}

export function useAdminPendingUsers(limit?: number) {
  return api.user.getPendingUsers.useQuery({ limit })
}

// ============================================
// Finance Dashboard Hooks
// ============================================

export function useFinanceStats() {
  return api.dashboard.getFinanceStats.useQuery()
}

export function useFinanceFundBreakdown() {
  return api.dashboard.getEmergencyFundBreakdown.useQuery()
}

export function useFinanceRecentTransactions(
  limit?: number,
  status?: "UNREVIEWED" | "REVIEWED",
) {
  return api.emergency.getRecentTransactions.useQuery({ limit, status })
}

// ============================================
// Mandor Dashboard Hooks
// ============================================

export function useMandorStats() {
  return api.dashboard.getMandorStats.useQuery()
}

export function useMandorRecentReports(limit?: number) {
  return api.dashboard.getMandorRecentReports.useQuery({ limit })
}

// ============================================
// Architect Dashboard Hooks
// ============================================

export function useArchitectStats() {
  return api.dashboard.getArchitectStats.useQuery()
}

export function useArchitectDashboard() {
  return api.dashboard.getArchitectDashboard.useQuery()
}

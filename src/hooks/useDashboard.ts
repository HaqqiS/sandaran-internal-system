import { api } from "~/trpc/react";

/**
 * Dashboard Hooks
 *
 * Consolidated hooks for all role-based dashboards
 */

// ============================================
// Executive Dashboard Hooks (formerly CEO)
// ============================================

export function useExecutiveOverview() {
  return api.dashboard.getExecutiveOverview.useQuery();
}

export function useExecutiveTrends() {
  return api.dashboard.getExecutiveTrends.useQuery();
}

export function useExecutiveStats() {
  return api.dashboard.getExecutiveStats.useQuery();
}

export function useExecutiveRecentReports(limit?: number) {
  return api.dashboard.getExecutiveRecentReports.useQuery({ limit });
}

// ============================================
// Admin Dashboard Hooks
// ============================================

export function useAdminOverview() {
  return api.dashboard.getAdminOverview.useQuery();
}

export function useAdminStats() {
  return api.dashboard.getAdminStats.useQuery();
}

// ============================================
// Finance Dashboard Hooks
// ============================================

export function useFinanceStats() {
  return api.dashboard.getFinanceStats.useQuery();
}

export function useFinanceFundBreakdown() {
  return api.dashboard.getEmergencyFundBreakdown.useQuery();
}

export function useFinanceRecentTransactions(
  limit?: number,
  status?: "UNREVIEWED" | "REVIEWED",
) {
  return api.emergency.getRecentTransactions.useQuery({ limit, status });
}

// ============================================
// Supervisor Dashboard Hooks (formerly Mandor)
// ============================================

export function useSupervisorStats() {
  return api.dashboard.getSupervisorStats.useQuery();
}

export function useSupervisorRecentReports(limit?: number) {
  return api.dashboard.getSupervisorRecentReports.useQuery({ limit });
}

// Backward compatibility aliases
export const useMandorStats = useSupervisorStats;
export const useMandorRecentReports = useSupervisorRecentReports;

// ============================================
// Architect Dashboard Hooks
// ============================================

export function useArchitectStats() {
  return api.dashboard.getArchitectStats.useQuery();
}

export function useArchitectDashboard() {
  return api.dashboard.getArchitectDashboard.useQuery();
}

// ============================================
// Logistic Dashboard Hooks
// ============================================

export function useLogisticStats() {
  return api.dashboard.getLogisticStats.useQuery();
}

export function useLogisticRecentTransactions(limit?: number) {
  return api.dashboard.getLogisticRecentTransactions.useQuery({ limit });
}

// ============================================
// User Multi-Role Overview Hook (Remodel Fase 4)
// ============================================

export function useUserOverview() {
  return api.dashboard.getUserOverview.useQuery();
}

import type { auth } from "~/server/better-auth"
import type { GlobalRole } from "../../generated/prisma"

type Session = typeof auth.$Infer.Session

/**
 * Check if user has an authorized role (not NONE)
 */
export function isAuthorizedRole(role: GlobalRole | null | undefined): boolean {
  if (!role) return false
  return role === "ADMIN" || role === "CEO" || role === "USER"
}

/**
 * Check if user is active
 */
export function isActiveUser(isActive: boolean | null | undefined): boolean {
  return isActive === true
}

/**
 * Check if user is approved (has approvedAt timestamp)
 */
export function isApprovedUser(approvedAt: Date | null | undefined): boolean {
  return approvedAt !== null && approvedAt !== undefined
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(role: GlobalRole | null | undefined): boolean {
  if (!role) return false
  return role === "ADMIN" || role === "CEO"
}

/**
 * Validate if session is authorized to access the system
 * Returns object with validation result and reason
 */
export function validateSessionAccess(session: Session | null): {
  isValid: boolean
  reason?: "no_session" | "inactive" | "unauthorized_role" | "not_approved"
  redirectTo?: string
} {
  // No session
  if (!session?.user) {
    return {
      isValid: false,
      reason: "no_session",
      redirectTo: "/",
    }
  }

  const { roleGlobal, isActive } = session.user

  // Check if user is active
  if (!isActiveUser(isActive)) {
    return {
      isValid: false,
      reason: "inactive",
      redirectTo: "/waiting-approval",
    }
  }

  // Check if user has authorized role
  if (!isAuthorizedRole(roleGlobal as GlobalRole)) {
    return {
      isValid: false,
      reason: "unauthorized_role",
      redirectTo: "/unauthorized",
    }
  }

  return { isValid: true }
}

/**
 * Get allowed roles as array
 */
export const ALLOWED_ROLES: GlobalRole[] = ["ADMIN", "CEO", "USER"]

/**
 * Get admin roles as array
 */
export const ADMIN_ROLES: GlobalRole[] = ["ADMIN", "CEO"]

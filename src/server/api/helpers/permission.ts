/**
 * Permission Helper Functions
 *
 * These functions provide reusable permission checks for Layer 3 (Project Context Guard).
 * Use these in tRPC routers to enforce project-scoped permissions.
 *
 */

import { TRPCError } from "@trpc/server"
import type { GlobalRole, PrismaClient, ProjectRole } from "generated/prisma"

/**
 * Get the project role of a user in a specific project.
 *
 * @param db - Prisma client instance
 * @param userId - User ID to check
 * @param projectId - Project ID to check
 * @returns ProjectRole if user is a member, null otherwise
 *
 * @example
 * const role = await getProjectRole(db, userId, projectId);
 * if (role === "MANDOR") {
 *   // User is MANDOR in this project
 * }
 */
export async function getProjectRole(
  db: PrismaClient,
  userId: string,
  projectId: string,
): Promise<ProjectRole | null> {
  const member = await db.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
  })

  return member?.role ?? null
}

/**
 * Require that a user is a member of a project.
 * Throws FORBIDDEN error if user is not a member.
 *
 * @param db - Prisma client instance
 * @param userId - User ID to check
 * @param projectId - Project ID to check
 * @returns ProjectRole of the user
 * @throws TRPCError with code FORBIDDEN if user is not a member
 *
 * @example
 * const role = await requireProjectMembership(db, userId, projectId);
 * // If we reach here, user is definitely a member
 */
export async function requireProjectMembership(
  db: PrismaClient,
  userId: string,
  projectId: string,
): Promise<ProjectRole> {
  const role = await getProjectRole(db, userId, projectId)

  if (!role) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of this project",
    })
  }

  return role
}

/**
 * Require that a user has one of the allowed roles in a project.
 * Throws FORBIDDEN error if user is not a member or doesn't have the required role.
 *
 * @param db - Prisma client instance
 * @param userId - User ID to check
 * @param projectId - Project ID to check
 * @param allowedRoles - Array of allowed ProjectRoles
 * @returns ProjectRole of the user
 * @throws TRPCError with code FORBIDDEN if user doesn't have required role
 *
 * @example
 * // Only MANDOR and FINANCE can proceed
 * const role = await requireProjectRole(
 *   db,
 *   userId,
 *   projectId,
 *   ["MANDOR", "FINANCE"]
 * );
 */
export async function requireProjectRole(
  db: PrismaClient,
  userId: string,
  projectId: string,
  allowedRoles: ProjectRole[],
): Promise<ProjectRole> {
  const role = await requireProjectMembership(db, userId, projectId)

  if (!allowedRoles.includes(role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `This action requires one of the following roles: ${allowedRoles.join(", ")}`,
    })
  }

  return role
}

/**
 * Require that a user owns a resource (or is ADMIN).
 * ADMIN users bypass ownership checks.
 *
 * @param entity - Entity with userId field
 * @param currentUserId - Current user's ID
 * @param globalRole - Current user's global role
 * @throws TRPCError with code FORBIDDEN if user doesn't own the resource
 *
 * @example
 * const report = await db.dailyReport.findUnique({ where: { id } });
 * requireOwnership(report, ctx.session.user.id, ctx.session.user.roleGlobal);
 * // If we reach here, user owns the report or is ADMIN
 */
export function requireOwnership(
  entity: { userId: string } | null | undefined,
  currentUserId: string,
  globalRole: string | null | undefined,
): void {
  // ADMIN bypasses ownership check
  if (globalRole === "ADMIN") {
    return
  }

  if (!entity) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Resource not found",
    })
  }

  if (entity.userId !== currentUserId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You can only modify your own resources",
    })
  }
}

/**
 * Check if a user is ADMIN or CEO (for global access).
 *
 * @param globalRole - User's global role
 * @returns true if user is ADMIN or CEO
 *
 * @example
 * if (isAdminOrCEO(ctx.session.user.roleGlobal)) {
 *   // User has global access
 * }
 */
export function isAdminOrCEO(globalRole: GlobalRole): boolean {
  return globalRole === "ADMIN" || globalRole === "CEO"
}

/**
 * Require that a user is ADMIN (not CEO).
 * Use this for mutations that even CEO shouldn't be able to do.
 *
 * @param globalRole - User's global role
 * @throws TRPCError with code FORBIDDEN if user is not ADMIN
 *
 * @example
 * requireAdmin(ctx.session.user.roleGlobal);
 * // Only ADMIN can proceed
 */
export function requireAdmin(globalRole: GlobalRole): void {
  if (globalRole !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    })
  }
}

/**
 * Check if CEO is attempting a forbidden mutation.
 * CEO can only do specific mutations (profile edit, comments).
 *
 * @param globalRole - User's global role
 * @param action - Action code being attempted
 * @throws TRPCError with code FORBIDDEN if CEO attempts forbidden mutation
 *
 * @example
 * checkCEORestriction(
 *   ctx.session.user.roleGlobal,
 *   "REPORT_CREATE"
 * );
 * // Throws error if CEO tries to create report
 */
export function checkCEORestriction(
  globalRole: string | null | undefined,
  action: string,
): void {
  if (globalRole !== "CEO") {
    return // Not CEO, no restriction
  }

  // Actions CEO is allowed to do
  const allowedCEOActions = [
    "PROFILE_EDIT_OWN",
    "REPORT_COMMENT_CREATE",
    // Add more as needed
  ]

  if (!allowedCEOActions.includes(action)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "CEO has read-only access to project operations",
    })
  }
}

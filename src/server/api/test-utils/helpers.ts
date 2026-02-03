import { TRPCError } from "@trpc/server"
import type { Session } from "generated/prisma"
import { expect } from "vitest"
import { db } from "~/server/db"

// Define Context type locally since it's not exported from trpc.ts
type Context = {
  headers: Headers
  db: typeof db
  session: {
    session: Session
    user: {
      id: string
      name: string
      email: string
      roleGlobal: "ADMIN" | "CEO" | "USER" | "NONE"
      isActive: boolean
    }
  } | null
  projectId?: string
  projectRole?: "MANDOR" | "ARCHITECT" | "FINANCE" | null
}

/**
 * Test Helper Functions
 *
 * Utilities for creating mock contexts and asserting errors.
 */

// ==================== CONTEXT CREATORS ====================

/**
 * Create a mock tRPC context for testing
 */
export function createMockContext(
  user: {
    id: string
    name: string
    email: string
    roleGlobal: "ADMIN" | "CEO" | "USER" | "NONE"
    isActive: boolean
  },
  projectId?: string,
  projectRole?: "MANDOR" | "ARCHITECT" | "FINANCE" | null,
): Context {
  const session: Session & {
    user: typeof user
  } = {
    id: `session-${Date.now()}`,
    token: `token-${Date.now()}`,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: "127.0.0.1",
    userAgent: "test-agent",
    userId: user.id,
    user,
  }

  const ctx: Context = {
    headers: new Headers(),
    db,
    session: {
      session,
      user,
    },
  }

  // If projectId and projectRole are provided, extend context
  if (projectId && projectRole !== undefined) {
    return {
      ...ctx,
      projectId,
      projectRole,
    }
  }

  return ctx
}

/**
 * Create ADMIN context
 */
export function createAdminContext(user: {
  id: string
  name: string
  email: string
}): Context {
  return createMockContext({
    ...user,
    roleGlobal: "ADMIN",
    isActive: true,
  })
}

/**
 * Create CEO context
 */
export function createCEOContext(user: {
  id: string
  name: string
  email: string
}): Context {
  return createMockContext({
    ...user,
    roleGlobal: "CEO",
    isActive: true,
  })
}

/**
 * Create USER context with optional project role
 */
export function createUserContext(
  user: {
    id: string
    name: string
    email: string
  },
  projectId?: string,
  projectRole?: "MANDOR" | "ARCHITECT" | "FINANCE",
): Context {
  if (projectId && projectRole) {
    return createMockContext(
      {
        ...user,
        roleGlobal: "USER",
        isActive: true,
      },
      projectId,
      projectRole,
    )
  }

  return createMockContext({
    ...user,
    roleGlobal: "USER",
    isActive: true,
  })
}

/**
 * Create inactive user context
 */
export function createInactiveContext(user: {
  id: string
  name: string
  email: string
}): Context {
  return createMockContext({
    ...user,
    roleGlobal: "USER",
    isActive: false,
  })
}

/**
 * Create unauthenticated context (no session)
 */
export function createUnauthenticatedContext(): Context {
  return {
    headers: new Headers(),
    db,
    session: null,
  }
}

// ==================== ASSERTION HELPERS ====================

/**
 * Assert that a promise throws FORBIDDEN error
 */
export async function expectForbidden(
  promise: Promise<unknown>,
  message?: string,
) {
  await expect(promise).rejects.toThrow(TRPCError)
  await expect(promise).rejects.toMatchObject({
    code: "FORBIDDEN",
    ...(message && { message }),
  })
}

/**
 * Assert that a promise throws UNAUTHORIZED error
 */
export async function expectUnauthorized(
  promise: Promise<unknown>,
  message?: string,
) {
  await expect(promise).rejects.toThrow(TRPCError)
  await expect(promise).rejects.toMatchObject({
    code: "UNAUTHORIZED",
    ...(message && { message }),
  })
}

/**
 * Assert that a promise throws NOT_FOUND error
 */
export async function expectNotFound(
  promise: Promise<unknown>,
  message?: string,
) {
  await expect(promise).rejects.toThrow(TRPCError)
  await expect(promise).rejects.toMatchObject({
    code: "NOT_FOUND",
    ...(message && { message }),
  })
}

/**
 * Assert that a promise throws BAD_REQUEST error
 */
export async function expectBadRequest(
  promise: Promise<unknown>,
  message?: string,
) {
  await expect(promise).rejects.toThrow(TRPCError)
  await expect(promise).rejects.toMatchObject({
    code: "BAD_REQUEST",
    ...(message && { message }),
  })
}

/**
 * Assert that a promise resolves successfully
 */
export async function expectSuccess<T>(promise: Promise<T>): Promise<T> {
  const result = await promise
  expect(result).toBeDefined()
  return result
}

/**
 * Assert that a value is truthy
 */
export function expectTruthy<T>(
  value: T | null | undefined,
): asserts value is T {
  expect(value).toBeTruthy()
}

/**
 * Assert that a value is defined (not null or undefined)
 */
export function expectDefined<T>(
  value: T | null | undefined,
): asserts value is T {
  expect(value).toBeDefined()
  expect(value).not.toBeNull()
}

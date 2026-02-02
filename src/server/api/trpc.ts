/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC, TRPCError } from "@trpc/server"
import type { ProjectRole } from "generated/prisma"
import superjson from "superjson"
import { ZodError } from "zod"

import { auth } from "~/server/better-auth"
import { db } from "~/server/db"

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  })
  return {
    db,
    session,
    ...opts,
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now()

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }

  const result = await next()

  const end = Date.now()
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`)

  return result
})

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware)

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users with authorized roles,
 * use this. It verifies the session is valid, checks if user is active, and validates role.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      })
    }

    const { roleGlobal, isActive } = ctx.session.user

    // Check if user is active
    if (!isActive) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Account is not active. Please wait for admin approval.",
      })
    }

    // Check if user has authorized role (not NONE)
    if (roleGlobal === "NONE") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to access this system.",
      })
    }

    // Only allow ADMIN, CEO, USER roles
    if (
      roleGlobal !== "ADMIN" &&
      roleGlobal !== "CEO" &&
      roleGlobal !== "USER"
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Invalid role. Access denied.",
      })
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    })
  })

/**
 * Admin-only procedure
 *
 * Only accessible to users with ADMIN or CEO role.
 * Use this for sensitive operations like user management, approvals, etc.
 */
export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      })
    }

    const { roleGlobal, isActive } = ctx.session.user

    // Check if user is active
    if (!isActive) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Account is not active.",
      })
    }

    // Check if user has admin role
    if (roleGlobal !== "ADMIN" && roleGlobal !== "CEO") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required.",
      })
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable with admin role
        session: { ...ctx.session, user: ctx.session.user },
      },
    })
  })

/**
 * Project-scoped procedure factory (Layer 3: Project Context Guard)
 *
 * Creates procedures that require project membership and specific roles.
 * This implements the final layer of permission checking.
 *
 * @param allowedRoles - Array of ProjectRoles that can access this procedure
 * @param options - Additional options for the procedure
 * @returns A procedure builder with project context
 *
 * @example
 * // Only MANDOR and FINANCE can access
 * export const mandorFinanceProcedure = createProjectProcedure(["MANDOR", "FINANCE"]);
 *
 * // Use in router
 * mandorFinanceProcedure
 *   .input(z.object({ projectId: z.string(), ... }))
 *   .mutation(async ({ ctx, input }) => {
 *     // ctx.projectRole is guaranteed to be MANDOR or FINANCE
 *     // ctx.projectId is available
 *   })
 */
export const projectProcedure = (
  allowedRoles: ProjectRole[],
  options?: {
    allowCEO?: boolean // Allow CEO to perform mutations (default: false)
  },
) => {
  return protectedProcedure.use(async ({ ctx, next, input, type }) => {
    // Extract projectId from input
    const projectId = (input as { projectId?: string })?.projectId

    if (!projectId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "projectId is required in input",
      })
    }

    const { id: userId, roleGlobal } = ctx.session.user

    // ADMIN and CEO have special access
    const isAdminOrCEO = roleGlobal === "ADMIN" || roleGlobal === "CEO"

    // Get user's project role
    const member = await ctx.db.projectMember.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    })

    // Check if user is a project member (unless ADMIN/CEO)
    if (!member && !isAdminOrCEO) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not a member of this project",
      })
    }

    const projectRole = member?.role

    // Verify user has one of the allowed roles (unless ADMIN)
    if (
      roleGlobal !== "ADMIN" &&
      projectRole &&
      !allowedRoles.includes(projectRole)
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `This action requires one of the following roles: ${allowedRoles.join(", ")}`,
      })
    }

    // CEO read-only enforcement (unless explicitly allowed)
    if (roleGlobal === "CEO" && !options?.allowCEO) {
      // Check if this is a mutation (write operation)
      const isMutation = type === "mutation"

      if (isMutation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "CEO has read-only access to project operations",
        })
      }
    }

    return next({
      ctx: {
        ...ctx,
        projectId,
        projectRole: projectRole ?? null,
      },
    })
  })
}

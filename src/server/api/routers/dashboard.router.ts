import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc"

export const dashboardRouter = createTRPCRouter({
  /**
   * Get stats for ADMIN dashboard
   */
  getAdminStats: adminProcedure.query(async ({ ctx }) => {
    // 1. Count active projects
    const activeProjects = await ctx.db.project.count({
      where: { status: "ACTIVE" },
    })

    // 2. Count pending users (inactive)
    const pendingUsers = await ctx.db.user.count({
      where: { isActive: false },
    })

    // 3. Count total users
    const totalUsers = await ctx.db.user.count()

    // 4. Get recent logistics alerts (low stock - placeholder logic for now)
    // For now just return count of items
    const lowStockItems = await ctx.db.logisticItem.count()

    return {
      activeProjects,
      pendingUsers,
      totalUsers,
      lowStockItems,
    }
  }),

  /**
   * Get stats for CEO dashboard
   */
  getCEOStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if CEO
    if (ctx.session.user.roleGlobal !== "CEO") {
      throw new Error("Unauthorized")
    }

    const projects = await ctx.db.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        _count: {
          select: {
            dailyReports: true,
          },
        },
      },
    })

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === "ACTIVE").length,
      projects,
    }
  }),

  /**
   * Get stats for MNDOR dashboard
   * Returns data for projects where user is MANDOR
   */
  getMandorStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    // Find projects where user is MANDOR
    const projects = await ctx.db.project.findMany({
      where: {
        members: {
          some: {
            userId,
            role: "MANDOR",
          },
        },
      },
      include: {
        _count: {
          select: {
            dailyReports: true,
          },
        },
      },
    })

    return {
      projectCount: projects.length,
      projects,
      // Placeholder for "reports due today" logic
      reportsDue: projects.length,
    }
  }),

  /**
   * Get stats for ARCHITECT dashboard
   */
  getArchitectStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const projects = await ctx.db.project.findMany({
      where: {
        members: {
          some: {
            userId,
            role: "ARCHITECT",
          },
        },
      },
    })

    const myDocuments = await ctx.db.projectDocument.count({
      where: { userId },
    })

    return {
      projectCount: projects.length,
      uploadedDocuments: myDocuments,
    }
  }),

  /**
   * Get stats for FINANCE dashboard
   */
  getFinanceStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    // Projects where user is FINANCE
    const projects = await ctx.db.project.findMany({
      where: {
        members: {
          some: {
            userId,
            role: "FINANCE",
          },
        },
      },
      select: { id: true },
    })

    const projectIds = projects.map((p) => p.id)

    // Count pending emergency requests for these projects
    const pendingEmergency = await ctx.db.emergencyTransaction.count({
      where: {
        fund: { projectId: { in: projectIds } },
        status: "UNREVIEWED",
      },
    })

    return {
      pendingApprovals: pendingEmergency,
    }
  }),
})

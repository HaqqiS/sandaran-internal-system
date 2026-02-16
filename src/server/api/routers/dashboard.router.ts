import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  /**
   * Get stats for ADMIN dashboard
   */
  getAdminStats: adminProcedure.query(async ({ ctx }) => {
    // 1. Count active projects
    const activeProjects = await ctx.db.project.count({
      where: { status: "ACTIVE" },
    });

    // 2. Count users by status
    const [activeUsers, pendingUsers, rejectedUsers] = await Promise.all([
      ctx.db.user.count({ where: { isActive: true } }),
      ctx.db.user.count({ where: { isActive: false, reviewedAt: null } }),
      ctx.db.user.count({
        where: { isActive: false, reviewedAt: { not: null } },
      }),
    ]);

    const totalUsers = activeUsers + pendingUsers + rejectedUsers;

    // 3. Get recent logistics alerts (low stock - placeholder logic for now)
    // For now just return count of items
    const lowStockItems = await ctx.db.logisticItem.count();

    return {
      activeProjects,
      activeUsers,
      pendingUsers,
      rejectedUsers,
      totalUsers,
      lowStockItems,
    };
  }),

  /**
   * Get stats for CEO dashboard
   */
  getCEOStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if CEO
    if (ctx.session.user.roleGlobal !== "CEO") {
      throw new Error("Unauthorized");
    }

    const projects = await ctx.db.project.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        _count: {
          select: {
            dailyReports: true,
          },
        },
      },
    });

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === "ACTIVE").length,
      projects,
    };
  }),

  /**
   * Get recent reports across all projects (CEO only)
   */
  getCEORecentReports: protectedProcedure
    .input(z.object({ limit: z.number().default(5).optional() }))
    .query(async ({ ctx, input }) => {
      // Check if CEO
      if (ctx.session.user.roleGlobal !== "CEO") {
        throw new Error("Unauthorized");
      }

      const reports = await ctx.db.dailyReport.findMany({
        take: input.limit ?? 5,
        orderBy: { reportDate: "desc" },
        select: {
          id: true,
          slug: true,
          reportDate: true,
          taskDescription: true,
          progressPercent: true,
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return reports;
    }),

  /**
   * Get stats for MANDOR dashboard
   * Returns data for projects where user is MANDOR
   */
  getMandorStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find projects where user is MANDOR
    const projects = await ctx.db.project.findMany({
      where: {
        members: {
          some: {
            userId,
            role: "MANDOR",
          },
        },
        status: "ACTIVE", // Only active projects need reports
      },
      include: {
        _count: {
          select: {
            dailyReports: true,
          },
        },
        dailyReports: {
          where: {
            reportDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    // Calculate reports due: Active projects minus those that already have a report today
    const reportsDue =
      projects.length -
      projects.filter((p) => p.dailyReports.length > 0).length;

    return {
      projectCount: projects.length,
      projects,
      reportsDue,
    };
  }),

  /**
   * Get recent reports for MANDOR with media thumbnails
   */
  getMandorRecentReports: protectedProcedure
    .input(z.object({ limit: z.number().default(3).optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get projects where user is MANDOR
      const projectIds = await ctx.db.projectMember
        .findMany({
          where: { userId, role: "MANDOR" },
          select: { projectId: true },
        })
        .then((members) => members.map((m) => m.projectId));

      if (!projectIds.length) return [];

      const reports = await ctx.db.dailyReport.findMany({
        where: {
          projectId: { in: projectIds },
          userId,
        },
        take: input.limit ?? 3,
        orderBy: { reportDate: "desc" },
        select: {
          id: true,
          slug: true,
          reportDate: true,
          taskDescription: true,
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          media: {
            take: 1,
            select: {
              url: true,
              publicId: true,
            },
          },
        },
      });

      return reports.map((report) => ({
        ...report,
        thumbnail: report.media[0]?.url ?? null,
      }));
    }),

  /**
   * Get stats for ARCHITECT dashboard
   */
  getArchitectStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const projects = await ctx.db.project.findMany({
      where: {
        members: {
          some: {
            userId,
            role: "ARCHITECT",
          },
        },
      },
    });

    const myDocuments = await ctx.db.projectDocument.count({
      where: { userId },
    });

    return {
      projectCount: projects.length,
      uploadedDocuments: myDocuments,
    };
  }),

  /**
   * Get architect dashboard data: documents by project + recent reports
   */
  getArchitectDashboard: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get projects where user is ARCHITECT
    const projectIds = await ctx.db.projectMember
      .findMany({
        where: { userId, role: "ARCHITECT" },
        select: { projectId: true },
      })
      .then((members) => members.map((m) => m.projectId));

    if (!projectIds.length) {
      return { documentsByProject: [], recentReports: [] };
    }

    // Get documents grouped by project
    const projects = await ctx.db.project.findMany({
      where: { id: { in: projectIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { documents: true },
        },
      },
    });

    const documentsByProject = projects.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      documentCount: p._count.documents,
    }));

    // Get recent reports from these projects
    const recentReports = await ctx.db.dailyReport.findMany({
      where: { projectId: { in: projectIds } },
      take: 5,
      orderBy: { reportDate: "desc" },
      select: {
        id: true,
        slug: true,
        reportDate: true,
        taskDescription: true,
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      documentsByProject,
      recentReports,
    };
  }),

  /**
   * Get stats for FINANCE dashboard
   */
  getFinanceStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

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
    });

    const projectIds = projects.map((p) => p.id);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count pending emergency requests for these projects
    const pendingEmergency = await ctx.db.emergencyTransaction.count({
      where: {
        fund: { projectId: { in: projectIds } },
        status: "UNREVIEWED",
      },
    });

    // Sum monthly withdrawals (approved/reviewed only)
    const monthlyWithdrawals = await ctx.db.emergencyTransaction.aggregate({
      where: {
        fund: { projectId: { in: projectIds } },
        type: "WITHDRAWAL",
        status: "REVIEWED",
        createdAt: { gte: startOfMonth },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      pendingApprovals: pendingEmergency,
      monthlyWithdrawals: monthlyWithdrawals._sum.amount ?? 0,
    };
  }),

  /**
   * Get emergency fund breakdown by project (Finance only)
   */
  getEmergencyFundBreakdown: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get projects where user is FINANCE
    const projectIds = await ctx.db.projectMember
      .findMany({
        where: { userId, role: "FINANCE" },
        select: { projectId: true },
      })
      .then((members) => members.map((m) => m.projectId));

    if (!projectIds.length) return [];

    // Get emergency funds for these projects
    const funds = await ctx.db.emergencyFund.findMany({
      where: { projectId: { in: projectIds } },
      select: {
        id: true,
        currentBalance: true,
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return funds.map((fund) => ({
      projectId: fund.project.id,
      projectName: fund.project.name,
      projectSlug: fund.project.slug,
      currentBalance: fund.currentBalance,
    }));
  }),
});

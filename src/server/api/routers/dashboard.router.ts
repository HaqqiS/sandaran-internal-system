import { z } from "zod";
import { REPORT_STALE_DAYS } from "~/lib/dashboard-constants";
import {
  calculateElapsedPercent,
  formatWitaDate,
  getDaysAgoWita,
  getStartOfMonthWita,
  getStartOfTodayWita,
} from "~/lib/time-utils";
import {
  adminOrExecutiveProcedure,
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  /**
   * Prosedur Utama Remodel Dashboard Executive (Fase 3)
   * Menghasilkan: kpis, portfolio, recentIssues, fundSummary
   */
  getExecutiveOverview: adminOrExecutiveProcedure.query(async ({ ctx }) => {
    const startOfTodayWita = getStartOfTodayWita();
    const sevenDaysAgo = getDaysAgoWita(7);
    const fourteenDaysAgo = getDaysAgoWita(14);
    const startOfMonthWita = getStartOfMonthWita();
    const nowMs = Date.now();

    const [
      activeProjectsCount,
      totalProjectsCount,
      reportsLast7Days,
      reportsPrevious7Days,
      recentIssuesCount,
      recentIssuesReports,
      activeProjects,
      allFundsBalance,
      monthlyWithdrawalsAgg,
    ] = await Promise.all([
      ctx.db.project.count({ where: { status: "ACTIVE" } }),
      ctx.db.project.count(),
      ctx.db.dailyReport.count({
        where: { reportDate: { gte: sevenDaysAgo } },
      }),
      ctx.db.dailyReport.count({
        where: {
          reportDate: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      }),
      ctx.db.dailyReport.count({
        where: {
          issues: { not: null },
          reportDate: { gte: sevenDaysAgo },
        },
      }),
      ctx.db.dailyReport.findMany({
        where: {
          issues: { not: null },
        },
        orderBy: [{ reportDate: "desc" }, { createdAt: "desc" }],
        take: 5,
        select: {
          id: true,
          slug: true,
          reportDate: true,
          issues: true,
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      ctx.db.project.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          startDate: true,
          endDate: true,
          dailyReports: {
            orderBy: [{ reportDate: "desc" }, { createdAt: "desc" }],
            take: 2,
            select: {
              id: true,
              slug: true,
              reportDate: true,
              progressPercent: true,
              totalWorkers: true,
            },
          },
          emergencyFund: {
            select: {
              currentBalance: true,
              transactions: {
                where: { status: "UNREVIEWED" },
                select: { id: true },
              },
            },
          },
        },
      }),
      ctx.db.emergencyFund.aggregate({
        _sum: { currentBalance: true },
      }),
      ctx.db.emergencyTransaction.aggregate({
        where: {
          type: "WITHDRAWAL",
          createdAt: { gte: startOfMonthWita },
        },
        _sum: { amount: true },
      }),
    ]);

    let totalWorkersToday = 0;
    let reportedProjectsTodayCount = 0;

    const portfolio = activeProjects.map((p) => {
      const latest = p.dailyReports[0] ?? null;
      const previous = p.dailyReports[1] ?? null;

      const hasReportedToday = latest
        ? latest.reportDate >= startOfTodayWita
        : false;

      let todayWorkers = 0;
      if (hasReportedToday && latest) {
        todayWorkers = latest.totalWorkers;
        totalWorkersToday += latest.totalWorkers;
        reportedProjectsTodayCount += 1;
      }

      let staleDays: number | null = null;
      if (latest) {
        staleDays = Math.max(
          0,
          Math.floor((nowMs - latest.reportDate.getTime()) / 86_400_000),
        );
      }

      const elapsedPercent = calculateElapsedPercent(p.startDate, p.endDate);

      const hasProgressAnomaly =
        latest && previous
          ? latest.progressPercent < previous.progressPercent
          : false;

      const currentBalanceNum = Number(p.emergencyFund?.currentBalance ?? 0);
      const unreviewedWithdrawalsCount =
        p.emergencyFund?.transactions.length ?? 0;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        elapsedPercent,
        latestReport: latest
          ? {
              id: latest.id,
              slug: latest.slug,
              reportDate: latest.reportDate,
              progressPercent: latest.progressPercent,
              totalWorkers: latest.totalWorkers,
            }
          : null,
        previousReport: previous
          ? {
              progressPercent: previous.progressPercent,
            }
          : null,
        hasProgressAnomaly,
        staleDays,
        hasReportedToday,
        todayWorkers,
        emergencyBalance: currentBalanceNum,
        unreviewedWithdrawalsCount,
      };
    });

    const recentIssues = recentIssuesReports
      .filter((r) => Boolean(r.issues && r.issues.trim().length > 0))
      .map((r) => ({
        id: r.id,
        slug: r.slug,
        reportDate: r.reportDate,
        issues: r.issues ?? "",
        projectName: r.project.name,
        projectSlug: r.project.slug,
        reporterName: r.user.name,
      }));

    return {
      kpis: {
        totalActiveProjects: activeProjectsCount,
        totalProjects: totalProjectsCount,
        reportsLast7Days,
        reportsPrevious7Days,
        totalWorkersToday,
        reportedProjectsTodayCount,
        recentIssuesCount,
      },
      portfolio,
      recentIssues,
      fundSummary: {
        totalBalance: Number(allFundsBalance._sum.currentBalance ?? 0),
        monthlyWithdrawals: Number(monthlyWithdrawalsAgg._sum.amount ?? 0),
      },
    };
  }),

  /**
   * Data Analitik Tren Eksekutif (30 hari tenaga kerja & 6 bulan arus kas darurat)
   */
  getExecutiveTrends: adminOrExecutiveProcedure.query(async ({ ctx }) => {
    const thirtyDaysAgo = getDaysAgoWita(30);

    // 1. Laporan harian 30 hari terakhir di proyek aktif
    const reports = await ctx.db.dailyReport.findMany({
      where: {
        reportDate: { gte: thirtyDaysAgo },
        project: { status: "ACTIVE" },
      },
      orderBy: [{ reportDate: "asc" }, { createdAt: "asc" }],
      select: {
        projectId: true,
        reportDate: true,
        totalWorkers: true,
      },
    });

    // Agregasi pekerja per hari (1 laporan terakhir per proyek per hari)
    const dayProjectWorkers = new Map<string, Map<string, number>>();
    for (const r of reports) {
      const dateStr = formatWitaDate(r.reportDate, { shortMonth: true });
      let projMap = dayProjectWorkers.get(dateStr);
      if (!projMap) {
        projMap = new Map();
        dayProjectWorkers.set(dateStr, projMap);
      }
      projMap.set(r.projectId, r.totalWorkers);
    }

    const workersDaily30d: Array<{ date: string; totalWorkers: number }> = [];
    for (const [date, projMap] of dayProjectWorkers.entries()) {
      let sum = 0;
      for (const workers of projMap.values()) {
        sum += workers;
      }
      workersDaily30d.push({
        date,
        totalWorkers: sum,
      });
    }

    // 2. Arus Kas Darurat 6 Bulan Terakhir
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const transactions = await ctx.db.emergencyTransaction.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        type: true,
        amount: true,
        createdAt: true,
      },
    });

    const monthMap = new Map<
      string,
      { deposits: number; withdrawals: number }
    >();
    const monthFormatter = new Intl.DateTimeFormat("id-ID", {
      month: "short",
      year: "2-digit",
    });

    const monthLabels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = monthFormatter.format(d);
      monthLabels.push(label);
      monthMap.set(label, { deposits: 0, withdrawals: 0 });
    }

    for (const tx of transactions) {
      const label = monthFormatter.format(tx.createdAt);
      const entry = monthMap.get(label);
      if (entry) {
        const amt = Number(tx.amount);
        if (tx.type === "DEPOSIT") {
          entry.deposits += amt;
        } else if (tx.type === "WITHDRAWAL") {
          entry.withdrawals += amt;
        }
      }
    }

    const fundMonthly6m = monthLabels.map((month) => {
      const entry = monthMap.get(month) ?? { deposits: 0, withdrawals: 0 };
      return {
        month,
        deposits: Math.round(entry.deposits),
        withdrawals: Math.round(entry.withdrawals),
      };
    });

    return {
      workersDaily30d,
      fundMonthly6m,
    };
  }),
  /**
   * Prosedur Utama Remodel Dashboard Admin (Fase 2)
   * Menghasilkan data operasional riil: counts, attention, pendingUsers, projectHealth
   */
  getAdminOverview: adminProcedure.query(async ({ ctx }) => {
    const startOfTodayWita = getStartOfTodayWita();
    const nowMs = Date.now();

    // 1. Eksekusi query terparalelisasi untuk metrik & status
    const [
      activeUsers,
      pendingUsersCount,
      rejectedUsers,
      activeProjectsCount,
      pausedProjectsCount,
      doneProjectsCount,
      unreviewedEmergencyCount,
      pendingUsersList,
      projectsData,
    ] = await Promise.all([
      ctx.db.user.count({
        where: { isActive: true, reviewedAt: { not: null } },
      }),
      ctx.db.user.count({ where: { reviewedAt: null } }),
      ctx.db.user.count({
        where: { isActive: false, reviewedAt: { not: null } },
      }),
      ctx.db.project.count({ where: { status: "ACTIVE" } }),
      ctx.db.project.count({ where: { status: "PAUSED" } }),
      ctx.db.project.count({ where: { status: "DONE" } }),
      ctx.db.emergencyTransaction.count({ where: { status: "UNREVIEWED" } }),
      ctx.db.user.findMany({
        where: { reviewedAt: null },
        orderBy: { createdAt: "asc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          image: true,
        },
      }),
      ctx.db.project.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          members: {
            select: { role: true },
          },
          dailyReports: {
            orderBy: [{ reportDate: "desc" }, { createdAt: "desc" }],
            take: 1,
            select: {
              id: true,
              slug: true,
              reportDate: true,
              progressPercent: true,
              totalWorkers: true,
              createdAt: true,
            },
          },
          emergencyFund: {
            select: {
              transactions: {
                where: { status: "UNREVIEWED" },
                select: { id: true },
              },
            },
          },
          logistics: {
            select: {
              id: true,
              transactions: {
                select: { type: true, quantity: true },
              },
            },
          },
          _count: {
            select: { documents: true },
          },
        },
      }),
    ]);

    const totalUsers = activeUsers + pendingUsersCount + rejectedUsers;
    const totalProjects =
      activeProjectsCount + pausedProjectsCount + doneProjectsCount;

    let reportedTodayCount = 0;
    let missingRolesProjectsCount = 0;
    let staleReportsProjectsCount = 0;
    let totalNegativeStockItemsAcrossProjects = 0;

    const projectHealth = projectsData.map((project) => {
      // Coverage Tim (S, A, K, L)
      const roleSet = new Set(project.members.map((m) => m.role));
      const coverage = {
        supervisor: roleSet.has("SUPERVISOR"),
        architect: roleSet.has("ARCHITECT"),
        finance: roleSet.has("FINANCE"),
        logistic: roleSet.has("LOGISTIC"),
      };

      const hasMissingRole =
        !coverage.supervisor ||
        !coverage.architect ||
        !coverage.finance ||
        !coverage.logistic;
      if (hasMissingRole) {
        missingRolesProjectsCount += 1;
      }

      // Laporan harian mutakhir
      const latestReport = project.dailyReports[0] ?? null;
      let hasReportedToday = false;
      let staleDays: number | null = null;

      if (latestReport) {
        hasReportedToday = latestReport.reportDate >= startOfTodayWita;
        staleDays = Math.max(
          0,
          Math.floor((nowMs - latestReport.reportDate.getTime()) / 86_400_000),
        );
      }

      if (hasReportedToday) {
        reportedTodayCount += 1;
      }

      const isStale = staleDays === null || staleDays >= REPORT_STALE_DAYS;
      if (isStale) {
        staleReportsProjectsCount += 1;
      }

      // Transaksi darurat belum ditinjau di proyek ini
      const projectUnreviewedEmergencyCount =
        project.emergencyFund?.transactions.length ?? 0;

      // Item stok minus (Σ IN − Σ OUT < 0)
      let projectNegativeStockCount = 0;
      for (const item of project.logistics) {
        const stock = item.transactions.reduce(
          (sum, tx) =>
            tx.type === "IN" ? sum + tx.quantity : sum - tx.quantity,
          0,
        );
        if (stock < 0) {
          projectNegativeStockCount += 1;
        }
      }
      totalNegativeStockItemsAcrossProjects += projectNegativeStockCount;

      return {
        id: project.id,
        name: project.name,
        slug: project.slug,
        status: project.status,
        coverage,
        latestReport: latestReport
          ? {
              id: latestReport.id,
              slug: latestReport.slug,
              reportDate: latestReport.reportDate,
              progressPercent: latestReport.progressPercent,
              totalWorkers: latestReport.totalWorkers,
            }
          : null,
        staleDays,
        hasReportedToday,
        unreviewedEmergencyCount: projectUnreviewedEmergencyCount,
        negativeStockCount: projectNegativeStockCount,
        documentCount: project._count.documents,
      };
    });

    // Daftar Perhatian (hanya ditampilkan jika count > 0)
    const attention = [
      {
        key: "pending-users",
        count: pendingUsersCount,
        label: `${pendingUsersCount} pengguna menunggu persetujuan`,
        href: "/users",
        actionLabel: "Tinjau",
        severity: "warning" as const,
      },
      {
        key: "missing-roles",
        count: missingRolesProjectsCount,
        label: `${missingRolesProjectsCount} proyek aktif belum memiliki tim lengkap (S/A/K/L)`,
        href: "/projects",
        actionLabel: "Kelola Tim",
        severity: "warning" as const,
      },
      {
        key: "stale-reports",
        count: staleReportsProjectsCount,
        label: `${staleReportsProjectsCount} proyek aktif tanpa laporan ≥ ${REPORT_STALE_DAYS} hari`,
        href: "/reports",
        actionLabel: "Lihat",
        severity: "destructive" as const,
      },
      {
        key: "unreviewed-emergency",
        count: unreviewedEmergencyCount,
        label: `${unreviewedEmergencyCount} transaksi dana darurat belum ditinjau`,
        href: "/emergency",
        actionLabel: "Periksa",
        severity: "warning" as const,
      },
      {
        key: "negative-stock",
        count: totalNegativeStockItemsAcrossProjects,
        label: `${totalNegativeStockItemsAcrossProjects} item logistik bersaldo minus`,
        href: "/logistics",
        actionLabel: "Atasi",
        severity: "destructive" as const,
      },
    ];

    return {
      counts: {
        activeProjects: activeProjectsCount,
        pausedProjects: pausedProjectsCount,
        doneProjects: doneProjectsCount,
        totalProjects,
        activeUsers,
        pendingUsers: pendingUsersCount,
        rejectedUsers,
        totalUsers,
        reportedTodayCount,
        unreviewedEmergencyCount,
      },
      attention,
      pendingUsers: pendingUsersList,
      projectHealth,
    };
  }),
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
   * Get stats for Executive dashboard
   */
  getExecutiveStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if Executive or Admin
    if (
      ctx.session.user.roleGlobal !== "EXECUTIVE" &&
      ctx.session.user.roleGlobal !== "ADMIN"
    ) {
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

  // Backward compatibility alias
  getCEOStats: protectedProcedure.query(async ({ ctx }) => {
    if (
      ctx.session.user.roleGlobal !== "EXECUTIVE" &&
      ctx.session.user.roleGlobal !== "ADMIN"
    ) {
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
   * Get recent reports across all projects (Executive)
   */
  getExecutiveRecentReports: protectedProcedure
    .input(z.object({ limit: z.number().default(5).optional() }))
    .query(async ({ ctx, input }) => {
      // Check if Executive or Admin
      if (
        ctx.session.user.roleGlobal !== "EXECUTIVE" &&
        ctx.session.user.roleGlobal !== "ADMIN"
      ) {
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

  // Backward compatibility alias
  getCEORecentReports: protectedProcedure
    .input(z.object({ limit: z.number().default(5).optional() }))
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.roleGlobal !== "EXECUTIVE" &&
        ctx.session.user.roleGlobal !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      return ctx.db.dailyReport.findMany({
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
    }),

  /**
   * Get stats for SUPERVISOR dashboard
   * Returns data for projects where user is SUPERVISOR
   */
  getSupervisorStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find projects where user is SUPERVISOR
    const projects = await ctx.db.project.findMany({
      where: {
        members: {
          some: {
            userId,
            role: "SUPERVISOR",
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

  // Backward compatibility alias
  getMandorStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const projects = await ctx.db.project.findMany({
      where: {
        members: {
          some: {
            userId,
            role: "SUPERVISOR",
          },
        },
        status: "ACTIVE",
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
   * Get recent reports for SUPERVISOR with media thumbnails
   */
  getSupervisorRecentReports: protectedProcedure
    .input(z.object({ limit: z.number().default(3).optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get projects where user is SUPERVISOR
      const projectIds = await ctx.db.projectMember
        .findMany({
          where: { userId, role: "SUPERVISOR" },
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

  // Backward compatibility alias
  getMandorRecentReports: protectedProcedure
    .input(z.object({ limit: z.number().default(3).optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const projectIds = await ctx.db.projectMember
        .findMany({
          where: { userId, role: "SUPERVISOR" },
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

  /**
   * Get stats for LOGISTIC dashboard
   */
  getLogisticStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get projects where user is LOGISTIC
    const projects = await ctx.db.project.findMany({
      where: {
        members: {
          some: {
            userId,
            role: "LOGISTIC",
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            logistics: true,
          },
        },
      },
    });

    const projectIds = projects.map((p) => p.id);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyTransactionsCount = await ctx.db.logisticTransaction.count({
      where: {
        item: {
          projectId: { in: projectIds },
        },
        createdAt: { gte: startOfMonth },
      },
    });

    return {
      projectCount: projects.length,
      totalItems: projects.reduce((sum, p) => sum + p._count.logistics, 0),
      monthlyTransactionsCount,
      projects,
    };
  }),

  /**
   * Get recent transactions for LOGISTIC dashboard
   */
  getLogisticRecentTransactions: protectedProcedure
    .input(z.object({ limit: z.number().default(5).optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const projectIds = await ctx.db.projectMember
        .findMany({
          where: { userId, role: "LOGISTIC" },
          select: { projectId: true },
        })
        .then((members) => members.map((m) => m.projectId));

      if (!projectIds.length) return [];

      return ctx.db.logisticTransaction.findMany({
        where: {
          item: { projectId: { in: projectIds } },
        },
        take: input.limit ?? 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          item: {
            select: {
              id: true,
              name: true,
              unit: true,
              project: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });
    }),

  /**
   * Prosedur Utama Remodel User Dashboard & Multi-Role Lenses (Fase 4)
   * Menyediakan: memberships, supervisor?, architect?, finance?, logistic?
   */
  getUserOverview: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const startOfTodayWita = getStartOfTodayWita();
    const sevenDaysAgo = getDaysAgoWita(7);
    const startOfMonthWita = getStartOfMonthWita();

    // 1. Ambil seluruh keanggotaan aktif user
    const memberships = await ctx.db.projectMember.findMany({
      where: {
        userId,
        project: { status: "ACTIVE" },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const userMemberships = memberships.map((m) => ({
      projectId: m.projectId,
      projectName: m.project.name,
      projectSlug: m.project.slug,
      role: m.role,
    }));

    if (userMemberships.length === 0) {
      return {
        memberships: [],
      };
    }

    const roles = new Set(memberships.map((m) => m.role));
    const hasSupervisor = roles.has("SUPERVISOR");
    const hasArchitect = roles.has("ARCHITECT");
    const hasFinance = roles.has("FINANCE");
    const hasLogistic = roles.has("LOGISTIC");

    type SupervisorLensData = {
      kpis: {
        pendingReportsToday: number;
        unreviewedWithdrawalsCount: number;
        weeklyCommentsCount: number;
      };
      projects: Array<{
        id: string;
        name: string;
        slug: string;
        hasReportedToday: boolean;
        emergencyBalance: number;
        latestReport?: {
          progressPercent: number;
          reportDate: Date;
        };
      }>;
      recentReports: Array<{
        id: string;
        slug: string;
        reportDate: Date;
        title: string;
        totalWorkers: number;
        projectName: string;
        projectSlug: string;
        thumbnailUrl?: string;
      }>;
    };

    type ArchitectLensData = {
      kpis: {
        totalDocuments: number;
        myUploadsLast7Days: number;
      };
      projects: Array<{
        id: string;
        name: string;
        slug: string;
        totalDocs: number;
        byType: Record<string, number>;
        latestDoc?: {
          name: string;
          version: string;
          createdAt: Date;
        };
      }>;
    };

    type FinanceLensData = {
      kpis: {
        unreviewedCount: number;
        monthlyWithdrawalsAmount: number;
        negativeStockCount: number;
      };
      unreviewedQueue: Array<{
        id: string;
        projectId: string;
        projectName: string;
        amount: number;
        requesterName: string;
        description: string;
        hasReceipt: boolean;
        createdAt: Date;
      }>;
      projectFunds: Array<{
        projectId: string;
        projectName: string;
        projectSlug: string;
        currentBalance: number;
      }>;
    };

    type LogisticLensData = {
      kpis: {
        negativeStockItemCount: number;
        weeklyMutationCount: number;
        assignedProjectsCount: number;
        totalItemsCount: number;
      };
      negativeStockItems: Array<{
        id: string;
        name: string;
        unit: string;
        projectId: string;
        projectName: string;
        projectSlug: string;
        currentStock: number;
        lastMutationAt: Date | null;
      }>;
      projectInventory: Array<{
        projectId: string;
        projectName: string;
        projectSlug: string;
        itemCount: number;
        negativeStockCount: number;
        lastActivityAt: Date | null;
      }>;
      recentTransactions: Array<{
        id: string;
        type: "IN" | "OUT";
        quantity: number;
        unit: string;
        itemName: string;
        projectId: string;
        projectName: string;
        projectSlug: string;
        operatorName: string;
        notes?: string;
        createdAt: Date;
      }>;
    };

    // Lensa 1: SUPERVISOR
    let supervisorData: SupervisorLensData | undefined;
    let architectData: ArchitectLensData | undefined;
    let financeData: FinanceLensData | undefined;
    let logisticData: LogisticLensData | undefined;
    if (hasSupervisor) {
      const supervisorProjectIds = memberships
        .filter((m) => m.role === "SUPERVISOR")
        .map((m) => m.projectId);

      const [
        projects,
        unreviewedWithdrawalsCount,
        weeklyCommentsCount,
        recentReports,
      ] = await Promise.all([
        ctx.db.project.findMany({
          where: { id: { in: supervisorProjectIds } },
          select: {
            id: true,
            name: true,
            slug: true,
            emergencyFund: { select: { currentBalance: true } },
            dailyReports: {
              orderBy: [{ reportDate: "desc" }, { createdAt: "desc" }],
              take: 1,
              select: {
                progressPercent: true,
                reportDate: true,
              },
            },
          },
        }),
        ctx.db.emergencyTransaction.count({
          where: {
            requestedById: userId,
            status: "UNREVIEWED",
          },
        }),
        ctx.db.reportComment.count({
          where: {
            report: { userId },
            createdAt: { gte: sevenDaysAgo },
          },
        }),
        ctx.db.dailyReport.findMany({
          where: { userId },
          orderBy: [{ reportDate: "desc" }, { createdAt: "desc" }],
          take: 3,
          select: {
            id: true,
            slug: true,
            reportDate: true,
            taskDescription: true,
            totalWorkers: true,
            project: {
              select: {
                name: true,
                slug: true,
              },
            },
            media: {
              take: 1,
              select: { url: true },
            },
          },
        }),
      ]);

      let pendingReportsToday = 0;
      const formattedProjects = projects.map((p) => {
        const latest = p.dailyReports[0];
        const hasReportedToday = latest
          ? latest.reportDate >= startOfTodayWita
          : false;

        if (!hasReportedToday) {
          pendingReportsToday += 1;
        }

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          hasReportedToday,
          emergencyBalance: Number(p.emergencyFund?.currentBalance ?? 0),
          latestReport: latest
            ? {
                progressPercent: latest.progressPercent,
                reportDate: latest.reportDate,
              }
            : undefined,
        };
      });

      supervisorData = {
        kpis: {
          pendingReportsToday,
          unreviewedWithdrawalsCount,
          weeklyCommentsCount,
        },
        projects: formattedProjects,
        recentReports: recentReports.map((r) => ({
          id: r.id,
          slug: r.slug,
          reportDate: r.reportDate,
          title: r.taskDescription,
          totalWorkers: r.totalWorkers,
          projectName: r.project.name,
          projectSlug: r.project.slug,
          thumbnailUrl: r.media[0]?.url,
        })),
      };
    }

    // Lensa 2: ARCHITECT
    if (hasArchitect) {
      const architectProjectIds = memberships
        .filter((m) => m.role === "ARCHITECT")
        .map((m) => m.projectId);

      const [totalDocuments, myUploadsLast7Days, projects] = await Promise.all([
        ctx.db.projectDocument.count({
          where: { projectId: { in: architectProjectIds } },
        }),
        ctx.db.projectDocument.count({
          where: {
            userId,
            createdAt: { gte: sevenDaysAgo },
          },
        }),
        ctx.db.project.findMany({
          where: { id: { in: architectProjectIds } },
          select: {
            id: true,
            name: true,
            slug: true,
            documents: {
              orderBy: { createdAt: "desc" },
              select: {
                title: true,
                fileName: true,
                version: true,
                fileType: true,
                createdAt: true,
              },
            },
          },
        }),
      ]);

      const formattedProjects = projects.map((p) => {
        const byType: Record<string, number> = {};
        for (const doc of p.documents) {
          byType[doc.fileType] = (byType[doc.fileType] || 0) + 1;
        }
        const latest = p.documents[0];

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          totalDocs: p.documents.length,
          byType,
          latestDoc: latest
            ? {
                name: latest.title || latest.fileName,
                version: latest.version || "v1.0",
                createdAt: latest.createdAt,
              }
            : undefined,
        };
      });

      architectData = {
        kpis: {
          totalDocuments,
          myUploadsLast7Days,
        },
        projects: formattedProjects,
      };
    }

    // Lensa 3: FINANCE
    if (hasFinance) {
      const financeProjectIds = memberships
        .filter((m) => m.role === "FINANCE")
        .map((m) => m.projectId);

      const [
        unreviewedCount,
        monthlyWithdrawalsAgg,
        unreviewedTransactions,
        projectFunds,
        items,
      ] = await Promise.all([
        ctx.db.emergencyTransaction.count({
          where: {
            fund: { projectId: { in: financeProjectIds } },
            status: "UNREVIEWED",
          },
        }),
        ctx.db.emergencyTransaction.aggregate({
          where: {
            fund: { projectId: { in: financeProjectIds } },
            type: "WITHDRAWAL",
            createdAt: { gte: startOfMonthWita },
          },
          _sum: { amount: true },
        }),
        ctx.db.emergencyTransaction.findMany({
          where: {
            fund: { projectId: { in: financeProjectIds } },
            status: "UNREVIEWED",
          },
          orderBy: { createdAt: "asc" },
          take: 10,
          select: {
            id: true,
            amount: true,
            description: true,
            url: true,
            createdAt: true,
            requester: { select: { name: true } },
            fund: {
              select: {
                projectId: true,
                project: { select: { name: true } },
              },
            },
          },
        }),
        ctx.db.emergencyFund.findMany({
          where: { projectId: { in: financeProjectIds } },
          select: {
            projectId: true,
            currentBalance: true,
            project: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        }),
        ctx.db.logisticItem.findMany({
          where: { projectId: { in: financeProjectIds } },
          select: {
            transactions: { select: { type: true, quantity: true } },
          },
        }),
      ]);

      let negativeStockCount = 0;
      for (const item of items) {
        const stock = item.transactions.reduce(
          (sum, tx) =>
            tx.type === "IN" ? sum + tx.quantity : sum - tx.quantity,
          0,
        );
        if (stock < 0) {
          negativeStockCount += 1;
        }
      }

      financeData = {
        kpis: {
          unreviewedCount,
          monthlyWithdrawalsAmount: Number(
            monthlyWithdrawalsAgg._sum.amount ?? 0,
          ),
          negativeStockCount,
        },
        unreviewedQueue: unreviewedTransactions.map((tx) => ({
          id: tx.id,
          projectId: tx.fund.projectId,
          projectName: tx.fund.project.name,
          amount: Number(tx.amount),
          requesterName: tx.requester.name,
          description: tx.description,
          hasReceipt: tx.url !== null,
          createdAt: tx.createdAt,
        })),
        projectFunds: projectFunds.map((pf) => ({
          projectId: pf.projectId,
          projectName: pf.project.name,
          projectSlug: pf.project.slug,
          currentBalance: Number(pf.currentBalance),
        })),
      };
    }

    // Lensa 4: LOGISTIC
    if (hasLogistic) {
      const logisticProjectIds = memberships
        .filter((m) => m.role === "LOGISTIC")
        .map((m) => m.projectId);

      const [projectsWithItems, weeklyMutationCount, recentTransactions] =
        await Promise.all([
          ctx.db.project.findMany({
            where: { id: { in: logisticProjectIds } },
            select: {
              id: true,
              name: true,
              slug: true,
              logistics: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                  transactions: {
                    orderBy: { createdAt: "desc" },
                    select: {
                      type: true,
                      quantity: true,
                      createdAt: true,
                    },
                  },
                },
              },
            },
          }),
          ctx.db.logisticTransaction.count({
            where: {
              item: { projectId: { in: logisticProjectIds } },
              createdAt: { gte: sevenDaysAgo },
            },
          }),
          ctx.db.logisticTransaction.findMany({
            where: {
              item: { projectId: { in: logisticProjectIds } },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              type: true,
              quantity: true,
              notes: true,
              createdAt: true,
              user: { select: { name: true } },
              item: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                  projectId: true,
                  project: {
                    select: {
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          }),
        ]);

      let totalItemsCount = 0;
      let globalNegativeStockCount = 0;
      const negativeStockItems: Array<{
        id: string;
        name: string;
        unit: string;
        projectId: string;
        projectName: string;
        projectSlug: string;
        currentStock: number;
        lastMutationAt: Date | null;
      }> = [];

      const projectInventory = projectsWithItems.map((project) => {
        let projNegativeCount = 0;
        let lastActivityAt: Date | null = null;

        for (const item of project.logistics) {
          totalItemsCount += 1;
          const stock = item.transactions.reduce(
            (sum, tx) =>
              tx.type === "IN" ? sum + tx.quantity : sum - tx.quantity,
            0,
          );
          if (stock < 0) {
            projNegativeCount += 1;
            globalNegativeStockCount += 1;
            const lastTx = item.transactions[0];
            negativeStockItems.push({
              id: item.id,
              name: item.name,
              unit: item.unit,
              projectId: project.id,
              projectName: project.name,
              projectSlug: project.slug,
              currentStock: stock,
              lastMutationAt: lastTx?.createdAt ?? null,
            });
          }

          if (item.transactions[0]) {
            const txDate = item.transactions[0].createdAt;
            if (!lastActivityAt || txDate > lastActivityAt) {
              lastActivityAt = txDate;
            }
          }
        }

        return {
          projectId: project.id,
          projectName: project.name,
          projectSlug: project.slug,
          itemCount: project.logistics.length,
          negativeStockCount: projNegativeCount,
          lastActivityAt,
        };
      });

      logisticData = {
        kpis: {
          negativeStockItemCount: globalNegativeStockCount,
          weeklyMutationCount,
          assignedProjectsCount: logisticProjectIds.length,
          totalItemsCount,
        },
        negativeStockItems,
        projectInventory,
        recentTransactions: recentTransactions.map((tx) => ({
          id: tx.id,
          type: tx.type,
          quantity: tx.quantity,
          unit: tx.item.unit,
          itemName: tx.item.name,
          projectId: tx.item.projectId,
          projectName: tx.item.project.name,
          projectSlug: tx.item.project.slug,
          operatorName: tx.user.name,
          notes: tx.notes ?? undefined,
          createdAt: tx.createdAt,
        })),
      };
    }

    return {
      memberships: userMemberships,
      supervisor: supervisorData,
      architect: architectData,
      finance: financeData,
      logistic: logisticData,
    };
  }),
});

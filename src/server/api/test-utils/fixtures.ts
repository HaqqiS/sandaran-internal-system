import type { GlobalRole, ProjectRole, ProjectStatus } from "generated/prisma"
import { db } from "~/server/db"

/**
 * Test Data Fixtures
 *
 * Factory functions to create test data for integration tests.
 * All functions return the created entity with full relations.
 */

// ==================== USER FIXTURES ====================

export async function createAdminUser(overrides?: {
  id?: string
  name?: string
  email?: string
}) {
  return await db.user.create({
    data: {
      id: overrides?.id ?? `admin-${Date.now()}`,
      name: overrides?.name ?? "Admin User",
      email: overrides?.email ?? `admin-${Date.now()}@test.com`,
      roleGlobal: "ADMIN" as GlobalRole,
      isActive: true,
      emailVerified: true,
    },
  })
}

export async function createCEOUser(overrides?: {
  id?: string
  name?: string
  email?: string
}) {
  return await db.user.create({
    data: {
      id: overrides?.id ?? `ceo-${Date.now()}`,
      name: overrides?.name ?? "CEO User",
      email: overrides?.email ?? `ceo-${Date.now()}@test.com`,
      roleGlobal: "CEO" as GlobalRole,
      isActive: true,
      emailVerified: true,
    },
  })
}

export async function createRegularUser(overrides?: {
  id?: string
  name?: string
  email?: string
}) {
  return await db.user.create({
    data: {
      id: overrides?.id ?? `user-${Date.now()}`,
      name: overrides?.name ?? "Regular User",
      email: overrides?.email ?? `user-${Date.now()}@test.com`,
      roleGlobal: "USER" as GlobalRole,
      isActive: true,
      emailVerified: true,
    },
  })
}

export async function createInactiveUser(overrides?: {
  id?: string
  name?: string
  email?: string
}) {
  return await db.user.create({
    data: {
      id: overrides?.id ?? `inactive-${Date.now()}`,
      name: overrides?.name ?? "Inactive User",
      email: overrides?.email ?? `inactive-${Date.now()}@test.com`,
      roleGlobal: "USER" as GlobalRole,
      isActive: false,
      emailVerified: true,
    },
  })
}

// ==================== PROJECT FIXTURES ====================

export async function createProject(overrides?: {
  id?: string
  name?: string
  slug?: string
  status?: ProjectStatus
}) {
  const timestamp = Date.now()
  return await db.project.create({
    data: {
      id: overrides?.id,
      name: overrides?.name ?? `Test Project ${timestamp}`,
      slug: overrides?.slug ?? `test-project-${timestamp}`,
      status: overrides?.status ?? "ACTIVE",
      description: "Test project description",
      location: "Test Location",
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  })
}

export async function createProjectWithMembers(config?: {
  mandor?: { id?: string; name?: string }
  architect?: { id?: string; name?: string }
  finance?: { id?: string; name?: string }
}) {
  const project = await createProject()

  const members: {
    mandor?: Awaited<ReturnType<typeof createMandorMember>>
    architect?: Awaited<ReturnType<typeof createArchitectMember>>
    finance?: Awaited<ReturnType<typeof createFinanceMember>>
  } = {}

  if (config?.mandor !== undefined) {
    const user = await createRegularUser(config.mandor)
    members.mandor = await createMandorMember(project.id, user.id)
  }

  if (config?.architect !== undefined) {
    const user = await createRegularUser(config.architect)
    members.architect = await createArchitectMember(project.id, user.id)
  }

  if (config?.finance !== undefined) {
    const user = await createRegularUser(config.finance)
    members.finance = await createFinanceMember(project.id, user.id)
  }

  return {
    project,
    members,
  }
}

// ==================== PROJECT MEMBER FIXTURES ====================

export async function createMandorMember(projectId: string, userId: string) {
  return await db.projectMember.create({
    data: {
      projectId,
      userId,
      role: "MANDOR" as ProjectRole,
    },
    include: {
      user: true,
      project: true,
    },
  })
}

export async function createArchitectMember(projectId: string, userId: string) {
  return await db.projectMember.create({
    data: {
      projectId,
      userId,
      role: "ARCHITECT" as ProjectRole,
    },
    include: {
      user: true,
      project: true,
    },
  })
}

export async function createFinanceMember(projectId: string, userId: string) {
  return await db.projectMember.create({
    data: {
      projectId,
      userId,
      role: "FINANCE" as ProjectRole,
    },
    include: {
      user: true,
      project: true,
    },
  })
}

// ==================== DAILY REPORT FIXTURES ====================

export async function createDailyReport(
  projectId: string,
  userId: string,
  overrides?: {
    slug?: string
    taskDescription?: string
    progressPercent?: number
  },
) {
  const timestamp = Date.now()
  return await db.dailyReport.create({
    data: {
      projectId,
      userId,
      slug: overrides?.slug ?? `report-${timestamp}`,
      taskDescription: overrides?.taskDescription ?? "Test task description",
      progressPercent: overrides?.progressPercent ?? 50,
      reportDate: new Date(),
      totalWorkers: 10,
      weather: "Cerah",
      location: "Test Location",
    },
    include: {
      tasks: true,
      media: true,
      comments: true,
    },
  })
}

export async function createReportWithTasks(projectId: string, userId: string) {
  const report = await createDailyReport(projectId, userId)

  const tasks = await Promise.all([
    db.dailyReportTask.create({
      data: {
        reportId: report.id,
        taskName: "Task 1",
        workerCount: 5,
        progress: 50,
      },
    }),
    db.dailyReportTask.create({
      data: {
        reportId: report.id,
        taskName: "Task 2",
        workerCount: 5,
        progress: 75,
      },
    }),
  ])

  return {
    report,
    tasks,
  }
}

export async function createReportWithMedia(projectId: string, userId: string) {
  const report = await createDailyReport(projectId, userId)

  const media = await Promise.all([
    db.reportMedia.create({
      data: {
        reportId: report.id,
        publicId: "test-media-1",
        url: "https://test.com/media1.jpg",
      },
    }),
    db.reportMedia.create({
      data: {
        reportId: report.id,
        publicId: "test-media-2",
        url: "https://test.com/media2.jpg",
      },
    }),
  ])

  return {
    report,
    media,
  }
}

// ==================== COMMENT FIXTURES ====================

export async function createComment(
  reportId: string,
  userId: string,
  content = "Test comment",
) {
  return await db.reportComment.create({
    data: {
      reportId,
      userId,
      content,
    },
    include: {
      author: true,
      report: true,
    },
  })
}

// ==================== DOCUMENT FIXTURES ====================

export async function createDocument(
  projectId: string,
  userId: string,
  overrides?: {
    fileName?: string
    fileType?: "DESIGN" | "DRAWING" | "REFERENCE" | "SPECIFICATION" | "OTHER"
  },
) {
  const timestamp = Date.now()
  return await db.projectDocument.create({
    data: {
      projectId,
      userId,
      fileName: overrides?.fileName ?? `test-doc-${timestamp}.pdf`,
      fileType: overrides?.fileType ?? "OTHER",
      publicId: `doc-${timestamp}`,
      url: `https://test.com/doc-${timestamp}.pdf`,
      fileSize: 1024,
      mimeType: "application/pdf",
      title: "Test Document",
    },
    include: {
      uploader: true,
      project: true,
    },
  })
}

// ==================== EMERGENCY FUND FIXTURES ====================

export async function createEmergencyFund(
  projectId: string,
  initialBalance = 1000000,
) {
  return await db.emergencyFund.create({
    data: {
      projectId,
      currentBalance: initialBalance,
    },
    include: {
      transactions: true,
    },
  })
}

export async function createEmergencyTransaction(
  fundId: string,
  requestedById: string,
  amount: number,
  status: "PENDING" | "APPROVED" | "REJECTED" = "PENDING",
) {
  return await db.emergencyTransaction.create({
    data: {
      fundId,
      requestedById,
      amount,
      description: "Test emergency request",
      status,
    },
    include: {
      requester: true,
      verifier: true,
    },
  })
}

// ==================== LOGISTIC FIXTURES ====================

export async function createLogisticItem(
  projectId: string,
  overrides?: {
    name?: string
    unit?: string
    slug?: string
  },
) {
  const timestamp = Date.now()
  return await db.logisticItem.create({
    data: {
      projectId,
      name: overrides?.name ?? `Test Item ${timestamp}`,
      unit: overrides?.unit ?? "Pcs",
      slug: overrides?.slug ?? `item-${timestamp}`,
    },
    include: {
      transactions: true,
    },
  })
}

export async function createLogisticTransaction(
  itemId: string,
  userId: string,
  type: "IN" | "OUT",
  quantity: number,
) {
  return await db.logisticTransaction.create({
    data: {
      itemId,
      userId,
      type,
      quantity,
      notes: `Test ${type} transaction`,
    },
    include: {
      item: true,
      user: true,
    },
  })
}

// ==================== SESSION FIXTURES ====================

export async function createSession(userId: string) {
  const timestamp = Date.now()
  return await db.session.create({
    data: {
      id: `session-${timestamp}`,
      userId,
      token: `token-${timestamp}`,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    },
  })
}

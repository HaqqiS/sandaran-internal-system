import { PrismaClient } from "@prisma/client";
import { DUMMY_PROJECT_MEMBERS } from "./seeds/members";
import { DUMMY_PROJECTS } from "./seeds/projects";
import { DUMMY_REPORTS } from "./seeds/reports";
import { DUMMY_USERS } from "./seeds/users";

const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Start seeding database...");

  // 1. Seed Users (Global Roles: ADMIN, EXECUTIVE, USER, NONE)
  console.log("👤 Seeding users...");
  for (const user of DUMMY_USERS) {
    // Cari user berdasarkan email agar tidak bentrok jika akun Google sudah terdaftar
    const existing = await prisma.user.findFirst({
      where: { email: user.email },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: user.name,
          roleGlobal: user.roleGlobal,
          isActive: user.isActive,
        },
      });
      console.log(
        `   - User updated: ${user.name} (${user.email}) -> Role: ${user.roleGlobal}`,
      );
    } else {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          roleGlobal: user.roleGlobal,
          isActive: user.isActive,
        },
      });
      console.log(
        `   - User created: ${user.name} (${user.email}) -> Role: ${user.roleGlobal}`,
      );
    }
  }

  // 2. Seed Projects
  console.log("📂 Seeding projects...");
  for (const project of DUMMY_PROJECTS) {
    const upserted = await prisma.project.upsert({
      where: { id: project.id },
      update: {
        name: project.name,
        slug: project.slug,
        shortId: project.shortId,
        storageKey: project.storageKey,
        description: project.description,
        location: project.location,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
      },
      create: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        shortId: project.shortId,
        storageKey: project.storageKey,
        description: project.description,
        location: project.location,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
      },
    });
    console.log(`   - Project upserted: ${upserted.name} (${upserted.slug})`);
  }

  // 3. Seed Project Members (Project-Based Roles: SUPERVISOR, ARCHITECT, FINANCE, LOGISTIC)
  console.log("👥 Seeding project members...");
  for (const member of DUMMY_PROJECT_MEMBERS) {
    const user = await prisma.user.findFirst({
      where: { email: member.userEmail },
    });
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ slug: member.projectSlug }, { id: member.projectSlug }],
      },
    });

    if (user && project) {
      await prisma.projectMember.upsert({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId: project.id,
          },
        },
        update: {
          role: member.role,
        },
        create: {
          userId: user.id,
          projectId: project.id,
          role: member.role,
        },
      });
      console.log(
        `   - Member assigned: ${user.name} -> ${project.name} (${member.role})`,
      );
    }
  }

  // 4. Seed Daily Reports & Daily Report Tasks
  console.log("📝 Seeding daily reports...");
  for (const report of DUMMY_REPORTS) {
    // Resolve user ID for the report author
    const author =
      (await prisma.user.findUnique({ where: { id: report.userId } })) ??
      (await prisma.user.findFirst({
        where: { email: "supervisor@sandaran.id" },
      }));

    if (!author) continue;

    // Upsert DailyReport
    const upsertedReport = await prisma.dailyReport.upsert({
      where: {
        projectId_slug: {
          projectId: report.projectId,
          slug: report.slug,
        },
      },
      update: {
        userId: author.id,
        reportDate: report.reportDate,
        taskDescription: report.taskDescription,
        progressPercent: report.progressPercent,
        issues: report.issues,
        weather: report.weather,
        totalWorkers: report.totalWorkers,
        location: report.location,
      },
      create: {
        id: report.id,
        projectId: report.projectId,
        userId: author.id,
        slug: report.slug,
        reportDate: report.reportDate,
        taskDescription: report.taskDescription,
        progressPercent: report.progressPercent,
        issues: report.issues,
        weather: report.weather,
        totalWorkers: report.totalWorkers,
        location: report.location,
      },
    });
    console.log(`   - Daily report upserted: ${upsertedReport.slug}`);

    // Hapus tugas-tugas lama dari report ini (biar idempotent dan tidak duplikat)
    await prisma.dailyReportTask.deleteMany({
      where: { reportId: upsertedReport.id },
    });

    // Masukkan tugas baru
    for (const task of report.tasks) {
      await prisma.dailyReportTask.create({
        data: {
          reportId: upsertedReport.id,
          taskName: task.taskName,
          workerCount: task.workerCount,
          progress: task.progress,
          notes: task.notes,
        },
      });
    }
    console.log(`     └─ Seeded ${report.tasks.length} tasks for report.`);
  }

  console.log("✨ Database seeding finished successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

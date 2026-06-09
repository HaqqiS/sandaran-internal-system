import { PrismaClient } from "../generated/prisma";
import { DUMMY_PROJECTS } from "../src/lib/dummy-projects";
import { DUMMY_REPORTS } from "../src/lib/dummy-reports";

const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Start seeding database...");

  // 1. Seed Users (Mandor / Project Authors)
  const dummyUsers = [
    {
      id: "user_mandor_1",
      name: "Budi Santoso",
      email: "budi.santoso@astalokadesign.com",
      roleGlobal: "USER" as const,
      isActive: true,
    },
    {
      id: "user_mandor_2",
      name: "Joko Susilo",
      email: "joko.susilo@astalokadesign.com",
      roleGlobal: "USER" as const,
      isActive: true,
    },
  ];

  console.log("👤 Seeding users...");
  for (const user of dummyUsers) {
    const upserted = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
        roleGlobal: user.roleGlobal,
        isActive: user.isActive,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleGlobal: user.roleGlobal,
        isActive: user.isActive,
      },
    });
    console.log(`   - User upserted: ${upserted.name} (${upserted.id})`);
  }

  // 2. Seed Projects
  console.log("📂 Seeding projects...");
  for (const project of DUMMY_PROJECTS) {
    const upserted = await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        name: project.name,
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
        description: project.description,
        location: project.location,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
      },
    });
    console.log(`   - Project upserted: ${upserted.name} (${upserted.slug})`);
  }

  // 3. Seed Daily Reports & Daily Report Tasks
  console.log("📝 Seeding daily reports...");
  for (const report of DUMMY_REPORTS) {
    // Upsert DailyReport
    const upsertedReport = await prisma.dailyReport.upsert({
      where: {
        projectId_slug: {
          projectId: report.projectId,
          slug: report.slug,
        },
      },
      update: {
        userId: report.userId,
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
        userId: report.userId,
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

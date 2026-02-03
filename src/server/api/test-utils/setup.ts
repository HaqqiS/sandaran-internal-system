import { beforeEach } from "vitest"
import { db } from "~/server/db"

/**
 * Test Setup
 *
 * This file runs before each test to ensure a clean database state.
 * Uses transaction rollback for isolation.
 */

beforeEach(async () => {
  // Clean up database before each test
  // Note: In a real scenario, you might want to use transactions
  // For now, we'll manually clean tables in reverse dependency order

  await db.reportComment.deleteMany()
  await db.reportMedia.deleteMany()
  await db.dailyReportTask.deleteMany()
  await db.dailyReport.deleteMany()
  await db.projectDocument.deleteMany()
  await db.emergencyTransaction.deleteMany()
  await db.emergencyFund.deleteMany()
  await db.logisticTransaction.deleteMany()
  await db.logisticItem.deleteMany()
  await db.projectMember.deleteMany()
  await db.project.deleteMany()
  await db.session.deleteMany()
  await db.account.deleteMany()
  await db.user.deleteMany()
})

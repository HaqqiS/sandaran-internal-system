import { beforeEach } from "vitest";
import { db } from "~/server/db";

/**
 * Test Setup
 *
 * This file runs before each test to ensure a clean database state.
 * Uses transaction rollback for isolation.
 */

beforeEach(async () => {
  // Only clean database if explicitly enabled for database integration tests
  // to prevent accidental data loss during unit tests.
  if (process.env.TEST_DATABASE !== "true") {
    return;
  }

  await db.reportComment.deleteMany();
  await db.reportMedia.deleteMany();
  await db.dailyReportTask.deleteMany();
  await db.dailyReport.deleteMany();
  await db.projectDocument.deleteMany();
  await db.emergencyTransaction.deleteMany();
  await db.emergencyFund.deleteMany();
  await db.logisticTransaction.deleteMany();
  await db.logisticItem.deleteMany();
  await db.projectMember.deleteMany();
  await db.project.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.user.deleteMany();
});

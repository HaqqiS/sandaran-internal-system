import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { env } from "~/env";

const getConnectionString = () => {
  let str = (env.DATABASE_URL || "").trim();
  // Strip surrounding quotes if accidentally included in wrangler secret
  str = str.replace(/^["']|["']$/g, "").trim();
  // Strip variable name prefix if accidentally pasted (e.g. DATABASE_URL=...)
  str = str.replace(/^DATABASE_URL=/, "").trim();

  try {
    const url = new URL(str);
    if (!url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
    }
    return url.toString();
  } catch {
    return str;
  }
};

const createPrismaClient = () => {
  const connectionString = getConnectionString();
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 10000,
  });

  pool.on("error", (err) => {
    console.error("[PG POOL ERROR EVENT]:", err?.message || err);
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

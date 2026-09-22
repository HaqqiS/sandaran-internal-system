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

  // Intercept adapter.connect to log exact underlying driver errors
  const originalConnect = adapter.connect.bind(adapter);
  adapter.connect = async () => {
    const conn = (await originalConnect()) as unknown as {
      performIO: (query: unknown) => Promise<unknown>;
    };
    const originalPerformIO = conn.performIO.bind(conn);
    conn.performIO = async (query: unknown) => {
      try {
        return await originalPerformIO(query);
      } catch (err: unknown) {
        const errorObj = err as Record<string, unknown> | null;
        const queryObj = query as Record<string, unknown> | null;
        console.error(">>> ACTUAL SQL ERROR IN WORKER <<<", {
          message: errorObj?.message,
          code: errorObj?.code,
          detail: errorObj?.detail,
          hint: errorObj?.hint,
          name: errorObj?.name,
          sql: queryObj?.sql,
        });
        throw err;
      }
    };
    return conn as unknown as Awaited<ReturnType<typeof originalConnect>>;
  };

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

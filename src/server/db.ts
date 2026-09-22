import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { env } from "~/env";

const getConnectionInfo = () => {
  try {
    const cf = getCloudflareContext();
    const hyperdrive = (cf?.env as Record<string, unknown>)?.HYPERDRIVE as
      | { connectionString?: string }
      | undefined;
    if (hyperdrive?.connectionString) {
      return { string: hyperdrive.connectionString, isHyperdrive: true };
    }
  } catch {}

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
    return { string: url.toString(), isHyperdrive: false };
  } catch {
    return { string: str, isHyperdrive: false };
  }
};

const clientCache = new Map<string, PrismaClient>();

export const getDb = (): PrismaClient => {
  const info = getConnectionInfo();
  const cacheKey = info.string;

  const existing = clientCache.get(cacheKey);
  if (existing) {
    return existing;
  }

  const pool = new Pool({
    connectionString: info.string,
    ssl: info.isHyperdrive ? undefined : { rejectUnauthorized: false },
    max: info.isHyperdrive ? 5 : 1,
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

  const client = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

  clientCache.set(cacheKey, client);
  return client;
};

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getDb();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

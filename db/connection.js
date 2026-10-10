import pg from "pg";
import dotenv from "dotenv";

const { Pool } = pg;
dotenv.config();

export function createPool() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (connectionString) {
    let parsed;
    try {
      parsed = new URL(connectionString);
    } catch {
      throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL.");
    }
    if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
      throw new Error("DATABASE_URL must use the postgres:// or postgresql:// scheme.");
    }
    const config = {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : undefined,
      database: decodeURIComponent(parsed.pathname.replace(/^\/+/, "")) || undefined,
      user: parsed.username ? decodeURIComponent(parsed.username) : undefined,
      ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {})
    };
    return new Pool(config);
  }

  const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
  if (!PGHOST && !PGDATABASE && !PGUSER && !PGPASSWORD) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return new Pool({
    host: PGHOST,
    port: PGPORT ? Number(PGPORT) : undefined,
    database: PGDATABASE,
    user: PGUSER,
    ...(PGPASSWORD ? { password: PGPASSWORD } : {})
  });
}

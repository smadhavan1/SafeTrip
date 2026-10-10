import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPool } from "./connection.js";

const directory = path.dirname(fileURLToPath(import.meta.url));
let pool;

try {
  pool = createPool();
  const schema = await fs.readFile(path.join(directory, "schema.sql"), "utf8");
  const seed = await fs.readFile(path.join(directory, "seed.sql"), "utf8");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(schema);
    await client.query(seed);
    await client.query("COMMIT");
    console.log("SafeTrip schema and sample data inserted successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
} catch (error) {
  console.error("SafeTrip database seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  if (pool) await pool.end();
}

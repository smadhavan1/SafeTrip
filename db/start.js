import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config();

if (process.env.DB_AUTOSTART !== "true") {
  console.log("Using the configured external PostgreSQL database.");
  process.exit(0);
}

const dataDirectory = path.join(os.homedir(), ".safetrip-postgres");
const port = Number(process.env.DB_PORT || 55432);
const binaryDirectory = process.env.PG_BIN || "/usr/lib/postgresql/18/bin";
const binary = (name) => path.join(binaryDirectory, name);

function run(command, args) {
  return execFileSync(command, args, { stdio: "inherit" });
}

if (!fs.existsSync(path.join(dataDirectory, "PG_VERSION"))) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  run(binary("initdb"), ["-D", dataDirectory, "--auth=trust", "--username=safetrip"]);
}

try {
  execFileSync(binary("pg_ctl"), ["-D", dataDirectory, "status"], { stdio: "ignore" });
  console.log(`SafeTrip PostgreSQL is already running on port ${port}.`);
} catch {
  run(binary("pg_ctl"), [
    "-D", dataDirectory,
    "-o", `-p ${port} -h 127.0.0.1 -k /tmp`,
    "-l", path.join(dataDirectory, "postgres.log"),
    "start"
  ]);
}

try {
  execFileSync("createdb", ["-h", "127.0.0.1", "-p", String(port), "-U", "safetrip", "safetrip"], {
    stdio: "ignore"
  });
} catch {
  // The database already exists.
}

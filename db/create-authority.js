import bcrypt from "bcryptjs";
import { createPool } from "./connection.js";

const [providedName, providedEmail, providedPassword] = process.argv.slice(2);
const fullName = providedName || process.env.AUTHORITY_NAME;
const email = providedEmail || process.env.AUTHORITY_EMAIL;
const password = providedPassword || process.env.AUTHORITY_PASSWORD;
if (!fullName || !email || !password || password.length < 8) {
  console.error("Set AUTHORITY_NAME, AUTHORITY_EMAIL, and AUTHORITY_PASSWORD in .env, or pass them as command arguments.");
  process.exit(1);
}

const pool = createPool();
try {
  await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, lower($2), $3, 'AUTHORITY')
     ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name,
       password_hash = EXCLUDED.password_hash, role = 'AUTHORITY'`,
    [fullName.trim(), email.trim(), await bcrypt.hash(password, 12)]
  );
  console.log(`Authority account ready for ${email.trim().toLowerCase()}.`);
} finally {
  await pool.end();
}

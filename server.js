import express from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPool } from "./db/connection.js";
const app = express();
const port = Number(process.env.PORT || 3000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let pool;
try {
  pool = createPool();
} catch (error) {
  console.error(`Database configuration error: ${error.message}`);
}

app.use(express.json({ limit: "32kb" }));
const sessionCookie = "safetrip_session";
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function currentUser(req) {
  const cookie = req.headers.cookie?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookie}=`));
  if (!cookie) return null;
  const token = decodeURIComponent(cookie.slice(sessionCookie.length + 1));
  const result = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.role FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)]
  );
  return result.rows[0] ?? null;
}

function setSession(res, token) {
  res.setHeader("Set-Cookie", `${sessionCookie}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`);
}

async function requireAuth(req, res, next) {
  if (!databaseRequired(res)) return;
  try {
    req.user = await currentUser(req);
    if (!req.user) return res.status(401).json({ error: "Authentication required." });
    next();
  } catch (error) {
    console.error("Authentication lookup failed", error);
    res.status(500).json({ error: "Unable to verify authentication." });
  }
}

app.post("/api/auth/signup", async (req, res) => {
  const { fullName, email, password } = req.body ?? {};
  if (typeof fullName !== "string" || fullName.trim().length < 2 ||
      typeof email !== "string" || !emailPattern.test(email.trim()) ||
      typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Enter a name, valid email, and password of at least 8 characters." });
  }
  if (!databaseRequired(res)) return;
  try {
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, lower($2), $3) RETURNING id, full_name, email, role`,
      [fullName.trim(), email.trim(), await bcrypt.hash(password, 12)]
    );
    const token = crypto.randomBytes(32).toString("hex");
    await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '7 days')", [hashToken(token), result.rows[0].id]);
    setSession(res, token);
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "An account with that email already exists." });
    console.error("Signup failed", error);
    res.status(500).json({ error: "Unable to create the account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ error: "Email and password are required." });
  if (!databaseRequired(res)) return;
  try {
    const result = await pool.query("SELECT id, full_name, email, password_hash, role FROM users WHERE email = lower($1)", [email.trim()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: "Invalid email or password." });
    const token = crypto.randomBytes(32).toString("hex");
    await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '7 days')", [hashToken(token), user.id]);
    setSession(res, token);
    delete user.password_hash;
    res.json({ user });
  } catch (error) {
    console.error("Login failed", error);
    res.status(500).json({ error: "Unable to sign in." });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  const cookie = req.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookie}=`));
  if (cookie && pool) await pool.query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(decodeURIComponent(cookie.slice(sessionCookie.length + 1)))]);
  res.setHeader("Set-Cookie", `${sessionCookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
  res.status(204).end();
});

app.get("/api/auth/me", requireAuth, (req, res) => res.json({ user: req.user }));

function databaseRequired(res) {
  if (!pool) {
    res.status(503).json({ error: "Database is not configured. Set DATABASE_URL or PostgreSQL connection variables." });
    return false;
  }
  return true;
}

async function dashboardQueries() {
  const [alerts, hazards, shelters, missions, contacts] = await Promise.all([
    pool.query(`SELECT id, title, category, severity, severity_rank, area, latitude,
      longitude, issued_at, retrieved_at, expires_at, source_name, source_url,
      verification_status, original_instructions, status
      FROM alerts WHERE status = 'ACTIVE'
      ORDER BY severity_rank DESC, issued_at DESC`),
    pool.query(`SELECT id, name, hazard_type, area, status, latitude, longitude,
      geometry, source_name, source_url, updated_at, verification_status
      FROM hazards WHERE status <> 'CLOSED' ORDER BY updated_at DESC`),
    pool.query(`SELECT id, name, area, latitude, longitude, capacity_status,
      available_spaces, amenities, last_verified_at, distance_km, status,
      source_name, source_url FROM shelters WHERE status = 'OPEN'
      ORDER BY distance_km NULLS LAST, name ASC`),
    pool.query(`SELECT id, country, region, emergency_phone, desk_label,
      latitude, longitude,
      availability_status, source_url FROM diplomatic_missions
      ORDER BY country ASC`),
    pool.query(`SELECT id, label, phone, service, source_name, source_url
      FROM emergency_contacts WHERE active = true ORDER BY priority ASC, label ASC`)
  ]);
  return {
    alerts: alerts.rows,
    hazards: hazards.rows,
    shelters: shelters.rows,
    missions: missions.rows,
    contacts: contacts.rows,
    retrievedAt: new Date().toISOString()
  };
}

app.get("/api/dashboard", async (_req, res) => {
  if (!databaseRequired(res)) return;
  try {
    res.json(await dashboardQueries());
  } catch (error) {
    console.error("Dashboard query failed", error);
    res.status(500).json({ error: "Unable to load crisis data from the database." });
  }
});

app.get("/api/alerts", async (_req, res) => {
  if (!databaseRequired(res)) return;
  try {
    const data = await pool.query(`SELECT id, title, category, severity, severity_rank,
      area, latitude, longitude, issued_at, retrieved_at, expires_at, source_name,
      source_url, verification_status, original_instructions, status
      FROM alerts WHERE status = 'ACTIVE' ORDER BY severity_rank DESC, issued_at DESC`);
    res.json({ alerts: data.rows });
  } catch (error) {
    console.error("Alert query failed", error);
    res.status(500).json({ error: "Unable to load alerts from the database." });
  }
});

app.get("/api/shelters", async (_req, res) => {
  if (!databaseRequired(res)) return;
  try {
    const data = await pool.query(`SELECT id, name, area, latitude, longitude,
      capacity_status, available_spaces, amenities, last_verified_at, distance_km,
      status, source_name, source_url FROM shelters WHERE status = 'OPEN'
      ORDER BY distance_km NULLS LAST, name ASC`);
    res.json({ shelters: data.rows });
  } catch (error) {
    console.error("Shelter query failed", error);
    res.status(500).json({ error: "Unable to load shelters from the database." });
  }
});

app.post("/api/assistance", requireAuth, async (req, res) => {
  const { fullName, nationality, groupSize, needs } = req.body ?? {};
  const parsedGroupSize = Number(groupSize);
  if (typeof fullName !== "string" || !fullName.trim() ||
      typeof nationality !== "string" || !nationality.trim() ||
      !Number.isInteger(parsedGroupSize) || parsedGroupSize < 1 ||
      !Array.isArray(needs) || needs.length === 0 ||
      needs.some((need) => typeof need !== "string" || !need.trim())) {
    return res.status(400).json({ error: "Name, nationality, group size and at least one need are required." });
  }
  if (!databaseRequired(res)) return;
  try {
    const result = await pool.query(
      `INSERT INTO assistance_requests (full_name, nationality, group_size, needs)
       VALUES ($1, $2, $3, $4::text[]) RETURNING reference_code`,
      [fullName.trim(), nationality.trim(), parsedGroupSize, needs.map((need) => need.trim())]
    );
    res.status(201).json({ referenceCode: result.rows[0].reference_code });
  } catch (error) {
    console.error("Assistance request failed", error);
    res.status(500).json({ error: "Unable to transmit the assistance request." });
  }
});

async function serveAuthorityConsole(req, res) {
  try {
    const user = await currentUser(req);
    if (!user) return res.redirect(`/login?next=${encodeURIComponent(req.query.next || "/authority")}`);
    if (user.role !== "AUTHORITY") return res.status(403).send("Authority access is restricted to authorised personnel.");
    res.sendFile(path.join(__dirname, "public", "authority.html"));
  } catch (error) {
    console.error("Authority authentication failed", error);
    res.status(500).send("Unable to verify authority access.");
  }
}
app.get("/authority", serveAuthorityConsole);
app.get("/authority-console", serveAuthorityConsole);
app.get("/assistance", async (req, res) => {
  try {
    if (!await currentUser(req)) return res.redirect("/login?next=%2Fassistance");
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } catch (error) {
    console.error("Assistance authentication failed", error);
    res.redirect("/login?next=%2Fassistance");
  }
});

app.get("/login", (_req, res) => res.sendFile(path.join(__dirname, "public", "auth.html")));
app.get("/signup", (_req, res) => res.sendFile(path.join(__dirname, "public", "auth.html")));
app.get("/index.html", async (req, res) => {
  if (!await currentUser(req)) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/authority.html", async (req, res) => {
  return serveAuthorityConsole(req, res);
});
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/guest", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.use(express.static(path.join(__dirname, "public"), { index: false }));
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => console.log(`SafeTrip running on http://localhost:${port}`));

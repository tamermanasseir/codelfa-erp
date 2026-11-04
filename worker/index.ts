interface Env {
  DB: D1Database;
  BOOTSTRAP_SECRET: string;
  APP_ORIGIN?: string;
}

interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: { changes?: number };
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

type User = { id: string; username: string; display_name: string; role: "owner" | "partner"; is_active: number };
type SessionUser = User & { token_hash: string };

const SESSION_SECONDS = 60 * 60 * 24 * 14;
const PBKDF2_ITERATIONS = 310000;

function json(data: unknown, status = 200, extra: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", ...extra },
  });
}
function fail(message: string, status = 400) { return json({ error: message }, status); }
function randomId() { return crypto.randomUUID(); }
function toBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return btoa(binary);
}
function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}
async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toBase64(new Uint8Array(digest));
}
async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS }, key, 256);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(new Uint8Array(bits))}`;
}
async function verifyPassword(password: string, stored: string) {
  const [scheme, iterationsRaw, saltRaw, expectedRaw] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterationsRaw || !saltRaw || !expectedRaw) return false;
  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 1000000) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: fromBase64(saltRaw), iterations }, key, 256);
  const actual = new Uint8Array(bits);
  const expected = fromBase64(expectedRaw);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}
function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get("cookie") || "";
  const item = cookie.split(";").map((v) => v.trim()).find((v) => v.startsWith(name + "="));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}
function sessionCookie(token: string, maxAge: number) {
  return `codelfa_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
async function getUser(request: Request, env: Env): Promise<SessionUser | null> {
  const token = cookieValue(request, "codelfa_session");
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(
    "SELECT u.id, u.username, u.display_name, u.role, u.is_active, s.token_hash FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.is_active=1"
  ).bind(tokenHash, Math.floor(Date.now() / 1000)).first<SessionUser>();
  return row || null;
}
function ownerOnly(user: SessionUser | null) {
  return !!user && user.role === "owner";
}
async function audit(env: Env, userId: string, action: string, entityType: string, entityId: string, details?: unknown) {
  await env.DB.prepare(
    "INSERT INTO audit_log (id, actor_user_id, action, entity_type, entity_id, details_json) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(randomId(), userId, action, entityType, entityId, details ? JSON.stringify(details) : null).run();
}
function sameOrigin(request: Request, env: Env) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const expected = env.APP_ORIGIN ? new URL(env.APP_ORIGIN).origin : new URL(request.url).origin;
  return origin === expected;
}
async function body(request: Request) {
  try { return await request.json() as Record<string, unknown>; } catch { return null; }
}
function text(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function validDate(value: unknown) {
  const v = text(value, 30);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "";
}
async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return fail("Not found", 404);
  if (!sameOrigin(request, env)) return fail("Origin not allowed", 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "allow": "GET, POST, OPTIONS" } });
  if (url.pathname === "/api/health" && request.method === "GET") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM users").first<{ count: number }>();
    return json({ ok: true, database: "connected", initialized: (row?.count || 0) > 0 });
  }

  if (url.pathname === "/api/setup" && request.method === "POST") {
    const supplied = request.headers.get("x-setup-key") || "";
    if (!env.BOOTSTRAP_SECRET || supplied.length < 24 || supplied !== env.BOOTSTRAP_SECRET) return fail("Setup authorization failed", 403);
    const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM users").first<{ count: number }>();
    if ((count?.count || 0) !== 0) return fail("Initial setup is already complete", 409);
    const data = await body(request);
    const username = text(data?.username, 40).toLowerCase();
    const displayName = text(data?.displayName, 100);
    const password = typeof data?.password === "string" ? data.password : "";
    if (!/^[a-z0-9._-]{3,40}$/.test(username) || displayName.length < 2 || password.length < 12) {
      return fail("Use a 3–40 character username, a display name, and a password of at least 12 characters.");
    }
    const id = randomId();
    const passwordHash = await hashPassword(password);
    await env.DB.prepare("INSERT INTO users (id, username, display_name, password_hash, role) VALUES (?, ?, ?, ?, 'owner')")
      .bind(id, username, displayName, passwordHash).run();
    await audit(env, id, "initial_owner_created", "user", id);
    return json({ ok: true, message: "Owner account created. Sign in to continue." }, 201);
  }

  if (url.pathname === "/api/login" && request.method === "POST") {
    const data = await body(request);
    const username = text(data?.username, 40);
    const password = typeof data?.password === "string" ? data.password : "";
    if (!username || !password) return fail("Enter username and password.", 400);
    const user = await env.DB.prepare("SELECT id, username, display_name, password_hash, role, is_active FROM users WHERE username=? COLLATE NOCASE")
      .bind(username).first<User & { password_hash: string }>();
    if (!user || !user.is_active || !(await verifyPassword(password, user.password_hash))) return fail("Incorrect username or password.", 401);
    const token = toBase64(crypto.getRandomValues(new Uint8Array(32))).replace(/=/g, "");
    const tokenHash = await sha256(token);
    const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
    await env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
      .bind(tokenHash, user.id, expires).run();
    await audit(env, user.id, "login", "session", tokenHash);
    return json({ user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role } }, 200, { "set-cookie": sessionCookie(token, SESSION_SECONDS) });
  }

  if (url.pathname === "/api/logout" && request.method === "POST") {
    const token = cookieValue(request, "codelfa_session");
    if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha256(token)).run();
    return json({ ok: true }, 200, { "set-cookie": sessionCookie("", 0) });
  }

  const user = await getUser(request, env);
  if (url.pathname === "/api/me" && request.method === "GET") {
    return user ? json({ user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role } }) : fail("Not signed in", 401);
  }
  if (!user) return fail("Sign in required", 401);

  if (url.pathname === "/api/shipments" && request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT s.*, c.name AS supplier_name FROM shipments s LEFT JOIN counterparties c ON c.id=s.supplier_id ORDER BY s.created_at DESC"
    ).all();
    return json({ shipments: result.results });
  }
  if (url.pathname === "/api/shipments" && request.method === "POST") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.", 403);
    const data = await body(request);
    const container = text(data?.containerNo, 40).toUpperCase();
    const reference = text(data?.referenceNo, 40) || null;
    const origin = text(data?.origin, 100) || null;
    const destination = text(data?.destination, 100) || null;
    const status = text(data?.status, 30) || "purchased";
    const supplierName = text(data?.supplierName, 120);
    const allowed = ["purchased","ordered","booked","loaded","departed","in_transit","arrived","customs_clearance","released","received","closed"];
    if (!container && !reference) return fail("Enter a container or reference number.");
    if (!allowed.includes(status)) return fail("Invalid shipment status.");
    let supplierId: string | null = null;
    if (supplierName) {
      const found = await env.DB.prepare("SELECT id FROM counterparties WHERE name=? AND counterparty_type='supplier'").bind(supplierName).first<{id:string}>();
      supplierId = found?.id || randomId();
      if (!found) await env.DB.prepare("INSERT INTO counterparties (id,name,counterparty_type,created_by) VALUES (?,?,'supplier',?)").bind(supplierId,supplierName,user.id).run();
    }
    const id = randomId();
    await env.DB.prepare(
      "INSERT INTO shipments (id, reference_no, container_no, supplier_id, origin, destination, status, purchase_date, etd, eta, bill_of_lading_no, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, reference, container || null, supplierId, origin, destination, status, validDate(data?.purchaseDate) || null, validDate(data?.etd) || null, validDate(data?.eta) || null, text(data?.billOfLadingNo, 80) || null, text(data?.notes, 2000) || null, user.id).run();
    await audit(env, user.id, "create", "shipment", id, { containerNo: container, status });
    return json({ ok: true, id }, 201);
  }

  if (url.pathname === "/api/financial-entries" && request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT f.*, c.name AS counterparty_name, s.container_no FROM financial_entries f LEFT JOIN counterparties c ON c.id=f.counterparty_id LEFT JOIN shipments s ON s.id=f.shipment_id ORDER BY f.entry_date DESC, f.created_at DESC"
    ).all();
    return json({ entries: result.results });
  }
  if (url.pathname === "/api/financial-entries" && request.method === "POST") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.", 403);
    const data = await body(request);
    const type = text(data?.entryType, 20);
    const currency = text(data?.currency, 3);
    const direction = text(data?.direction, 3);
    const amount = Number(data?.amount);
    const entryDate = validDate(data?.entryDate);
    const allowedTypes = ["purchase","sale","payment","expense","addition","cheque"];
    if (!allowedTypes.includes(type) || !["USD","CNY","ILS","TRY"].includes(currency) || !["in","out"].includes(direction) || !Number.isFinite(amount) || amount <= 0 || !entryDate) return fail("Check the entry type, amount, currency, direction and date.");
    const amountMinor = Math.round(amount * 100);
    const id = randomId();
    await env.DB.prepare(
      "INSERT INTO financial_entries (id, entry_type, reference_no, entry_date, due_date, amount_minor, currency, direction, status, description, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, type, text(data?.referenceNo, 60) || null, entryDate, validDate(data?.dueDate) || null, amountMinor, currency, direction, text(data?.status, 20) || "recorded", text(data?.description, 200), text(data?.notes, 2000) || null, user.id).run();
    await audit(env, user.id, "create", "financial_entry", id, { type, amountMinor, currency });
    return json({ ok: true, id }, 201);
  }

  if (url.pathname === "/api/comments" && request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT c.id, c.target_type, c.target_id, c.body, c.created_at, u.display_name AS author FROM comments c JOIN users u ON u.id=c.created_by ORDER BY c.created_at DESC LIMIT 200"
    ).all();
    return json({ comments: result.results });
  }
  if (url.pathname === "/api/comments" && request.method === "POST") {
    const data = await body(request);
    const targetType = text(data?.targetType, 30) || "general";
    const targetId = text(data?.targetId, 80) || null;
    const comment = text(data?.body, 3000);
    if (!["shipment","financial_entry","document","general"].includes(targetType) || !comment) return fail("Enter a valid comment.");
    const id = randomId();
    await env.DB.prepare("INSERT INTO comments (id,target_type,target_id,body,created_by) VALUES (?,?,?,?,?)")
      .bind(id, targetType, targetId, comment, user.id).run();
    await audit(env, user.id, "create", "comment", id, { targetType, targetId });
    return json({ ok: true, id }, 201);
  }

  return fail("Not found", 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await handle(request, env);
    } catch (error) {
      console.error("CODELFA PARTNERS API error", error);
      return fail("A server error occurred. No changes were confirmed.", 500);
    }
  },
};

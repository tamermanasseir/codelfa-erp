interface Env {
  DB: D1Database;
  BOOTSTRAP_SECRET: string;
  APP_ORIGIN?: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
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
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}
type User = { id: string; username: string; display_name: string; role: "owner" | "partner"; is_active: number };
type SessionUser = User & { token_hash: string };
const SESSION_SECONDS = 60 * 60 * 24 * 14;
// Cloudflare Workers caps PBKDF2 at 100,000 iterations per operation.
const PBKDF2_ITERATIONS = 100000;

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
  return "pbkdf2$" + PBKDF2_ITERATIONS + "$" + toBase64(salt) + "$" + toBase64(new Uint8Array(bits));
}
async function verifyPassword(password: string, stored: string) {
  const [scheme, iterationsRaw, saltRaw, expectedRaw] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterationsRaw || !saltRaw || !expectedRaw) return false;
  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations < 50000 || iterations > 100000) return false;
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
  return "codelfa_session=" + encodeURIComponent(token) + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + maxAge;
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
function ownerOnly(user: SessionUser | null) { return !!user && user.role === "owner"; }
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
function minor(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 90000000000000) return null;
  return Math.round(amount * 100);
}
function currency(value: unknown) {
  const v = text(value, 3);
  return ["USD", "CNY", "ILS", "TRY"].includes(v) ? v : "";
}
function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 220) : "Unknown database error";
}
async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  if (!path.startsWith("/api/")) return env.ASSETS.fetch(request);
  if (!sameOrigin(request, env)) return fail("Origin not allowed", 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "allow": "GET, POST, PATCH, DELETE, OPTIONS" } });

  if (path === "/api/health" && request.method === "GET") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM users").first<{ count: number }>();
    return json({ ok: true, database: "connected", initialized: (row?.count || 0) > 0 });
  }

  if (path === "/api/setup" && request.method === "POST") {
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
    try { await audit(env, id, "initial_owner_created", "user", id); }
    catch (error) { console.error("CODELFA owner audit write failed", error); }
    return json({ ok: true, message: "Owner account created. Sign in to continue." }, 201);
  }

  if (path === "/api/login" && request.method === "POST") {
    const data = await body(request);
    const username = text(data?.username, 40);
    const password = typeof data?.password === "string" ? data.password : "";
    if (!username || !password) return fail("Enter username and password.");
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

  if (path === "/api/logout" && request.method === "POST") {
    const token = cookieValue(request, "codelfa_session");
    if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha256(token)).run();
    return json({ ok: true }, 200, { "set-cookie": sessionCookie("", 0) });
  }

  const user = await getUser(request, env);
  if (path === "/api/me" && request.method === "GET") {
    return user ? json({ user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role } }) : fail("Not signed in", 401);
  }
  if (!user) return fail("Sign in required", 401);

  if (path === "/api/workspace/backup" && request.method === "GET") {
    if (!ownerOnly(user)) return fail("Owner access required", 403);
    const tables = ["counterparties","shipments","shipment_budgets","invoices","invoice_lines","financial_entries","invoice_payment_allocations","documents","attachments","comments","audit_log"];
    const rows = await Promise.all(tables.map(async (table) => {
      const result = await env.DB.prepare("SELECT * FROM " + table).all();
      return [table, result.results] as const;
    }));
    return json({ exported_at: new Date().toISOString(), format: "CODELFA-PARTNERS-BACKUP-1", data: Object.fromEntries(rows) });
  }

  if (path === "/api/workspace/reset" && request.method === "POST") {
    if (!ownerOnly(user)) return fail("Owner access required", 403);
    const data = await body(request);
    if (text(data?.confirmation, 40) !== "RESET CODELFA") return fail("Type RESET CODELFA to confirm this operation.", 400);
    const statements = [
      "DELETE FROM invoice_payment_allocations",
      "DELETE FROM comments",
      "DELETE FROM documents",
      "DELETE FROM attachments",
      "DELETE FROM shipment_budgets",
      "DELETE FROM invoice_lines",
      "DELETE FROM financial_entries",
      "DELETE FROM invoices",
      "DELETE FROM shipments",
      "DELETE FROM counterparties"
    ].map((sql) => env.DB.prepare(sql));
    statements.push(env.DB.prepare("INSERT INTO audit_log (id,actor_user_id,action,entity_type,entity_id,details_json) VALUES (?,?,?,?,?,?)")
      .bind(randomId(), user.id, "workspace_reset", "workspace", "business_data", JSON.stringify({ retained: ["users","sessions","workspace_settings","audit_log"] })));
    await env.DB.batch(statements);
    return json({ ok: true, message: "Business data cleared. Accounts, settings and audit history were retained." });
  }

  if (path === "/api/users" && request.method === "GET") {
    if (!ownerOnly(user)) return fail("Owner access required", 403);
    const result = await env.DB.prepare("SELECT id, username, display_name, role, is_active, created_at FROM users ORDER BY created_at").all();
    return json({ users: result.results });
  }
  if (path === "/api/users" && request.method === "POST") {
    if (!ownerOnly(user)) return fail("Owner access required", 403);
    const data = await body(request);
    const username = text(data?.username, 40).toLowerCase();
    const displayName = text(data?.displayName, 100);
    const password = typeof data?.password === "string" ? data.password : "";
    if (!/^[a-z0-9._-]{3,40}$/.test(username) || displayName.length < 2 || password.length < 12) return fail("Enter a valid username, display name and password of at least 12 characters.");
    const id = randomId();
    try {
      const passwordHash = await hashPassword(password);
      await env.DB.prepare("INSERT INTO users (id, username, display_name, password_hash, role) VALUES (?, ?, ?, ?, 'partner')")
        .bind(id, username, displayName, passwordHash).run();
      await audit(env, user.id, "create", "partner_user", id, { username });
      return json({ ok: true, id, username }, 201);
    } catch (error) {
      console.error("CODELFA create partner failed", error);
      return fail("تعذر إنشاء حساب الشريك. تحقق من اسم المستخدم أو كلمة المرور.", 409);
    }
  }

  if (path === "/api/shipments" && request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT s.*, c.name AS supplier_name FROM shipments s LEFT JOIN counterparties c ON c.id=s.supplier_id WHERE s.archived_at IS NULL ORDER BY s.created_at DESC"
    ).all();
    return json({ shipments: result.results });
  }
  if (path === "/api/shipments" && request.method === "POST") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.", 403);
    const data = await body(request);
    const container = text(data?.containerNo, 40).toUpperCase();
    const reference = text(data?.referenceNo, 40) || null;
    const supplierName = text(data?.supplierName, 120);
    const status = text(data?.status, 30) || "purchased";
    const allowed = ["purchased","ordered","booked","loaded","departed","in_transit","arrived","customs_clearance","released","received","closed"];
    if (!container && !reference) return fail("Enter a container or reference number.");
    if (!allowed.includes(status)) return fail("Invalid shipment status.");
    let supplierId: string | null = null;
    if (supplierName) {
      const found = await env.DB.prepare("SELECT id FROM counterparties WHERE name=? AND counterparty_type='supplier' AND archived_at IS NULL").bind(supplierName).first<{id:string}>();
      supplierId = found?.id || randomId();
      if (!found) await env.DB.prepare("INSERT INTO counterparties (id,name,counterparty_type,created_by) VALUES (?,?,'supplier',?)").bind(supplierId,supplierName,user.id).run();
    }
    const id = randomId();
    await env.DB.prepare(
      "INSERT INTO shipments (id, reference_no, container_no, supplier_id, origin, destination, status, purchase_date, etd, eta, bill_of_lading_no, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, reference, container || null, supplierId, text(data?.origin,100), text(data?.destination,100), status, validDate(data?.purchaseDate) || null, validDate(data?.etd) || null, validDate(data?.eta) || null, text(data?.billOfLadingNo,80) || null, text(data?.notes,2000) || null, user.id).run();
    await audit(env, user.id, "create", "shipment", id, { containerNo: container, status });
    return json({ ok: true, id }, 201);
  }

  const shipmentMatch = path.match(/^\/api\/shipments\/([a-f0-9-]+)$/i);
  if (shipmentMatch && request.method === "PATCH") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.", 403);
    const data = await body(request);
    const id = shipmentMatch[1];
    const status = text(data?.status,30);
    const allowed = ["purchased","ordered","booked","loaded","departed","in_transit","arrived","customs_clearance","released","received","closed"];
    if (!allowed.includes(status)) return fail("Invalid shipment status.");
    const result = await env.DB.prepare("UPDATE shipments SET container_no=?,reference_no=?,origin=?,destination=?,status=?,purchase_date=?,etd=?,eta=?,bill_of_lading_no=?,notes=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND archived_at IS NULL")
      .bind(text(data?.containerNo,40).toUpperCase() || null,text(data?.referenceNo,40) || null,text(data?.origin,100) || null,text(data?.destination,100) || null,status,validDate(data?.purchaseDate) || null,validDate(data?.etd) || null,validDate(data?.eta) || null,text(data?.billOfLadingNo,80) || null,text(data?.notes,2000) || null,id).run();
    if (!result.meta.changes) return fail("Shipment not found.",404);
    await audit(env,user.id,"update","shipment",id,{status});
    return json({ok:true});
  }
  if (shipmentMatch && request.method === "DELETE") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.",403);
    await env.DB.prepare("UPDATE shipments SET archived_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND archived_at IS NULL").bind(shipmentMatch[1]).run();
    await audit(env,user.id,"archive","shipment",shipmentMatch[1]);
    return json({ok:true});
  }

  if (path === "/api/counterparties" && request.method === "GET") {
    const result = await env.DB.prepare("SELECT id,name,counterparty_type,phone,email,notes,created_at FROM counterparties WHERE archived_at IS NULL ORDER BY name").all();
    return json({counterparties:result.results});
  }
  if (path === "/api/counterparties" && request.method === "POST") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.",403);
    const data=await body(request);
    const name=text(data?.name,160);
    const type=text(data?.type,20);
    if (!name || !["supplier","customer","other"].includes(type)) return fail("Enter a name and a valid contact type.");
    const id=randomId();
    await env.DB.prepare("INSERT INTO counterparties (id,name,counterparty_type,phone,email,notes,created_by) VALUES (?,?,?,?,?,?,?)")
      .bind(id,name,type,text(data?.phone,60)||null,text(data?.email,160)||null,text(data?.notes,2000)||null,user.id).run();
    await audit(env,user.id,"create","counterparty",id,{name,type});
    return json({ok:true,id},201);
  }

  if (path === "/api/invoices" && request.method === "GET") {
    const invoices=await env.DB.prepare("SELECT i.*,c.name AS counterparty_name,s.container_no,COALESCE((SELECT SUM(a.amount_minor) FROM invoice_payment_allocations a JOIN financial_entries fe ON fe.id=a.financial_entry_id WHERE a.invoice_id=i.id AND fe.archived_at IS NULL AND fe.status<>'cancelled'),0) AS paid_minor FROM invoices i LEFT JOIN counterparties c ON c.id=i.counterparty_id LEFT JOIN shipments s ON s.id=i.shipment_id WHERE i.archived_at IS NULL ORDER BY i.invoice_date DESC,i.created_at DESC").all();
    const lines=await env.DB.prepare("SELECT l.* FROM invoice_lines l JOIN invoices i ON i.id=l.invoice_id WHERE i.archived_at IS NULL ORDER BY l.rowid").all();
    return json({invoices:invoices.results,lines:lines.results});
  }
  if (path === "/api/invoices" && request.method === "POST") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.",403);
    const data=await body(request);
    const invoiceNo=text(data?.invoiceNo,80);
    const type=text(data?.invoiceType,20);
    const curr=currency(data?.currency);
    const date=validDate(data?.invoiceDate);
    const lines=Array.isArray(data?.lines)?data.lines as Record<string,unknown>[]:[];
    if (!invoiceNo || !["sale","purchase"].includes(type) || !curr || !date || lines.length<1 || lines.length>60) return fail("Complete invoice number, type, date, currency and at least one line.");
    const prepared: {id:string;description:string;quantity:number;unit:string;price:number;total:number;notes:string|null}[]=[];
    for (const line of lines) {
      const description=text(line.description,240);
      const quantity=Number(line.quantity);
      const price=minor(line.unitPrice);
      if (!description || !Number.isFinite(quantity) || quantity<=0 || quantity>100000000 || price===null) return fail("Check every invoice line, quantity and price.");
      prepared.push({id:randomId(),description,quantity,unit:text(line.unit,30)||"pcs",price,total:Math.round(quantity*price),notes:text(line.notes,500)||null});
    }
    const subtotal=prepared.reduce((n,l)=>n+l.total,0);
    const discount=minor(data?.discount)||0;
    const tax=minor(data?.tax)||0;
    const total=subtotal-discount+tax;
    if (discount>subtotal || total<0) return fail("Discount cannot exceed the invoice subtotal.");
    const id=randomId();
    const statements: D1PreparedStatement[]=[
      env.DB.prepare("INSERT INTO invoices (id,invoice_no,invoice_type,counterparty_id,shipment_id,invoice_date,due_date,currency,subtotal_minor,discount_minor,tax_minor,total_minor,status,notes,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
        .bind(id,invoiceNo,type,text(data?.counterpartyId,80)||null,text(data?.shipmentId,80)||null,date,validDate(data?.dueDate)||null,curr,subtotal,discount,tax,total,text(data?.status,20)||"issued",text(data?.notes,3000)||null,user.id)
    ];
    for (const line of prepared) statements.push(env.DB.prepare("INSERT INTO invoice_lines (id,invoice_id,description,quantity,unit,unit_price_minor,line_total_minor,notes) VALUES (?,?,?,?,?,?,?,?)").bind(line.id,id,line.description,line.quantity,line.unit,line.price,line.total,line.notes));
    statements.push(env.DB.prepare("INSERT INTO audit_log (id,actor_user_id,action,entity_type,entity_id,details_json) VALUES (?,?,?,?,?,?)").bind(randomId(),user.id,"create","invoice",id,JSON.stringify({invoiceNo,type,total,currency:curr})));
    try { await env.DB.batch(statements); }
    catch(error) { console.error("CODELFA invoice create failed",error); return fail("Could not save invoice. Check that its number is unique.",409); }
    return json({ok:true,id,totalMinor:total},201);
  }
  const invoiceMatch=path.match(/^\/api\/invoices\/([a-f0-9-]+)$/i);
  if (invoiceMatch && request.method === "PATCH") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.",403);
    const data=await body(request);
    const invoiceNo=text(data?.invoiceNo,80),type=text(data?.invoiceType,20),curr=currency(data?.currency),date=validDate(data?.invoiceDate);
    const lines=Array.isArray(data?.lines)?data.lines as Record<string,unknown>[]:[];
    const status=text(data?.status,20);
    if (!invoiceNo || !["sale","purchase"].includes(type) || !curr || !date || lines.length<1 || lines.length>60 || !["draft","issued","partially_paid","paid","cancelled"].includes(status)) return fail("Complete the invoice fields and at least one line.");
    const prepared:{id:string;description:string;quantity:number;unit:string;price:number;total:number;notes:string|null}[]=[];
    for(const line of lines){
      const description=text(line.description,240),quantity=Number(line.quantity),price=minor(line.unitPrice);
      if(!description || !Number.isFinite(quantity) || quantity<=0 || quantity>100000000 || price===null) return fail("Check every invoice line, quantity and price.");
      prepared.push({id:randomId(),description,quantity,unit:text(line.unit,30)||"pcs",price,total:Math.round(quantity*price),notes:text(line.notes,500)||null});
    }
    const subtotal=prepared.reduce((n,l)=>n+l.total,0),discount=minor(data?.discount)||0,tax=minor(data?.tax)||0,total=subtotal-discount+tax;
    if(discount>subtotal || total<0) return fail("Discount cannot exceed the invoice subtotal.");
    const statements:D1PreparedStatement[]=[
      env.DB.prepare("UPDATE invoices SET invoice_no=?,invoice_type=?,counterparty_id=?,shipment_id=?,invoice_date=?,due_date=?,currency=?,subtotal_minor=?,discount_minor=?,tax_minor=?,total_minor=?,status=?,notes=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND archived_at IS NULL")
        .bind(invoiceNo,type,text(data?.counterpartyId,80)||null,text(data?.shipmentId,80)||null,date,validDate(data?.dueDate)||null,curr,subtotal,discount,tax,total,status,text(data?.notes,3000)||null,invoiceMatch[1]),
      env.DB.prepare("DELETE FROM invoice_lines WHERE invoice_id=?").bind(invoiceMatch[1])
    ];
    for(const line of prepared) statements.push(env.DB.prepare("INSERT INTO invoice_lines (id,invoice_id,description,quantity,unit,unit_price_minor,line_total_minor,notes) VALUES (?,?,?,?,?,?,?,?)").bind(line.id,invoiceMatch[1],line.description,line.quantity,line.unit,line.price,line.total,line.notes));
    statements.push(env.DB.prepare("INSERT INTO audit_log (id,actor_user_id,action,entity_type,entity_id,details_json) VALUES (?,?,?,?,?,?)").bind(randomId(),user.id,"update","invoice",invoiceMatch[1],JSON.stringify({invoiceNo,total,currency:curr})));
    try{await env.DB.batch(statements);}catch(error){console.error("CODELFA invoice update failed",error);return fail("Could not update invoice. Check that its number is unique.",409);}
    return json({ok:true,totalMinor:total});
  }
  if (invoiceMatch && request.method === "DELETE") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.",403);
    await env.DB.prepare("UPDATE invoices SET archived_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND archived_at IS NULL").bind(invoiceMatch[1]).run();
    await audit(env,user.id,"archive","invoice",invoiceMatch[1]);
    return json({ok:true});
  }

  if (path === "/api/china-remittances" && request.method === "GET") {
    const [entries, allocations] = await Promise.all([
      env.DB.prepare("SELECT f.id,f.entry_date,f.amount_minor,f.currency,f.reference_no,f.description,f.notes,f.payment_method,f.status,COALESCE((SELECT SUM(a.amount_minor) FROM invoice_payment_allocations a WHERE a.financial_entry_id=f.id),0) AS allocated_minor FROM financial_entries f WHERE f.entry_type='payment' AND f.direction='out' AND f.archived_at IS NULL AND f.status<>'cancelled' ORDER BY f.entry_date DESC,f.created_at DESC").all(),
      env.DB.prepare("SELECT a.id,a.invoice_id,a.financial_entry_id,a.amount_minor,a.currency,i.invoice_no,c.name AS supplier_name,s.container_no FROM invoice_payment_allocations a JOIN financial_entries f ON f.id=a.financial_entry_id JOIN invoices i ON i.id=a.invoice_id LEFT JOIN counterparties c ON c.id=i.counterparty_id LEFT JOIN shipments s ON s.id=i.shipment_id WHERE f.archived_at IS NULL AND f.status<>'cancelled' ORDER BY f.entry_date DESC").all()
    ]);
    return json({ entries: entries.results, allocations: allocations.results });
  }

  if (path === "/api/china-remittances" && request.method === "POST") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.", 403);
    const d = await body(request);
    const amount = minor(d?.amount), curr = currency(d?.currency), date = validDate(d?.entryDate);
    const allocations = Array.isArray(d?.allocations) ? d.allocations as Record<string,unknown>[] : [];
    if (amount === null || amount <= 0 || !curr || !date || allocations.length > 30) return fail("Enter a valid transfer amount, currency and date.");
    const parsed: { invoiceId:string; amount:number }[] = [];
    let allocatedTotal = 0;
    for (const item of allocations) {
      const invoiceId = text(item.invoiceId,80), allocationAmount = minor(item.amount);
      if (!invoiceId || allocationAmount === null || allocationAmount <= 0) return fail("Check each invoice allocation and amount.");
      const invoice = await env.DB.prepare("SELECT i.id,i.invoice_type,i.currency,i.total_minor,i.status,i.archived_at,COALESCE((SELECT SUM(a.amount_minor) FROM invoice_payment_allocations a JOIN financial_entries fe ON fe.id=a.financial_entry_id WHERE a.invoice_id=i.id AND fe.archived_at IS NULL AND fe.status<>'cancelled'),0) AS paid_minor FROM invoices i WHERE i.id=?").bind(invoiceId).first<{id:string;invoice_type:string;currency:string;total_minor:number;status:string;archived_at:string|null;paid_minor:number}>();
      if (!invoice || invoice.archived_at || invoice.status === "cancelled" || invoice.invoice_type !== "purchase") return fail("Only active purchase invoices can be allocated to a China remittance.");
      if (invoice.currency !== curr) return fail("The transfer and purchase invoice must use the same currency.");
      if (invoice.paid_minor + allocationAmount > invoice.total_minor) return fail("An allocation exceeds the remaining balance of invoice " + invoice.id.slice(0,8) + ".");
      if (parsed.some((x) => x.invoiceId === invoiceId)) return fail("Select each invoice only once in this transfer.");
      parsed.push({invoiceId,amount:allocationAmount});
      allocatedTotal += allocationAmount;
    }
    if (allocatedTotal > amount) return fail("Invoice allocations cannot exceed the actual transfer amount.");
    const id = randomId();
    const statements: D1PreparedStatement[] = [
      env.DB.prepare("INSERT INTO financial_entries (id,entry_type,reference_no,counterparty_id,shipment_id,entry_date,due_date,amount_minor,currency,direction,status,description,notes,created_by,payment_method,cheque_no,bank_name,paid_at) VALUES (?,'payment',?,NULL,NULL,?,NULL,?,?,'out','recorded',?,?,?,'bank_transfer',NULL,NULL,?)")
        .bind(id,text(d?.referenceNo,80)||null,date,amount,curr,text(d?.description,240)||"تحويل إلى الصين",text(d?.notes,3000)||null,user.id,date)
    ];
    for (const item of parsed) statements.push(env.DB.prepare("INSERT INTO invoice_payment_allocations (id,invoice_id,financial_entry_id,amount_minor,currency,created_by) VALUES (?,?,?,?,?,?)")
      .bind(randomId(),item.invoiceId,id,item.amount,curr,user.id));
    statements.push(env.DB.prepare("INSERT INTO audit_log (id,actor_user_id,action,entity_type,entity_id,details_json) VALUES (?,?,?,?,?,?)")
      .bind(randomId(),user.id,"create","china_remittance",id,JSON.stringify({amount,currency:curr,allocated:allocatedTotal,invoiceCount:parsed.length})));
    try { await env.DB.batch(statements); }
    catch (error) { console.error("CODELFA China remittance failed",error); return fail("Could not save the transfer and its invoice allocations.",409); }
    return json({ok:true,id,allocatedMinor:allocatedTotal,unallocatedMinor:amount-allocatedTotal},201);
  }

  if (path === "/api/financial-entries" && request.method === "GET") {
    const result=await env.DB.prepare("SELECT f.*,c.name AS counterparty_name,s.container_no FROM financial_entries f LEFT JOIN counterparties c ON c.id=f.counterparty_id LEFT JOIN shipments s ON s.id=f.shipment_id WHERE f.archived_at IS NULL ORDER BY f.entry_date DESC,f.created_at DESC").all();
    return json({entries:result.results});
  }
  if (path === "/api/financial-entries" && request.method === "POST") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.",403);
    const data=await body(request);
    const type=text(data?.entryType,20);
    const curr=currency(data?.currency);
    const direction=text(data?.direction,3);
    const amount=minor(data?.amount);
    const date=validDate(data?.entryDate);
    if (!["purchase","sale","payment","expense","addition","cheque"].includes(type) || !curr || !["in","out"].includes(direction) || amount===null || amount<=0 || !date) return fail("Check the entry type, amount, currency, direction and date.");
    const id=randomId();
    await env.DB.prepare("INSERT INTO financial_entries (id,entry_type,reference_no,counterparty_id,shipment_id,entry_date,due_date,amount_minor,currency,direction,status,description,notes,created_by,payment_method,cheque_no,bank_name,paid_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(id,type,text(data?.referenceNo,80)||null,text(data?.counterpartyId,80)||null,text(data?.shipmentId,80)||null,date,validDate(data?.dueDate)||null,amount,curr,direction,text(data?.status,20)||"recorded",text(data?.description,240)||null,text(data?.notes,3000)||null,user.id,text(data?.paymentMethod,30)||null,text(data?.chequeNo,80)||null,text(data?.bankName,120)||null,validDate(data?.paidAt)||null).run();
    await audit(env,user.id,"create","financial_entry",id,{type,amount,currency:curr});
    return json({ok:true,id},201);
  }
  const entryMatch=path.match(/^\/api\/financial-entries\/([a-f0-9-]+)$/i);
  if (entryMatch && request.method === "PATCH") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.",403);
    const d=await body(request);
    const amount=minor(d?.amount),curr=currency(d?.currency),date=validDate(d?.entryDate),direction=text(d?.direction,3);
    const type=text(d?.entryType,20);
    if (amount===null || amount<=0 || !curr || !date || !["in","out"].includes(direction) || !["purchase","sale","payment","expense","addition","cheque"].includes(type)) return fail("Check the financial entry fields.");
    await env.DB.prepare("UPDATE financial_entries SET entry_type=?,reference_no=?,counterparty_id=?,shipment_id=?,entry_date=?,due_date=?,amount_minor=?,currency=?,direction=?,status=?,description=?,notes=?,payment_method=?,cheque_no=?,bank_name=?,paid_at=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND archived_at IS NULL")
      .bind(type,text(d?.referenceNo,80)||null,text(d?.counterpartyId,80)||null,text(d?.shipmentId,80)||null,date,validDate(d?.dueDate)||null,amount,curr,direction,text(d?.status,20)||"recorded",text(d?.description,240)||null,text(d?.notes,3000)||null,text(d?.paymentMethod,30)||null,text(d?.chequeNo,80)||null,text(d?.bankName,120)||null,validDate(d?.paidAt)||null,entryMatch[1]).run();
    await audit(env,user.id,"update","financial_entry",entryMatch[1]);
    return json({ok:true});
  }
  if (entryMatch && request.method === "DELETE") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.",403);
    await env.DB.prepare("UPDATE financial_entries SET archived_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND archived_at IS NULL").bind(entryMatch[1]).run();
    await audit(env,user.id,"archive","financial_entry",entryMatch[1]);
    return json({ok:true});
  }

  if (path === "/api/shipment-budgets" && request.method === "GET") {
    const result=await env.DB.prepare("SELECT b.*,s.container_no FROM shipment_budgets b JOIN shipments s ON s.id=b.shipment_id WHERE s.archived_at IS NULL ORDER BY s.container_no").all();
    return json({budgets:result.results});
  }
  if (path === "/api/shipment-budgets" && request.method === "POST") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.",403);
    const d=await body(request), shipmentId=text(d?.shipmentId,80), type=text(d?.budgetType,20), curr=currency(d?.currency), expected=minor(d?.expected);
    if (!shipmentId || !["sale","purchase","expense"].includes(type) || !curr || expected===null) return fail("Check the expected value, shipment and currency.");
    const id=randomId();
    await env.DB.prepare("INSERT INTO shipment_budgets (id,shipment_id,budget_type,currency,expected_minor,notes,created_by) VALUES (?,?,?,?,?,?,?) ON CONFLICT(shipment_id,budget_type,currency) DO UPDATE SET expected_minor=excluded.expected_minor,notes=excluded.notes,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')")
      .bind(id,shipmentId,type,curr,expected,text(d?.notes,1000)||null,user.id).run();
    await audit(env,user.id,"upsert","shipment_budget",shipmentId,{type,currency:curr,expected});
    return json({ok:true});
  }

  if (path === "/api/documents" && request.method === "GET") {
    const targetType=text(url.searchParams.get("targetType"),30),targetId=text(url.searchParams.get("targetId"),80);
    if (targetType && targetId) {
      const result=await env.DB.prepare("SELECT id,target_type,target_id,file_name,content_type,byte_size,uploaded_by,created_at FROM documents WHERE target_type=? AND target_id=? ORDER BY created_at DESC").bind(targetType,targetId).all();
      return json({documents:result.results});
    }
    const result=await env.DB.prepare("SELECT id,target_type,target_id,file_name,content_type,byte_size,uploaded_by,created_at FROM documents ORDER BY created_at DESC LIMIT 300").all();
    return json({documents:result.results});
  }
  if (path === "/api/documents" && request.method === "POST") {
    if (!ownerOnly(user)) return fail("Partner access is read-only.",403);
    const d=await body(request);
    const targetType=text(d?.targetType,30),targetId=text(d?.targetId,80),name=text(d?.fileName,180),mime=text(d?.contentType,100),data=text(d?.contentBase64,1300000);
    if (!["shipment","invoice","financial_entry"].includes(targetType) || !targetId || !name || !["application/pdf","image/jpeg","image/png","image/webp"].includes(mime) || !data) return fail("Choose a PDF or image and a valid record.");
    let bytes:Uint8Array;
    try { bytes=fromBase64(data); } catch { return fail("Invalid file data."); }
    if (bytes.length>900000 || bytes.length===0) return fail("Each file must be smaller than 900 KB.");
    const exists = targetType==="shipment"
      ? await env.DB.prepare("SELECT id FROM shipments WHERE id=? AND archived_at IS NULL").bind(targetId).first()
      : targetType==="invoice"
        ? await env.DB.prepare("SELECT id FROM invoices WHERE id=? AND archived_at IS NULL").bind(targetId).first()
        : await env.DB.prepare("SELECT id FROM financial_entries WHERE id=? AND archived_at IS NULL").bind(targetId).first();
    if (!exists) return fail("The linked record was not found.",404);
    const id=randomId();
    await env.DB.prepare("INSERT INTO documents (id,target_type,target_id,file_name,content_type,byte_size,content_base64,uploaded_by) VALUES (?,?,?,?,?,?,?,?)")
      .bind(id,targetType,targetId,name,mime,bytes.length,data,user.id).run();
    await audit(env,user.id,"upload","document",id,{targetType,targetId,name,size:bytes.length});
    return json({ok:true,id},201);
  }
  const documentMatch=path.match(/^\/api\/documents\/([a-f0-9-]+)$/i);
  if (documentMatch && request.method === "GET") {
    const doc=await env.DB.prepare("SELECT file_name,content_type,content_base64 FROM documents WHERE id=?").bind(documentMatch[1]).first<{file_name:string;content_type:string;content_base64:string}>();
    if (!doc) return fail("Document not found.",404);
    const safeName=encodeURIComponent(doc.file_name).replace(/'/g,"%27");
    return new Response(fromBase64(doc.content_base64),{headers:{"content-type":doc.content_type,"content-disposition":"inline; filename*=UTF-8''"+safeName,"cache-control":"private, no-store","x-content-type-options":"nosniff"}});
  }

  if (path === "/api/comments" && request.method === "GET") {
    const result=await env.DB.prepare("SELECT c.id,c.target_type,c.target_id,c.body,c.created_at,u.display_name AS author FROM comments c JOIN users u ON u.id=c.created_by ORDER BY c.created_at DESC LIMIT 500").all();
    return json({comments:result.results});
  }
  if (path === "/api/comments" && request.method === "POST") {
    const d=await body(request),targetType=text(d?.targetType,30)||"general",targetId=text(d?.targetId,80)||null,comment=text(d?.body,3000);
    if (!["shipment","financial_entry","document","general"].includes(targetType) || !comment) return fail("Enter a valid comment.");
    const id=randomId();
    await env.DB.prepare("INSERT INTO comments (id,target_type,target_id,body,created_by) VALUES (?,?,?,?,?)").bind(id,targetType,targetId,comment,user.id).run();
    await audit(env,user.id,"create","comment",id,{targetType,targetId});
    return json({ok:true,id},201);
  }

  if (path === "/api/reports" && request.method === "GET") {
    const [invoices,entries,budgets,shipments]=await Promise.all([
      env.DB.prepare("SELECT id,invoice_type,shipment_id,currency,total_minor FROM invoices WHERE archived_at IS NULL AND status<>'cancelled'").all(),
      env.DB.prepare("SELECT id,entry_type,shipment_id,currency,direction,amount_minor FROM financial_entries WHERE archived_at IS NULL AND status<>'cancelled'").all(),
      env.DB.prepare("SELECT shipment_id,budget_type,currency,expected_minor FROM shipment_budgets").all(),
      env.DB.prepare("SELECT id,container_no FROM shipments WHERE archived_at IS NULL").all()
    ]);
    return json({invoices:invoices.results,entries:entries.results,budgets:budgets.results,shipments:shipments.results});
  }

  return fail("Not found",404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try { return await handle(request,env); }
    catch (error) {
      console.error("CODELFA PARTNERS API error",error);
      return fail("A server error occurred. No changes were confirmed.",500);
    }
  },
};

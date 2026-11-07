-- PREVIEW DATABASE ONLY: codelfa-partners-preview
-- Paste this script ONLY into the Console of D1 database codelfa-partners-preview.
-- Do NOT run against production database codelfa-partners-db.
-- Creates schema and default workspace settings; does not create business records or users.


-- ===== migrations/0001_initial.sql =====
-- CODELFA PARTNERS — isolated Cloudflare D1 schema
-- No demo/business records or credentials are seeded.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'partner')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS counterparties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  counterparty_type TEXT NOT NULL CHECK (counterparty_type IN ('supplier','customer','other')),
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_counterparties_name ON counterparties(name);

CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,
  reference_no TEXT UNIQUE,
  container_no TEXT,
  supplier_id TEXT REFERENCES counterparties(id),
  origin TEXT,
  destination TEXT,
  status TEXT NOT NULL DEFAULT 'purchased' CHECK (status IN (
    'purchased','ordered','booked','loaded','departed','in_transit',
    'arrived','customs_clearance','released','received','closed'
  )),
  purchase_date TEXT,
  etd TEXT,
  eta TEXT,
  received_at TEXT,
  bill_of_lading_no TEXT,
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_container ON shipments(container_no);

CREATE TABLE IF NOT EXISTS financial_entries (
  id TEXT PRIMARY KEY,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('purchase','sale','payment','expense','addition','cheque')),
  reference_no TEXT,
  counterparty_id TEXT REFERENCES counterparties(id),
  shipment_id TEXT REFERENCES shipments(id),
  entry_date TEXT NOT NULL,
  due_date TEXT,
  amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
  currency TEXT NOT NULL CHECK (currency IN ('USD','CNY','ILS','TRY')),
  direction TEXT NOT NULL CHECK (direction IN ('in','out')),
  status TEXT NOT NULL DEFAULT 'recorded' CHECK (status IN ('draft','recorded','pending','cleared','cancelled')),
  description TEXT,
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_financial_entries_type_date ON financial_entries(entry_type, entry_date);
CREATE INDEX IF NOT EXISTS idx_financial_entries_shipment ON financial_entries(shipment_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_counterparty ON financial_entries(counterparty_id);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('shipment','financial_entry','document','general')),
  target_id TEXT,
  body TEXT NOT NULL CHECK (length(trim(body)) > 0),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id, created_at);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('shipment','financial_entry','comment','general')),
  target_id TEXT,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size >= 0),
  object_key TEXT NOT NULL UNIQUE,
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_attachments_target ON attachments(target_type, target_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details_json TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id, created_at);

CREATE TABLE IF NOT EXISTS workspace_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_by TEXT REFERENCES users(id),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

INSERT OR IGNORE INTO workspace_settings (setting_key, setting_value)
VALUES ('workspace_name', 'CODELFA PARTNERS'),
       ('default_language', 'ar'),
       ('supported_currencies', 'USD,CNY,ILS,TRY');


-- ===== migrations/0002_full_business_modules.sql =====
-- CODELFA PARTNERS v1.1 — additive business modules.
-- Safe, non-destructive migration. Existing users, sessions, shipments and entries remain intact.
ALTER TABLE shipments ADD COLUMN archived_at TEXT;
ALTER TABLE counterparties ADD COLUMN archived_at TEXT;
ALTER TABLE financial_entries ADD COLUMN payment_method TEXT;
ALTER TABLE financial_entries ADD COLUMN cheque_no TEXT;
ALTER TABLE financial_entries ADD COLUMN bank_name TEXT;
ALTER TABLE financial_entries ADD COLUMN paid_at TEXT;
ALTER TABLE financial_entries ADD COLUMN archived_at TEXT;

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL,
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('sale','purchase')),
  counterparty_id TEXT REFERENCES counterparties(id),
  shipment_id TEXT REFERENCES shipments(id),
  invoice_date TEXT NOT NULL,
  due_date TEXT,
  currency TEXT NOT NULL CHECK (currency IN ('USD','CNY','ILS','TRY')),
  subtotal_minor INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_minor >= 0),
  discount_minor INTEGER NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  tax_minor INTEGER NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  total_minor INTEGER NOT NULL DEFAULT 0 CHECK (total_minor >= 0),
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('draft','issued','partially_paid','paid','cancelled')),
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  archived_at TEXT,
  UNIQUE(invoice_type, invoice_no)
);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_counterparty ON invoices(counterparty_id);
CREATE INDEX IF NOT EXISTS idx_invoices_shipment ON invoices(shipment_id);

CREATE TABLE IF NOT EXISTS invoice_lines (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity REAL NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL DEFAULT 'pcs',
  unit_price_minor INTEGER NOT NULL CHECK (unit_price_minor >= 0),
  line_total_minor INTEGER NOT NULL CHECK (line_total_minor >= 0),
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON invoice_lines(invoice_id);

CREATE TABLE IF NOT EXISTS shipment_budgets (
  id TEXT PRIMARY KEY,
  shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  budget_type TEXT NOT NULL CHECK (budget_type IN ('sale','purchase','expense')),
  currency TEXT NOT NULL CHECK (currency IN ('USD','CNY','ILS','TRY')),
  expected_minor INTEGER NOT NULL CHECK (expected_minor >= 0),
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(shipment_id, budget_type, currency)
);
CREATE INDEX IF NOT EXISTS idx_shipment_budgets_shipment ON shipment_budgets(shipment_id);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('shipment','invoice','financial_entry')),
  target_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size > 0),
  content_base64 TEXT NOT NULL,
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_documents_target ON documents(target_type, target_id, created_at);


-- ===== migrations/0003_invoice_payment_allocations.sql =====
-- CODELFA PARTNERS v1.2 — allocate one China remittance across one or more purchase invoices.
-- Additive only: existing users, invoices, financial entries and business data remain intact.
CREATE TABLE IF NOT EXISTS invoice_payment_allocations (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  financial_entry_id TEXT NOT NULL REFERENCES financial_entries(id) ON DELETE CASCADE,
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  currency TEXT NOT NULL CHECK (currency IN ('USD','CNY','ILS','TRY')),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(invoice_id, financial_entry_id)
);

CREATE INDEX IF NOT EXISTS idx_invoice_payment_allocations_invoice
  ON invoice_payment_allocations(invoice_id, created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_payment_allocations_entry
  ON invoice_payment_allocations(financial_entry_id);


-- ===== migrations/0004_financial_entry_purpose.sql =====
-- CODELFA PARTNERS v1.2 — distinguish China remittances from ordinary cash payments.
-- Additive only; existing payments retain the default purpose "general".
ALTER TABLE financial_entries
  ADD COLUMN purpose TEXT NOT NULL DEFAULT 'general'
  CHECK (purpose IN ('general','china_remittance'));

CREATE INDEX IF NOT EXISTS idx_financial_entries_purpose
  ON financial_entries(purpose, entry_date);


-- ===== migrations/0005_purchase_invoice_extras.sql =====
-- CODELFA PARTNERS v1.3 — additional landed-cost lines linked to purchase invoices.
-- Additive migration: existing invoices, payments, users and sessions remain unchanged.
CREATE TABLE IF NOT EXISTS purchase_invoice_extras (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('freight','customs','handling','cutting','unloading','insurance','other')),
  description TEXT NOT NULL,
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  currency TEXT NOT NULL CHECK (currency IN ('USD','CNY','ILS','TRY')),
  expense_date TEXT NOT NULL,
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_purchase_invoice_extras_invoice
  ON purchase_invoice_extras(invoice_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_purchase_invoice_extras_currency
  ON purchase_invoice_extras(currency, expense_date);


-- ===== migrations/0006_shipment_loading_photos.sql =====
-- CODELFA PARTNERS v1.3 — post-loading container photo gallery.
-- Photos are independent of invoices and remain attached to the shipment record.
CREATE TABLE IF NOT EXISTS shipment_loading_photos (
  id TEXT PRIMARY KEY,
  shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('image/jpeg','image/png','image/webp')),
  byte_size INTEGER NOT NULL CHECK (byte_size > 0 AND byte_size <= 900000),
  content_base64 TEXT NOT NULL,
  photo_date TEXT NOT NULL,
  caption TEXT,
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_shipment_loading_photos_shipment
  ON shipment_loading_photos(shipment_id, photo_date, created_at);


-- ===== migrations/0007_invoice_line_area_pricing.sql =====
-- CODELFA PARTNERS v1.4 — square-metre dimensions and pricing basis for invoice lines.
-- Existing invoice values remain unchanged: legacy lines default to price-per-unit.
ALTER TABLE invoice_lines
  ADD COLUMN unit_area_m2 REAL NOT NULL DEFAULT 1 CHECK (unit_area_m2 > 0);

ALTER TABLE invoice_lines
  ADD COLUMN pricing_basis TEXT NOT NULL DEFAULT 'unit'
  CHECK (pricing_basis IN ('unit','sqm'));


-- ===== migrations/0008_orders_workspace.sql =====
-- CODELFA PARTNERS v1.5 — central order workspace with shared links.
-- Additive migration only: all existing invoices, shipments and payments remain intact.
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_no TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  customer_id TEXT REFERENCES counterparties(id),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','in_progress','partially_delivered','completed','on_hold','cancelled')),
  start_date TEXT,
  delivery_date TEXT,
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  archived_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, archived_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

ALTER TABLE shipments ADD COLUMN order_id TEXT REFERENCES orders(id);
ALTER TABLE invoices ADD COLUMN order_id TEXT REFERENCES orders(id);
ALTER TABLE financial_entries ADD COLUMN order_id TEXT REFERENCES orders(id);

CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_order ON financial_entries(order_id);


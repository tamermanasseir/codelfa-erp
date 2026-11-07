-- CODELFA PARTNERS — isolated Cloudflare D1 schema
-- Apply only through the Wrangler configuration that explicitly selects the target D1 database.
-- For branch previews, use wrangler.preview-migrations.toml (codelfa-partners-preview), never production.
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

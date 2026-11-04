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

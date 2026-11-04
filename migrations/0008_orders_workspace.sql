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

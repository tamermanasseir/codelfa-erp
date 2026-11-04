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

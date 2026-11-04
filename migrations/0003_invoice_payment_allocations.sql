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

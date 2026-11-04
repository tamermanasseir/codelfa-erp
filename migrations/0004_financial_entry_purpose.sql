-- CODELFA PARTNERS v1.2 — distinguish China remittances from ordinary cash payments.
-- Additive only; existing payments retain the default purpose "general".
ALTER TABLE financial_entries
  ADD COLUMN purpose TEXT NOT NULL DEFAULT 'general'
  CHECK (purpose IN ('general','china_remittance'));

CREATE INDEX IF NOT EXISTS idx_financial_entries_purpose
  ON financial_entries(purpose, entry_date);

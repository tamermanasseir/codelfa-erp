-- CODELFA PARTNERS v1.4 — square-metre dimensions and pricing basis for invoice lines.
-- Existing invoice values remain unchanged: legacy lines default to price-per-unit.
ALTER TABLE invoice_lines
  ADD COLUMN unit_area_m2 REAL NOT NULL DEFAULT 1 CHECK (unit_area_m2 > 0);

ALTER TABLE invoice_lines
  ADD COLUMN pricing_basis TEXT NOT NULL DEFAULT 'unit'
  CHECK (pricing_basis IN ('unit','sqm'));

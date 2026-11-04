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

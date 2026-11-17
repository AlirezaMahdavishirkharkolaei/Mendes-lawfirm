-- File storage inside D1 (used when no R2 bucket is bound).
-- Files are split into chunks because D1 rows are limited to ~2 MB.
CREATE TABLE IF NOT EXISTS file_blobs (
  key          TEXT NOT NULL,
  chunk        INTEGER NOT NULL,
  data         BLOB NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes   INTEGER NOT NULL,
  created_at   TEXT NOT NULL,
  PRIMARY KEY (key, chunk)
);

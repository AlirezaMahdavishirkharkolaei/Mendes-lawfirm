-- Mendes platform — initial schema (Cloudflare D1 / SQLite).
--
-- Applied automatically on first request by src/lib/db/migrate.ts, and
-- also compatible with `cf d1 migrations apply <database-id>`.
-- Timestamps are ISO-8601 UTC strings. IDs are random UUIDs.

-- ── Accounts ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name          TEXT NOT NULL,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  -- client | lawyer | admin | author
  role          TEXT NOT NULL DEFAULT 'client',
  university    TEXT,
  bio           TEXT,
  slug          TEXT UNIQUE,
  locale        TEXT NOT NULL DEFAULT 'en',
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- One-time tokens: password set/reset, invitations.
CREATE TABLE IF NOT EXISTS user_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose    TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at    TEXT
);

-- ── Team ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  -- JSON: { "en": "...", "tr": "...", ... }
  position    TEXT NOT NULL,
  biography   TEXT NOT NULL,
  -- JSON array of topic keys from src/lib/topics.ts
  specialties TEXT NOT NULL DEFAULT '[]',
  languages   TEXT NOT NULL DEFAULT '[]',
  education   TEXT NOT NULL DEFAULT '[]',
  email       TEXT,
  phone       TEXT,
  photo_url   TEXT,
  user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  -- receives chatbot referrals for these specialties first
  is_referral_lead INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 100,
  updated_at  TEXT NOT NULL
);

-- ── Bookings ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  company       TEXT,
  topic         TEXT NOT NULL,
  message       TEXT NOT NULL,
  -- ISO UTC start of the requested slot
  slot_start    TEXT NOT NULL,
  duration_min  INTEGER NOT NULL DEFAULT 45,
  -- online | office
  meeting_mode  TEXT NOT NULL DEFAULT 'online',
  locale        TEXT NOT NULL DEFAULT 'en',
  -- pending | approved | rejected | cancelled
  status        TEXT NOT NULL DEFAULT 'pending',
  decision_note TEXT,
  decided_by    TEXT,
  decided_at    TEXT,
  user_id       TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL,
  ip_hash       TEXT
);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot_start);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ── Client club: cases, progress, documents ─────────────────────────
CREATE TABLE IF NOT EXISTS cases (
  id             TEXT PRIMARY KEY,
  reference      TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  description    TEXT,
  client_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id      TEXT REFERENCES users(id) ON DELETE SET NULL,
  practice_area  TEXT,
  -- intake | in_progress | awaiting_client | in_court | settled | closed
  status         TEXT NOT NULL DEFAULT 'intake',
  progress       INTEGER NOT NULL DEFAULT 0,
  next_step      TEXT,
  next_date      TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cases_client ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer ON cases(lawyer_id);

CREATE TABLE IF NOT EXISTS case_events (
  id          TEXT PRIMARY KEY,
  case_id     TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT,
  -- update | hearing | filing | document | message | milestone
  kind        TEXT NOT NULL DEFAULT 'update',
  author_id   TEXT REFERENCES users(id) ON DELETE SET NULL,
  is_internal INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_case_events_case ON case_events(case_id);

CREATE TABLE IF NOT EXISTS documents (
  id          TEXT PRIMARY KEY,
  case_id     TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  uploader_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  filename    TEXT NOT NULL,
  r2_key      TEXT NOT NULL UNIQUE,
  mime_type   TEXT NOT NULL,
  size_bytes  INTEGER NOT NULL,
  note        TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);

-- ── Articles (student / author publishing) ──────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id             TEXT PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  abstract       TEXT NOT NULL,
  body           TEXT NOT NULL,
  keywords       TEXT NOT NULL DEFAULT '[]',
  category       TEXT,
  locale         TEXT NOT NULL DEFAULT 'en',
  author_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attachment_key TEXT,
  attachment_name TEXT,
  -- submitted | revision | published | rejected
  status         TEXT NOT NULL DEFAULT 'submitted',
  reviewer_note  TEXT,
  reviewed_by    TEXT,
  views          INTEGER NOT NULL DEFAULT 0,
  published_at   TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);

-- ── Cyprus law explainer ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS laws (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  reference   TEXT NOT NULL,
  category    TEXT NOT NULL,
  -- JSON keyed by locale
  title       TEXT NOT NULL,
  summary     TEXT NOT NULL DEFAULT '{}',
  body        TEXT NOT NULL DEFAULT '{}',
  -- JSON: { "en": "ai" | "reviewed", ... }
  review      TEXT NOT NULL DEFAULT '{}',
  source_url  TEXT,
  -- draft | published
  status      TEXT NOT NULL DEFAULT 'draft',
  sort_order  INTEGER NOT NULL DEFAULT 100,
  updated_at  TEXT NOT NULL
);

-- ── AI chat ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id           TEXT PRIMARY KEY,
  locale       TEXT NOT NULL,
  topics       TEXT NOT NULL DEFAULT '[]',
  referred_to  TEXT,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS chat_messages (
  id         TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- ── AI business outreach (drafts require human approval) ────────────
CREATE TABLE IF NOT EXISTS prospects (
  id           TEXT PRIMARY KEY,
  company      TEXT NOT NULL,
  country      TEXT NOT NULL,
  sector       TEXT,
  -- investment | construction | company_formation | other
  interest     TEXT NOT NULL DEFAULT 'company_formation',
  contact_name TEXT,
  email        TEXT NOT NULL COLLATE NOCASE,
  website      TEXT,
  language     TEXT NOT NULL DEFAULT 'en',
  source       TEXT,
  -- new | drafted | contacted | replied | meeting | declined | unsubscribed
  status       TEXT NOT NULL DEFAULT 'new',
  notes        TEXT,
  last_contact_at TEXT,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_prospects_email ON prospects(email);

CREATE TABLE IF NOT EXISTS outreach_messages (
  id          TEXT PRIMARY KEY,
  prospect_id TEXT NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  -- outbound | inbound
  direction   TEXT NOT NULL,
  subject     TEXT NOT NULL,
  body        TEXT NOT NULL,
  -- draft | approved | sent | failed | received | discarded
  status      TEXT NOT NULL,
  ai_generated INTEGER NOT NULL DEFAULT 0,
  approved_by TEXT,
  error       TEXT,
  created_at  TEXT NOT NULL,
  sent_at     TEXT
);
CREATE INDEX IF NOT EXISTS idx_outreach_prospect ON outreach_messages(prospect_id);
CREATE INDEX IF NOT EXISTS idx_outreach_status ON outreach_messages(status);

CREATE TABLE IF NOT EXISTS suppressions (
  email      TEXT PRIMARY KEY COLLATE NOCASE,
  reason     TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
  id         TEXT PRIMARY KEY,
  period     TEXT NOT NULL UNIQUE,
  body       TEXT NOT NULL,
  stats      TEXT NOT NULL,
  sent_to    TEXT,
  created_at TEXT NOT NULL
);

-- ── Site control ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Per-locale overrides of public copy, editable in Admin → Content.
CREATE TABLE IF NOT EXISTS content_overrides (
  locale     TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (locale, key)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         TEXT PRIMARY KEY,
  actor      TEXT,
  action     TEXT NOT NULL,
  entity     TEXT,
  entity_id  TEXT,
  details    TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket     TEXT PRIMARY KEY,
  count      INTEGER NOT NULL,
  reset_at   INTEGER NOT NULL
);

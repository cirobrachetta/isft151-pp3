-- UPDATE 1.001: Añadir autenticación avanzada (sessions, refresh tokens, password reset, auditoría)

PRAGMA foreign_keys = ON;

-- Extensiones de users
ALTER TABLE users ADD COLUMN email TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
ALTER TABLE users ADD COLUMN failed_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TEXT;
ALTER TABLE users ADD COLUMN last_login  TEXT;

-- Sesiones server-side
CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,                -- uuid
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now','utc')),
  expires_at TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);

-- Refresh tokens para JWT
CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
  id TEXT PRIMARY KEY,                -- uuid
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,           -- hash del refresh token
  created_at TEXT NOT NULL DEFAULT (datetime('now','utc')),
  expires_at TEXT NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_art_user ON auth_refresh_tokens(user_id);

-- Password reset
CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,               -- uuid
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','utc')),
  expires_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pr_user ON password_resets(user_id);

-- Auditoría de intentos (opcional)
CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  username TEXT,
  success INTEGER NOT NULL,           -- 0/1
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','utc'))
);

-- Trigger: actualizar last_login al crear sesión
CREATE TRIGGER IF NOT EXISTS trg_session_last_login
AFTER INSERT ON auth_sessions
FOR EACH ROW BEGIN
  UPDATE users SET last_login = NEW.created_at WHERE id = NEW.user_id;
END;
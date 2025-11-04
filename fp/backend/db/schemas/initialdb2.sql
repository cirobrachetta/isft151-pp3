PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

------------------------------------------------------------
-- USUARIOS, ROLES Y ORGANIZACIONES
------------------------------------------------------------
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  organization_id INTEGER REFERENCES organizations(id)
);

CREATE TABLE organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  contact TEXT
);

CREATE TABLE roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  organization_scope INTEGER NOT NULL DEFAULT 0 -- 0 = global, 1 = por organización
);

CREATE TABLE permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, organization_id)
);

-- índice para ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_user_org
ON user_roles (user_id, organization_id);

------------------------------------------------------------
-- INVENTARIO Y FINANZAS BÁSICO
------------------------------------------------------------
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact TEXT,
  organization_id INTEGER REFERENCES organizations(id)
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  supplier_id INTEGER REFERENCES suppliers(id),
  cost NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  organization_id INTEGER REFERENCES organizations(id),
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  type TEXT NOT NULL CHECK (type IN ('compra','venta','ajuste+','ajuste-')),
  qty INTEGER NOT NULL CHECK (qty > 0),
  note TEXT,
  user_id INTEGER REFERENCES users(id),
  organization_id INTEGER REFERENCES organizations(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TESORERÍA (actualizado según DAOs)
------------------------------------------------------------

-- 💵 Movimientos de caja
CREATE TABLE cash_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  type TEXT NOT NULL CHECK (type IN ('ingreso', 'egreso')),
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 📜 Deudas (cuentas a pagar)
CREATE TABLE debts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creditor TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  due_date TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 💳 Pagos (asociados a deudas)
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  debt_id INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  method TEXT,
  notes TEXT
);

------------------------------------------------------------
-- EVENTOS Y VENTAS
------------------------------------------------------------
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  ticket_price NUMERIC NOT NULL,
  organization_id INTEGER REFERENCES organizations(id),
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE ticket_sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL CHECK (qty > 0),
  total NUMERIC NOT NULL CHECK (total >= 0),
  user_id INTEGER REFERENCES users(id),
  organization_id INTEGER REFERENCES organizations(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- AUDITORÍA Y SESIONES
------------------------------------------------------------
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now','utc')),
  expires_at TEXT NOT NULL
);

------------------------------------------------------------
-- DATOS BASE
------------------------------------------------------------
INSERT INTO organizations (name, contact)
VALUES ('Tres 3 Dos', 'contacto@tres3dos.ar');

INSERT INTO roles (name, organization_scope) VALUES
  ('administrador_general', 0),
  ('administrador', 1),
  ('tesorero', 1),
  ('organizador_eventos', 1),
  ('miembro', 1);

INSERT INTO permissions (code, description) VALUES
  ('ORG_MANAGE', 'Administrar organizaciones'),
  ('USER_MANAGE', 'Administrar usuarios y roles'),
  ('ROLE_MANAGE', 'Administrar permisos del sistema'),
  ('INVENTORY_VIEW', 'Ver inventario'),
  ('INVENTORY_EDIT', 'Modificar inventario'),
  ('FINANCE_VIEW', 'Ver finanzas'),
  ('FINANCE_MANAGE', 'Gestionar finanzas'),
  ('EVENT_VIEW', 'Ver eventos'),
  ('EVENT_CREATE', 'Crear o editar eventos');

-- permisos del superadmin: todos
INSERT INTO role_permissions
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'administrador_general';

-- crear superadmin (password temporal, se rehashea en initSuperadmin.js)
INSERT INTO users (username, password_hash, active)
VALUES ('superadmin', 'hash_superseguro', 1);

INSERT INTO user_roles (user_id, role_id, organization_id)
SELECT u.id, r.id, NULL
FROM users u, roles r
WHERE u.username='superadmin' AND r.name='administrador_general';

CREATE TABLE if not exists event_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
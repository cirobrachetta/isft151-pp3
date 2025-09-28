-- Seguridad
CREATE TABLE roles (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL -- admin, tesoreria, abastecimiento, boleteria
);
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE user_roles (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Inventario
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT
);
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  supplier_id INTEGER REFERENCES suppliers(id),
  cost NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0, -- snapshot rápido
  min_stock INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX idx_products_cat ON products(category_id);

-- Movimientos de stock (compra, ajuste, venta_de_producto)
CREATE TABLE stock_movements (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  type TEXT NOT NULL CHECK (type IN ('compra','venta','ajuste+','ajuste-')),
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_cost NUMERIC,   -- útil para compras
  note TEXT,
  event_id INTEGER,    -- opcional: movimiento asociado a evento
  user_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tesorería
CREATE TABLE cash_movements (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('ingreso','egreso')),
  concept TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  event_id INTEGER,
  user_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Deudas (cuentas a pagar)
CREATE TABLE debts (
  id INTEGER PRIMARY KEY,
  supplier_id INTEGER REFERENCES suppliers(id),
  description TEXT NOT NULL,
  amount_total NUMERIC NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pendiente','saldada')) DEFAULT 'pendiente',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  debt_id INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  paid_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER REFERENCES users(id)
);

-- Eventos y entradas
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  ticket_price NUMERIC NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);
-- Tipos de entrada opcionales (general, reducida, etc.)
CREATE TABLE ticket_types (
  id INTEGER PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL
);
CREATE UNIQUE INDEX idx_ticket_type_event_name ON ticket_types(event_id,name);

-- Ventas de entradas
CREATE TABLE ticket_sales (
  id INTEGER PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id INTEGER REFERENCES ticket_types(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price NUMERIC NOT NULL,
  user_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ventas de productos (en barra)
CREATE TABLE product_sales (
  id INTEGER PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  user_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE product_sale_items (
  sale_id INTEGER NOT NULL REFERENCES product_sales(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price NUMERIC NOT NULL,
  PRIMARY KEY (sale_id, product_id)
);

CREATE INDEX idx_stock_movements_prod ON stock_movements(product_id, created_at);
CREATE INDEX idx_cash_movements_event ON cash_movements(event_id, created_at);
CREATE INDEX idx_ticket_sales_event ON ticket_sales(event_id, created_at);

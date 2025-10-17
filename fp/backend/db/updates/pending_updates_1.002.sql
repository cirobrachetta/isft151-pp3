-- UPDATE 1.002: Soporte multi-organización, roles, permisos y solicitudes de stock
PRAGMA foreign_keys = ON;

----------------------------------------------------------------------
-- ORGANIZACIONES Y USUARIOS
----------------------------------------------------------------------

CREATE TABLE organizations (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  contact TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN organization_id INTEGER REFERENCES organizations(id);

ALTER TABLE roles ADD COLUMN organization_scope INTEGER NOT NULL DEFAULT 0;
-- 0 = global, 1 = por organización

----------------------------------------------------------------------
-- PERMISOS Y ASIGNACIONES
----------------------------------------------------------------------

CREATE TABLE permissions (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

DROP TABLE IF EXISTS user_roles;
CREATE TABLE user_roles (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id, organization_id)
);

----------------------------------------------------------------------
-- ASOCIAR DATOS CLAVE A ORGANIZACIÓN
----------------------------------------------------------------------

ALTER TABLE products ADD COLUMN organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE suppliers ADD COLUMN organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE events ADD COLUMN organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE cash_movements ADD COLUMN organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE debts ADD COLUMN organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE stock_movements ADD COLUMN organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE ticket_sales ADD COLUMN organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE product_sales ADD COLUMN organization_id INTEGER REFERENCES organizations(id);

CREATE TRIGGER IF NOT EXISTS trg_stock_inherit_org
AFTER INSERT ON stock_movements
FOR EACH ROW
WHEN NEW.organization_id IS NULL
BEGIN
  UPDATE stock_movements
  SET organization_id = (SELECT organization_id FROM products WHERE id = NEW.product_id)
  WHERE id = NEW.id;
END;

----------------------------------------------------------------------
-- SOLICITUDES DE STOCK (ORGANIZADOR ↔ TESORERO)
----------------------------------------------------------------------

CREATE TABLE stock_requests (
  id INTEGER PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
  requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  reviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pendiente','aprobada','rechazada','modificar')) DEFAULT 'pendiente',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT
);

CREATE TABLE stock_request_items (
  id INTEGER PRIMARY KEY,
  stock_request_id INTEGER NOT NULL REFERENCES stock_requests(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty INTEGER NOT NULL CHECK (qty > 0)
);

CREATE INDEX idx_stock_request_org ON stock_requests(organization_id, status);

----------------------------------------------------------------------
-- PERMISOS Y ROLES BASE
----------------------------------------------------------------------

INSERT INTO permissions (code, description) VALUES
  ('ORG_MANAGE', 'Administrar organizaciones'),
  ('USER_MANAGE', 'Administrar usuarios y roles'),
  ('ROLE_MANAGE', 'Administrar permisos del sistema'),
  ('INVENTORY_VIEW', 'Ver inventario disponible'),
  ('INVENTORY_EDIT', 'Modificar inventario'),
  ('STOCK_REQUEST_CREATE', 'Crear solicitudes de stock'),
  ('STOCK_REQUEST_REVIEW', 'Revisar, aprobar o rechazar solicitudes de stock'),
  ('FINANCE_VIEW', 'Ver fondos y reportes financieros'),
  ('FINANCE_MANAGE', 'Gestionar ingresos, egresos y pagos'),
  ('EVENT_VIEW', 'Ver eventos y ventas'),
  ('EVENT_CREATE', 'Crear y editar eventos');

INSERT INTO roles (name, organization_scope) VALUES
  ('administrador_general', 0),
  ('administrador', 1),
  ('tesorero', 1),
  ('organizador_eventos', 1),
  ('miembro', 1);

-- administrador_general: acceso total
INSERT INTO role_permissions
  SELECT r.id, p.id FROM roles r, permissions p
  WHERE r.name = 'administrador_general';

-- administrador: gestiona usuarios, eventos y stock dentro de su organización
INSERT INTO role_permissions
  SELECT r.id, p.id FROM roles r
  JOIN permissions p ON p.code IN (
    'USER_MANAGE',
    'INVENTORY_VIEW',
    'INVENTORY_EDIT',
    'STOCK_REQUEST_CREATE',
    'EVENT_VIEW',
    'EVENT_CREATE'
  )
  WHERE r.name = 'administrador';

-- tesorero: maneja finanzas y aprueba/rechaza solicitudes de stock
INSERT INTO role_permissions
  SELECT r.id, p.id FROM roles r
  JOIN permissions p ON p.code IN (
    'FINANCE_VIEW',
    'FINANCE_MANAGE',
    'INVENTORY_VIEW',
    'STOCK_REQUEST_REVIEW'
  )
  WHERE r.name = 'tesorero';

-- organizador_eventos: crea eventos y solicita stock
INSERT INTO role_permissions
  SELECT r.id, p.id FROM roles r
  JOIN permissions p ON p.code IN (
    'EVENT_VIEW',
    'EVENT_CREATE',
    'INVENTORY_VIEW',
    'STOCK_REQUEST_CREATE'
  )
  WHERE r.name = 'organizador_eventos';

-- miembro: solo lectura
INSERT INTO role_permissions
  SELECT r.id, p.id FROM roles r
  JOIN permissions p ON p.code IN (
    'INVENTORY_VIEW',
    'EVENT_VIEW'
  )
  WHERE r.name = 'miembro';

  ----------------------------------------------------------------------
-- TRIGGERS: AUTOMATIZAR MOVIMIENTOS AL APROBAR SOLICITUD DE STOCK
----------------------------------------------------------------------

-- 1. Trigger principal: al cambiar el estado a 'aprobada', generar movimientos de stock
CREATE TRIGGER IF NOT EXISTS trg_stock_request_approved
AFTER UPDATE OF status ON stock_requests
FOR EACH ROW
WHEN NEW.status = 'aprobada' AND OLD.status != 'aprobada'
BEGIN
  INSERT INTO stock_movements (
    product_id,
    type,
    qty,
    unit_cost,
    note,
    event_id,
    user_id,
    organization_id
  )
  SELECT
    sri.product_id,
    'ajuste-',
    sri.qty,
    p.cost,
    'Salida por solicitud aprobada #' || NEW.id,
    NEW.event_id,
    NEW.reviewer_id,
    NEW.organization_id
  FROM stock_request_items sri
  JOIN products p ON p.id = sri.product_id
  WHERE sri.stock_request_id = NEW.id;
END;


-- 2. Trigger financiero opcional:
-- Si hay un costo asociado al movimiento de stock, registrar salida en tesorería
CREATE TRIGGER IF NOT EXISTS trg_stock_request_finance
AFTER UPDATE OF status ON stock_requests
FOR EACH ROW
WHEN NEW.status = 'aprobada'
BEGIN
  INSERT INTO cash_movements (
    type,
    concept,
    amount,
    event_id,
    user_id,
    organization_id
  )
  SELECT
    'egreso',
    'Consumo de insumos por solicitud #' || NEW.id,
    SUM(p.cost * sri.qty),
    NEW.event_id,
    NEW.reviewer_id,
    NEW.organization_id
  FROM stock_request_items sri
  JOIN products p ON p.id = sri.product_id
  WHERE sri.stock_request_id = NEW.id;
END;


-- 3. Auditoría básica: registrar toda actualización de estado
CREATE TRIGGER IF NOT EXISTS trg_stock_request_audit
AFTER UPDATE OF status ON stock_requests
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (
    user_id,
    action,
    entity,
    entity_id
  ) VALUES (
    NEW.reviewer_id,
    'UPDATE_STATUS:' || NEW.status,
    'stock_requests',
    NEW.id
  );
END;
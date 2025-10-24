-- UPDATE 1.003: Estructura inicial y organización base
PRAGMA foreign_keys = OFF;

-- 0. Ajustar user_roles para permitir organization_id NULL (para roles globales)
CREATE TABLE IF NOT EXISTS user_roles_new (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id, organization_id)
);

INSERT INTO user_roles_new (user_id, role_id, organization_id)
SELECT user_id, role_id, organization_id FROM user_roles;

DROP TABLE user_roles;
ALTER TABLE user_roles_new RENAME TO user_roles;

PRAGMA foreign_keys = ON;

-- 1. Crear organización base
INSERT INTO organizations (name, contact, created_at)
SELECT 'Tres 3 Dos', 'contacto@tres3dos.ar', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name='Tres 3 Dos');

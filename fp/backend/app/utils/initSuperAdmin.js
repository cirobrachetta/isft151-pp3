const bcrypt = require('bcryptjs');
const { getDB } = require('../../db/connection');

function initSuperadmin() {
  const db = getDB();
  const username = 'superadmin';
  const password = 'SuperAdmin123!';

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return;

  const hash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (username, password_hash, active, created_at, organization_id)
    VALUES (?, ?, 1, CURRENT_TIMESTAMP, NULL)
  `).run(username, hash);

  const userId = db.prepare('SELECT id FROM users WHERE username = ?').get(username).id;
  const roleId = db.prepare('SELECT id FROM roles WHERE name = ?').get('administrador_general').id;

  db.prepare(`
    INSERT INTO user_roles (user_id, role_id, organization_id)
    VALUES (?, ?, NULL)
  `).run(userId, roleId);

  console.log('Superadmin creado: usuario=superadmin, pass=SuperAdmin123!');
}

module.exports = { initSuperadmin };
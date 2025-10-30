const { runQuery, getQuery, allQuery } = require('../utils/DBUtil');
const User = require('../models/User');

const UserDAO = {
  selectUserByUsername(username) {
    const row = getQuery(`
      SELECT id, username, password_hash, active, created_at
      FROM users
      WHERE username = :username;
    `, { username });
    return User.fromRow(row);
  },

  selectUserById(id) {
    const row = getQuery(`
      SELECT id, username, password_hash, active, created_at
      FROM users
      WHERE id = :id;
    `, { id });
    return User.fromRow(row);
  },

  selectUsers() {
    const rows = allQuery(`
      SELECT id, username, active, created_at
      FROM users
      ORDER BY id;
    `);
    if (!rows || !Array.isArray(rows)) return [];
    return rows.map(User.fromRow);
  },

  insertUser({ username, hash, organizationId }) {
    const info = runQuery(`
      INSERT INTO users (username, password_hash, organization_id, active, created_at)
      VALUES (:username, :hash, :organizationId, 1, CURRENT_TIMESTAMP);
    `, { username, hash, organizationId });
    return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
  },

  updateUserById({ id, username, hash }) {
    const info = runQuery(`
      UPDATE users
      SET username = :username, password_hash = :hash
      WHERE id = :id;
    `, { id, username, hash });
    return { changes: info.changes };
  },

  deleteUserById(id) {
    const info = runQuery(`
      DELETE FROM users
      WHERE id = :id;
    `, { id });
    return { changes: info.changes };
  },

  existsUserByUsername(username) {
    const { found } = getQuery(`
      SELECT EXISTS(SELECT 1 FROM users WHERE username = :username) AS found;
    `, { username }) || {};
    return Boolean(found);
  },

  selectRoleAndOrgByUserId(userId) {
    return getQuery(`
      SELECT r.name AS role, o.id AS organization_id
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      LEFT JOIN organizations o ON o.id = ur.organization_id
      WHERE ur.user_id = :userId
      LIMIT 1;
    `, { userId }) || {};
  },

  assignDefaultRole(userId, organizationId) {
    const info = runQuery(`
      INSERT INTO user_roles (user_id, role_id, organization_id)
      VALUES (:userId, (SELECT id FROM roles WHERE name = 'miembro'), :organizationId);
    `, { userId, organizationId });
    return { changes: info.changes };
  },

  assignRoleToUser(userId, roleId) {
    const info = runQuery(`
      UPDATE user_roles
      SET role_id = :roleId
      WHERE user_id = :userId;
    `, { userId, roleId });

    // si no tenía registro, lo insertamos
    if (info.changes === 0) {
      runQuery(`
        INSERT INTO user_roles (user_id, role_id)
        VALUES (:userId, :roleId);
      `, { userId, roleId });
    }

    return { changes: 1 };
  },

  selectOrganizationsByUserId(userId) {
    return allQuery(`
      SELECT o.id, o.name
      FROM user_roles ur
      JOIN organizations o ON o.id = ur.organization_id
      WHERE ur.user_id = :userId
      ORDER BY o.name;
    `, { userId });
  },


};

module.exports = UserDAO;
const { runQuery, allQuery } = require('../utils/DBUtil');

const OrganizationDAO = {
  selectAll() {
    return allQuery(`
      SELECT id, name, contact
      FROM organizations
      ORDER BY name;
    `);
  },

  insert({ name, contact }) {
    const info = runQuery(`
      INSERT INTO organizations (name, contact)
      VALUES (:name, :contact);
    `, { name, contact });
    return { id: info.lastInsertRowid, name, contact };
  },

  getOrgByUser(userId) {
  return getQuery(`
    SELECT organization_id
    FROM user_roles
    WHERE user_id = :userId
    LIMIT 1;
  `, { userId });
},
};

module.exports = OrganizationDAO;
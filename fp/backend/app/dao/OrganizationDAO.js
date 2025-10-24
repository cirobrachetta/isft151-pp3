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
  }
};

module.exports = OrganizationDAO;
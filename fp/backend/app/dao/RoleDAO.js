const { allQuery } = require('../utils/DBUtil');

const RoleDAO = {
  selectAll() {
    const rows = allQuery(`
      SELECT id, name, organization_scope
      FROM roles
      ORDER BY id;
    `);
    return rows || [];
  }
};

module.exports = RoleDAO;
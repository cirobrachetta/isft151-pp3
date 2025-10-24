const { allQuery } = require('../utils/DBUtil');

const RoleDAO = {
  selectAll() {
    return allQuery(`
      SELECT id, name, organization_scope
      FROM roles
      ORDER BY id;
    `);
  }
};

module.exports = RoleDAO;
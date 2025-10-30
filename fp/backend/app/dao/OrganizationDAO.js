const { runQuery, allQuery, getQuery } = require('../utils/DBUtil');

const OrganizationDAO = {
  selectAll() {
    try {
      const rows = allQuery(`
        SELECT id, name, contact, COALESCE(budget, 0) as budget
        FROM organizations
        ORDER BY name;
      `);
      return rows || [];
    } catch (e) {
      // fallback if budget column doesn't exist yet
      const rows = allQuery(`SELECT id, name, contact FROM organizations ORDER BY name;`);
      return (rows || []).map(r => ({ ...r, budget: 0 }));
    }
  },

  findById(id) {
    try {
      const row = getQuery(`
        SELECT id, name, contact, COALESCE(budget, 0) as budget
        FROM organizations
        WHERE id = :id;
      `, { id });
      return row || null;
    } catch (e) {
      const row = getQuery(`SELECT id, name, contact FROM organizations WHERE id = :id;`, { id });
      return row ? { ...row, budget: 0 } : null;
    }
  },

  // atomically increment/decrement budget
  incrementBudget(id, delta) {
    runQuery(`
      UPDATE organizations
      SET budget = COALESCE(budget, 0) + :delta
      WHERE id = :id;
    `, { id, delta });
    return this.findById(id);
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
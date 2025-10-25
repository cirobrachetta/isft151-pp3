const { runQuery, getQuery, allQuery } = require('../utils/DBUtil');
const Debt = require('../models/Debt');

const DebtDAO = {
  insert(debt) {
    return runQuery(`
      INSERT INTO debts (creditor, amount, due_date, description, created_at)
      VALUES (:creditor, :amount, :due_date, :description, CURRENT_TIMESTAMP);
    `, debt);
  },

  findAll() {
    const rows = allQuery(`
      SELECT id, creditor, amount, due_date, description, created_at
      FROM debts
      ORDER BY due_date ASC;
    `);
    return rows.map(Debt.fromRow);
  },

  findById(id) {
    const row = getQuery(`
      SELECT id, creditor, amount, due_date, description, created_at
      FROM debts
      WHERE id = :id;
    `, { id });
    return row ? Debt.fromRow(row) : null;
  },

  deleteById(id) {
    return runQuery(`
      DELETE FROM debts
      WHERE id = :id;
    `, { id });
  },
};

module.exports = DebtDAO;

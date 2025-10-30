const { runQuery, getQuery, allQuery } = require('../utils/DBUtil');
const Debt = require('../models/Debt');

const DebtDAO = {
  insert(debt) {
    const result = runQuery(`
      INSERT INTO debts (creditor, amount, due_date, description, created_at)
      VALUES (:creditor, :amount, :due_date, :description, CURRENT_TIMESTAMP);
    `, debt);

    const id = result && result.lastInsertRowid ? result.lastInsertRowid : null;
    if (!id) return result;

    const row = getQuery(`
      SELECT id, creditor, amount, amount_paid, due_date, description, created_at
      FROM debts
      WHERE id = :id;
    `, { id });
    return row ? Debt.fromRow(row) : null;
  },

  findAll() {
    const rows = allQuery(`
      SELECT id, creditor, amount, amount_paid, due_date, description, created_at
      FROM debts
      ORDER BY due_date ASC;
    `);
    if (!rows || !Array.isArray(rows)) return [];
    return rows.map(Debt.fromRow);
  },

  findById(id) {
    const row = getQuery(`
      SELECT id, creditor, amount, amount_paid, due_date, description, created_at
      FROM debts
      WHERE id = :id;
    `, { id });
    return row ? Debt.fromRow(row) : null;
  },

  // Increase amount_paid for a debt and return updated debt
  addPayment(debtId, amount) {
    runQuery(`
      UPDATE debts
      SET amount_paid = COALESCE(amount_paid, 0) + :amount
      WHERE id = :id;
    `, { id: debtId, amount });
    return this.findById(debtId);
  },

  deleteById(id) {
    return runQuery(`
      DELETE FROM debts
      WHERE id = :id;
    `, { id });
  },
};

module.exports = DebtDAO;

const { runQuery, getQuery, allQuery } = require('../utils/DBUtil');
const CashMovement = require('../models/CashMovement');

const CashMovementDAO = {
  insert(movement) {
    return runQuery(`
      INSERT INTO cash_movements (amount, type, description, created_at)
      VALUES (:amount, :type, :description, CURRENT_TIMESTAMP);
    `, movement);
  },

  findAll() {
    const rows = allQuery(`
      SELECT id, amount, type, description, created_at
      FROM cash_movements
      ORDER BY created_at DESC;
    `);
    return rows.map(CashMovement.fromRow);
  },

  findById(id) {
    const row = getQuery(`
      SELECT id, amount, type, description, created_at
      FROM cash_movements
      WHERE id = :id;
    `, { id });
    return row ? CashMovement.fromRow(row) : null;
  },

  deleteById(id) {
    return runQuery(`
      DELETE FROM cash_movements
      WHERE id = :id;
    `, { id });
  },
};

module.exports = CashMovementDAO;

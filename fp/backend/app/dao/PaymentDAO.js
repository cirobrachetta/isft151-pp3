const { runQuery, getQuery, allQuery } = require('../utils/DBUtil');
const Payment = require('../models/Payment');

const PaymentDAO = {
  insert(payment) {
    return runQuery(`
      INSERT INTO payments (debt_id, amount, payment_date, method, notes)
      VALUES (:debt_id, :amount, :payment_date, :method, :notes);
    `, payment);
  },

  findByDebtId(debt_id) {
    const rows = allQuery(`
      SELECT id, debt_id, amount, payment_date, method, notes
      FROM payments
      WHERE debt_id = :debt_id
      ORDER BY payment_date DESC;
    `, { debt_id });
    return rows.map(Payment.fromRow);
  },

  findById(id) {
    const row = getQuery(`
      SELECT id, debt_id, amount, payment_date, method, notes
      FROM payments
      WHERE id = :id;
    `, { id });
    return row ? Payment.fromRow(row) : null;
  },

  deleteById(id) {
    return runQuery(`
      DELETE FROM payments
      WHERE id = :id;
    `, { id });
  },
};

module.exports = PaymentDAO;

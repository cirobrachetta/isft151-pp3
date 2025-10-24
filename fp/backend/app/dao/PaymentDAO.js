const db = require('../../db/db.js');
const { loadQuery } = require('../utils/QueryLoader');

class PaymentDAO {
  async insert(payment) {
    const sql = loadQuery('payments.insertPayment');
    await db.run(sql, payment);
  }

  async findByDebtId(debt_id) {
    const sql = loadQuery('payments.selectPaymentsByDebtId');
    return db.all(sql, { debt_id });
  }

  async findById(id) {
    const sql = loadQuery('payments.selectPaymentById');
    return db.get(sql, { id });
  }

  async deleteById(id) {
    const sql = loadQuery('payments.deletePaymentById');
    await db.run(sql, { id });
  }
}

module.exports = new PaymentDAO();

const db = require('../../db/db.js');
const { loadQuery } = require('../utils/QueryLoader');

class DebtDAO {
  async insert(debt) {
    const sql = loadQuery('debts.insertDebt');
    await db.run(sql, debt);
  }

  async findAll() {
    const sql = loadQuery('debts.selectAllDebts');
    return db.all(sql);
  }

  async findById(id) {
    const sql = loadQuery('debts.selectDebtById');
    return db.get(sql, { id });
  }

  async deleteById(id) {
    const sql = loadQuery('debts.deleteDebtById');
    await db.run(sql, { id });
  }
}

module.exports = new DebtDAO();

const db = require('../../db/db.js');
const { loadQuery } = require('../utils/QueryLoader');

class CashMovementDAO {
  async insert(movement) {
    const sql = loadQuery('cash.insertMovement');
    await db.run(sql, movement);
  }

  async findAll() {
    const sql = loadQuery('cash.selectAllMovements');
    return db.all(sql);
  }

  async findById(id) {
    const sql = loadQuery('cash.selectMovementById');
    return db.get(sql, { id });
  }

  async deleteById(id) {
    const sql = loadQuery('cash.deleteMovementById');
    await db.run(sql, { id });
  }
}

module.exports = new CashMovementDAO();

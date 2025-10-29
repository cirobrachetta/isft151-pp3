const { runQuery, getQuery, allQuery } = require('../utils/DBUtil');
const CashMovement = require('../models/CashMovement');

const CashMovementDAO = {
  insert(movement) {
    // Ejecuta insert y devuelve la fila recién creada como modelo
    const result = runQuery(`
      INSERT INTO cash_movements (amount, type, description, created_at)
      VALUES (:amount, :type, :description, CURRENT_TIMESTAMP);
    `, movement);

    // result.lastInsertRowid proviene de better-sqlite3
    const id = result && result.lastInsertRowid ? result.lastInsertRowid : null;
    if (!id) return result;

    const row = getQuery(`
      SELECT id, type, amount, description, created_at
      FROM cash_movements
      WHERE id = :id;
    `, { id });
    return row ? CashMovement.fromRow(row) : null;
  },

  findAll() {
  // Devolvemos columnas en orden id, type, amount, description, created_at para alinear con la UI
  const rows = allQuery(`
    SELECT id, type, amount, description, created_at
    FROM cash_movements
    ORDER BY created_at DESC;
  `);

  // Aseguramos que rows sea un array
  if (!rows || !Array.isArray(rows)) {
    return []; // Devuelve array vacío si no hay resultados
  }

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

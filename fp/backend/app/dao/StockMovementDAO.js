const { runQuery } = require('../utils/DBUtil');

const StockMovementDAO = {
  insert({ productId, type, qty, note, userId, organizationId }) {
    return runQuery(`
      INSERT INTO stock_movements (product_id, type, qty, note, user_id, organization_id)
      VALUES (:productId, :type, :qty, :note, :userId, :organizationId);
    `, { productId, type, qty, note, userId, organizationId });
  },
  selectByProduct(productId) {
    return allQuery(`
      SELECT id, type, qty, note, created_at
      FROM stock_movements
      WHERE product_id = :productId
      ORDER BY created_at DESC;
    `, { productId });
  }
};

module.exports = StockMovementDAO;
const { runQuery, allQuery, getQuery } = require("../utils/DBUtil");

const EventProductDAO = {
  selectByEvent(eventId) {
    return allQuery(`
      SELECT ep.id, ep.qty, p.id AS product_id, p.name AS product, p.stock
      FROM event_products ep
      JOIN products p ON p.id = ep.product_id
      WHERE ep.event_id = :eventId;
    `, { eventId });
  },

  insertReservation(eventId, productId, qty) {
    return runQuery(`
      INSERT INTO event_products (event_id, product_id, qty)
      VALUES (:eventId, :productId, :qty);
    `, { eventId, productId, qty });
  },

  validateStock(productId, qty) {
    const row = getQuery(`SELECT stock FROM products WHERE id = :productId;`, { productId });
    if (!row) throw new Error("Producto no encontrado");
    if (qty > row.stock) throw new Error("Cantidad supera el stock disponible");
  },

  updateStock(productId, qty) {
    runQuery(`
      UPDATE products
      SET stock = stock - :qty
      WHERE id = :productId;
    `, { productId, qty });
  },
};

module.exports = EventProductDAO;
const { runQuery, getQuery, allQuery } = require('../utils/DBUtil');

const EventDAO = {
  selectAll() {
    return allQuery(`
      SELECT e.id, e.name, e.date, e.ticket_price, e.active,
             o.name AS organization
      FROM events e
      LEFT JOIN organizations o ON o.id = e.organization_id
      ORDER BY e.active DESC, e.date DESC;
    `);
  },

  selectById(id) {
    return getQuery(`
      SELECT e.*, o.name AS organization
      FROM events e
      LEFT JOIN organizations o ON o.id = e.organization_id
      WHERE e.id = :id;
    `, { id });
  },

  insert({ name, date, ticketPrice, organizationId }) {
    const info = runQuery(`
      INSERT INTO events (name, date, ticket_price, organization_id)
      VALUES (:name, :date, :ticketPrice, :organizationId);
    `, { name, date, ticketPrice, organizationId });
    return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
  },

  update(id, { name, date, ticketPrice, active }) {
    const info = runQuery(`
      UPDATE events
      SET name = :name,
          date = :date,
          ticket_price = :ticketPrice,
          active = :active
      WHERE id = :id;
    `, { id, name, date, ticketPrice, active });
    return { changes: info.changes };
  },

  deactivate(id) {
    return runQuery(`
      UPDATE events
      SET active = 0
      WHERE id = :id;
    `, { id });
  },

  // Metodos de productos del evento

  selectProductsByEvent(eventId) {
    return allQuery(`
      SELECT ep.id, p.id AS product_id, p.name, ep.qty, p.stock
      FROM event_products ep
      JOIN products p ON p.id = ep.product_id
      WHERE ep.event_id = :eventId;
    `, { eventId });
  },

  assignProductToEvent(eventId, productId, qty) {
    const stock = getQuery(`SELECT stock FROM products WHERE id = :productId;`, { productId });
    if (!stock) throw new Error("Producto no encontrado");
    if (qty > stock.stock) throw new Error("Cantidad supera el stock disponible");

    // transacción manual para garantizar integridad
    runQuery("BEGIN TRANSACTION;");
    try {
      runQuery(`
        INSERT INTO event_products (event_id, product_id, qty)
        VALUES (:eventId, :productId, :qty);
      `, { eventId, productId, qty });

      runQuery(`
        UPDATE products
        SET stock = stock - :qty
        WHERE id = :productId;
      `, { productId, qty });

      runQuery("COMMIT;");
    } catch (err) {
      runQuery("ROLLBACK;");
      throw err;
    }
  },

  removeProductFromEvent(reservationId) {
    const row = getQuery(`
      SELECT product_id, qty
      FROM event_products
      WHERE id = :reservationId;
    `, { reservationId });

    if (!row) throw new Error("Reserva no encontrada");

    runQuery("BEGIN TRANSACTION;");
    try {
      // devolver stock
      runQuery(`
        UPDATE products
        SET stock = stock + :qty
        WHERE id = :productId;
      `, { productId: row.product_id, qty: row.qty });

      // eliminar la asignación
      runQuery(`
        DELETE FROM event_products WHERE id = :reservationId;
      `, { reservationId });

      runQuery("COMMIT;");
    } catch (err) {
      runQuery("ROLLBACK;");
      throw err;
    }
  },

  updateAssignedProduct(eventId, productId, qty) {
  const existing = getQuery(`
    SELECT id FROM event_products
    WHERE event_id = :eventId AND product_id = :productId;
  `, { eventId, productId });

  if (!existing) throw new Error("Asignación no encontrada");

  runQuery(`
      UPDATE event_products
      SET qty = :qty
      WHERE id = :id;
    `, { qty, id: existing.id });

    return { changes: 1 };
  },

  removeAssignedProduct(eventId, productId) {
    const existing = getQuery(`
      SELECT id, qty FROM event_products
      WHERE event_id = :eventId AND product_id = :productId;
    `, { eventId, productId });

    if (!existing) throw new Error("Asignación no encontrada");

    // Devolver stock
    runQuery(`
      UPDATE products
      SET stock = stock + :qty
      WHERE id = :productId;
    `, { qty: existing.qty, productId });

    // Eliminar asignación
    runQuery(`
      DELETE FROM event_products WHERE id = :id;
    `, { id: existing.id });

    return { changes: 1 };
  },

};

module.exports = EventDAO;
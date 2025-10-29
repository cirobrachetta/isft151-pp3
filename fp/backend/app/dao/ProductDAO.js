const { runQuery, getQuery, allQuery } = require('../utils/DBUtil');

const ProductDAO = {
  selectAll() {
    return allQuery(`
        SELECT p.id, p.name, p.cost, p.price, p.stock, p.min_stock,
            c.name AS category, s.name AS supplier, p.active
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN suppliers s ON s.id = p.supplier_id
        ORDER BY p.active DESC, p.id;
    `);
  },


  selectById(id) {
    return getQuery(`
      SELECT p.*, c.name AS category, s.name AS supplier
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN suppliers s ON s.id = p.supplier_id
      WHERE p.id = :id;
    `, { id });
  },

  insert({ name, categoryId, supplierId, cost, price, stock, minStock, organizationId }) {
    const info = runQuery(`
      INSERT INTO products (name, category_id, supplier_id, cost, price, stock, min_stock, organization_id)
      VALUES (:name, :categoryId, :supplierId, :cost, :price, :stock, :minStock, :organizationId);
    `, { name, categoryId, supplierId, cost, price, stock, minStock, organizationId });
    return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
  },

  update(id, { name, categoryId, supplierId, cost, price, stock, minStock, active }) {
    const info = runQuery(`
      UPDATE products
      SET name = :name,
          category_id = :categoryId,
          supplier_id = :supplierId,
          cost = :cost,
          price = :price,
          stock = :stock,
          min_stock = :minStock,
          active = :active
      WHERE id = :id;
    `, { id, name, categoryId, supplierId, cost, price, stock, minStock, active });
    return { changes: info.changes };
  },

  deactivate(id) {
    return runQuery(`
        UPDATE products
        SET active = 0
        WHERE id = :id;
    `, { id });
  },

};

module.exports = ProductDAO;
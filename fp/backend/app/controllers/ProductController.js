const ProductDAO = require('../dao/ProductDAO');
const StockMovementDAO = require('../dao/StockMovementDAO');
const OrganizationDAO = require('../dao/OrganizationDAO');

const ProductController = {
  list(_req, res) {
    try {
      const products = ProductDAO.selectAll();
      res.json(products);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  getById(req, res) {
    try {
      const product = ProductDAO.selectById(Number(req.params.id));
      if (!product) return res.status(404).json({ error: 'Not found' });
      res.json(product);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  create(req, res) {
    try {
        const { name, categoryId, supplierId, cost, price, stock, minStock, organizationId } = req.body;
        const userId = req.userId;

        if (!name) throw new Error('Name required');

        let orgId = organizationId;
        if (!orgId) {
            const row = OrganizationDAO.getOrgByUser(userId);
        orgId = row?.organization_id || null;
        }

        const info = ProductDAO.insert({
        name,
        categoryId,
        supplierId,
        cost,
        price,
        stock,
        minStock,
        organizationId: orgId,
        });

        const productId = info.lastInsertRowid;

        if (stock > 0) {
        StockMovementDAO.insert({
            productId,
            type: 'ajuste+',
            qty: stock,
            note: 'Stock inicial',
            userId,
            organizationId: orgId,
        });
        }

        res.status(201).json({ message: 'Created', id: productId });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
    },

  update(req, res) {
    try {
      const id = Number(req.params.id);
      const prev = ProductDAO.selectById(id);
      if (!prev) throw new Error('Product not found');

      const {
        name = prev.name,
        categoryId = prev.category_id,
        supplierId = prev.supplier_id,
        cost = prev.cost,
        price = prev.price,
        stock = prev.stock,
        minStock = prev.min_stock,
        active = prev.active,
        organizationId = prev.organization_id
      } = req.body;

      ProductDAO.update(id, { name, categoryId, supplierId, cost, price, stock, minStock, active });

      // registrar movimiento si cambia el stock
      const diff = stock - prev.stock;
      if (diff !== 0) {
        StockMovementDAO.insert({
          productId: id,
          type: diff > 0 ? 'ajuste+' : 'ajuste-',
          qty: Math.abs(diff),
          note: 'Ajuste manual de stock',
          userId: req.userId,
          organizationId,
        });
      }

      res.json({ message: 'Updated' });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  remove(req, res) {
    try {
        const id = Number(req.params.id);
        const product = ProductDAO.selectById(id);
        if (!product) throw new Error('Product not found');

        ProductDAO.deactivate(id);
        res.json({ message: 'Product deactivated' });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
  },

};

module.exports = { ProductController };
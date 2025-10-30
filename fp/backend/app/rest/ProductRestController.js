const router = require('express').Router();
const { ProductController } = require('../controllers/ProductController');
const { requireAuth } = require('../utils/AuthMiddleware');
const StockMovementDAO = require('../dao/StockMovementDAO');

// CRUD de productos
router.get('/', requireAuth, ProductController.list);
router.get('/:id', requireAuth, ProductController.getById);
router.post('/', requireAuth, ProductController.create);
router.put('/:id', requireAuth, ProductController.update);
router.delete('/:id', requireAuth, ProductController.remove);

// historial de movimientos de stock
router.get('/:id/movements', requireAuth, (req, res) => {
  try {
    const productId = Number(req.params.id);
    const data = StockMovementDAO.selectByProduct(productId);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;

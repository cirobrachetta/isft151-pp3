const router = require('express').Router();
const { EventController } = require('../controllers/EventController');
const { requireAuth } = require('../utils/AuthMiddleware');

router.get('/', requireAuth, EventController.list);
router.get('/:id', requireAuth, EventController.getById);
router.post('/', requireAuth, EventController.create);
router.put('/:id', requireAuth, EventController.update);
router.delete('/:id', requireAuth, EventController.remove);

// Rutas relacionadas a productos de eventos
router.get('/:id/products', requireAuth, EventController.listProducts);
router.post('/:id/products', requireAuth, EventController.assignProduct);
router.put('/:eventId/products/:productId', requireAuth, EventController.updateAssignedProduct);
router.delete('/:eventId/products/:productId', requireAuth, EventController.removeAssignedProduct);

//PDF
router.get('/:id/pdf', requireAuth, EventController.printPDF);

module.exports = router;
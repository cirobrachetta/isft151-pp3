const express = require('express');
const router = express.Router();
const controller = require('../controllers/PaymentController');

router.post('/', controller.create);
router.get('/debt/:debtId', controller.listByDebt);
router.get('/:id', controller.get);
router.delete('/:id', controller.delete);

module.exports = router;

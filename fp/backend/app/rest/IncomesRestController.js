const express = require('express');
const router = express.Router();
// Reuse existing cash movement DAO logic for incomes
const controller = require('../controllers/IncomesController');

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.get);
router.delete('/:id', controller.delete);

module.exports = router;

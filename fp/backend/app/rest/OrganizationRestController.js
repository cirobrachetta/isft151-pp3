const { Router } = require('express');
const OrganizationController = require('../controllers/OrganizationController');

const router = Router();

router.get('/', OrganizationController.list);
router.post('/', OrganizationController.create);

router.get('/:id', OrganizationController.get);
router.put('/:id/budget', OrganizationController.updateBudget);

module.exports = router;
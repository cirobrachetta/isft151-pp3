const { Router } = require('express');
const OrganizationController = require('../controllers/OrganizationController');

const router = Router();

router.get('/', OrganizationController.list);
router.post('/', OrganizationController.create);

module.exports = router;
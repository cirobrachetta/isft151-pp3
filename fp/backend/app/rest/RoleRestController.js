const { Router } = require('express');
const RoleController = require('../controllers/RoleController');
const { requireAuth } = require('../utils/AuthMiddleware');

const router = Router();

router.get('/', requireAuth, RoleController.list);

module.exports = router;
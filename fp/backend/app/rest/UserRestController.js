const { Router } = require('express');
const { UserController } = require('../controllers/UserController');
const { requireAuth } = require('../utils/AuthMiddleware');

const router = require('express').Router();

// Público
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Protegido
router.post('/logout', requireAuth, UserController.logout);
router.put('/:id', requireAuth, UserController.update);
router.delete('/:id', requireAuth, UserController.remove);
router.get('/', requireAuth, UserController.list);
router.post('/:id/assignRole', requireAuth, UserController.assignRole);

module.exports = router;
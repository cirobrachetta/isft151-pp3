const { Router } = require('express');
const UserController = require('../controllers/UserController');

const router = Router();

// Rutas de usuario
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.remove);
router.get('/', UserController.list);

module.exports = router;
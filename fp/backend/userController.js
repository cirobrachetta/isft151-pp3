// Controlador que expone las rutas REST
const express = require("express");
const router = express.Router();
const UserService = require("./userService");

const userService = new UserService();

// Registrar usuario
router.post("/register", (req, res) => {
    try {
        const { username, password } = req.body;
        const user = userService.register(username, password);
        res.json(user);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Editar usuario
router.put("/:id", (req, res) => {
    try {
        const { id } = req.params;
        const { username, password } = req.body;
        const user = userService.updateUser(Number(id), username, password);
        res.json(user);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Eliminar usuario
router.delete("/:id", (req, res) => {
    try {
        userService.deleteUser(Number(req.params.id));
        res.json({ message: "User deleted" });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Login
router.post("/login", (req, res) => {
    try {
        const { username, password } = req.body;
        const token = userService.login(username, password);
        res.json({ token });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Logout
router.post("/logout", (req, res) => {
    try {
        const { token } = req.body;
        userService.logout(token);
        res.json({ message: "Logged out" });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Listar usuarios (ejemplo)
router.get("/", (req, res) => {
    res.json(userService.getAllUsers());
});

module.exports = router;

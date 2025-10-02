// Controlador que expone las rutas REST
const express = require("express");

module.exports = (userService) => {
    const router = express.Router();

    // Registrar usuario
    router.post("/register", (req, res) => {
        try {
            const { username, password } = req.body;
            const user = userService.register(username, password);
            res.status(201).json({ message: "Usuario registrado con éxito", user });
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    });

    // Login
    router.post("/login", (req, res) => {
        try {
            const { username, password } = req.body;
            const token = userService.login(username, password);
            res.json({ message: "Usuario logeado con éxito", token });
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

    // Listar usuarios
    router.get("/", (req, res) => {
        try {
            const users = userService.getAllUsers();
            res.json(users);
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    });

    return router;
};

// Contiene la lógica de usuarios
// Principio SRP: cada clase tiene una responsabilidad
const User = require("./userModel");

class UserService {
    constructor() {
        this.users = [];
        this.currentId = 1;
        this.sessions = new Map(); // manejo simple de sesiones
    }

    register(username, password) {
        const exists = this.users.find(u => u.username === username);
        if (exists) {
            throw new Error("Username already exists");
        }
        const user = new User(this.currentId++, username, password);
        this.users.push(user);
        return user;
    }

    updateUser(id, newUsername, newPassword) {
        const user = this.users.find(u => u.id === id);
        if (!user) throw new Error("User not found");
        user.username = newUsername || user.username;
        user.password = newPassword || user.password;
        return user;
    }

    deleteUser(id) {
        this.users = this.users.filter(u => u.id !== id);
    }

    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (!user) throw new Error("Invalid credentials");
        const token = `session-${Date.now()}-${user.id}`;
        this.sessions.set(token, user.id);
        return token;
    }

    logout(token) {
        this.sessions.delete(token);
    }

    getAllUsers() {
        return this.users;
    }
}

module.exports = UserService;

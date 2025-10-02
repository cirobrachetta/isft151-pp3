// Contiene la lógica de usuarios
// Principio SRP: cada clase tiene una responsabilidad
const bcrypt = require("bcrypt"); // para almacenar passwords de forma segura

class UserService {
    constructor(db) {
        this.db = db; // se recibe la conexión a la DB
        this.sessions = new Map(); // manejo simple de sesiones
    }

    // Registrar usuario
    register(username, password) {
        // Validaciones
        if (typeof username !== "string" || username.length < 3) {
            throw new Error("Username must be at least 3 characters long");
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])/;
        if (!passwordRegex.test(password)) {
            throw new Error("Password must contain at least one uppercase letter and one symbol (!@#$%^&*)");
        }

        // Verificar existencia de usuario en DB
        const exists = this.db.prepare("SELECT id FROM users WHERE username = ?").get(username);
        if (exists) {
            throw new Error("Username already exists");
        }

        // Hash de password
        const passwordHash = bcrypt.hashSync(password, 10);

        // Insertar usuario en DB
        const stmt = this.db.prepare(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)"
        );
        const info = stmt.run(username, passwordHash);

        // Devolver usuario creado
        const user = { id: info.lastInsertRowid, username };
        console.log(`Usuario registrado con éxito: ${username}`);
        return user;
    }

    // Login
    login(username, password) {
        // Buscar usuario en DB
        const user = this.db.prepare("SELECT id, username, password_hash FROM users WHERE username = ?").get(username);
        if (!user) throw new Error("Invalid credentials");

        // Verificar password
        const valid = bcrypt.compareSync(password, user.password_hash);
        if (!valid) throw new Error("Invalid credentials");

        // Generar token y almacenar en memoria
        const token = `session-${Date.now()}-${user.id}`;
        this.sessions.set(token, user.id);

        console.log(`Usuario logeado con éxito: ${username}`);
        return token;
    }

    logout(token) {
        this.sessions.delete(token);
    }

    getAllUsers() {
        return this.db.prepare("SELECT id, username FROM users").all();
    }

    updateUser(id, newUsername, newPassword) {
        const user = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id);
        if (!user) throw new Error("User not found");

        let username = newUsername || user.username;
        let passwordHash = user.password_hash;
        if (newPassword) passwordHash = bcrypt.hashSync(newPassword, 10);

        this.db.prepare("UPDATE users SET username = ?, password_hash = ? WHERE id = ?")
               .run(username, passwordHash, id);

        return { id, username };
    }

    deleteUser(id) {
        this.db.prepare("DELETE FROM users WHERE id = ?").run(id);
    }
}

module.exports = UserService;

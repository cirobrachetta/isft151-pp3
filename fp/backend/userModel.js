// Representa el modelo de Usuario
// Por ahora se gestiona en memoria, luego se conectará a SQLite

class User {
    constructor(id, username, password) {
        this.id = id; // identificador único
        this.username = username;
        this.password = password; // luego se hasheará
    }
}

module.exports = User;

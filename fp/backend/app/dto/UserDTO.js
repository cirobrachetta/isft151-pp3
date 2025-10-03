const User = require('../models/User');

function fromRow(row) {
    if (!row) return null;
    return new User({
        id: row.id,
        username: row.username,
        passwordHash: row.password_hash,
        active: row.active === 1 || row.active === true,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    });
}

function toPublic(user) {
    if (!user) return null;
    return { id: user.id, username: user.username, active: user.active, createdAt: user.createdAt };
}

function validateCreate({ username, password }) {
    if (typeof username !== 'string' || username.length < 3)
        throw new Error('Username must be at least 3 characters');
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(password))
        throw new Error('Password needs uppercase and symbol');
    return { username, password };
}

module.exports = { fromRow, toPublic, validateCreate };
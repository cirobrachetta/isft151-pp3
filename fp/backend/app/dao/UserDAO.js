// poner require con la conexión a la db
// por ejemplo const { getDB } = require('../db'); --- IGNORE ---

const { loadQuery } = require('../utils/QueryLoader');
const { getDB } = require('../../db/connection');
const User = require('../models/User');

const db = getDB();
const SelectUserByUsername = db.prepare(loadQuery('users.selectUserByUsername'));
const SelectUserById = db.prepare(loadQuery('users.selectUserById'));
const SelectUsers = db.prepare(loadQuery('users.selectUsers'));
const InsertUser = db.prepare(loadQuery('users.insertUser'));
const UpdateUserById = db.prepare(loadQuery('users.updateUserById'));
const DeleteUserById = db.prepare(loadQuery('users.deleteUserById'));
const ExistsUserByUsername = db.prepare(loadQuery('users.existsUserByUsername'));

const UserDAO = {
    selectUserByUsername(username) {
        const row = SelectUserByUsername.get({ username }) || null;
        return User.fromRow(row);
    },
    selectUserById(id) {
        const row = SelectUserById.get({ id }) || null;
        return User.fromRow(row);
    },
    selectUsers() {
        return SelectUsers.all().map(User.fromRow);
    },
    insertUser({ username, hash }) {
        const info = InsertUser.run({ username, hash });
        return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
    },
    updateUserById({ id, username, hash }) {
        const info = UpdateUserById.run({ id, username, hash });
        return { changes: info.changes };
    },
    deleteUserById(id) {
        const info = DeleteUserById.run({ id });
        return { changes: info.changes };
    },
    existsUserByUsername(username) {
        return !!ExistsUserByUsername.get({ username });
    },
};


module.exports = UserDAO;
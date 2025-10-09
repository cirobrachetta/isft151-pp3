const bcrypt = require('bcryptjs');
const UserDAO = require('../dao/UserDAO');
const { toUserDTO, toUserListDTO } = require('../dto/UserDTO');

const sessions = new Map();

const UserController = {
  register(req, res) {
    try {
      const { username, password } = req.body;
      if (typeof username !== 'string' || username.length < 3)
        throw new Error('Username must be at least 3 characters');
      if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(password))
        throw new Error('Password needs uppercase and symbol');
      if (UserDAO.existsUserByUsername(username))
        throw new Error('Username already exists');

      const hash = bcrypt.hashSync(password, 10);
      const info = UserDAO.insertUser({ username, hash });
      const user = UserDAO.selectUserById(info.lastInsertRowid);
      res.status(201).json({ message: 'ok', user: toUserDTO(user) });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  login(req, res) {
    try {
      const { username, password } = req.body;
      const user = UserDAO.selectUserByUsername(username);
      if (!user || !bcrypt.compareSync(password, user.passwordHash))
        throw new Error('Invalid credentials');

      const token = `session-${Date.now()}-${user.id}`;
      sessions.set(token, user.id);
      res.json({ message: 'ok', token });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  logout(req, res) {
    sessions.delete(req.body.token);
    res.json({ message: 'Logged out' });
  },

  update(req, res) {
    try {
      const id = Number(req.params.id);
      const current = UserDAO.selectUserById(id);
      if (!current) throw new Error('User not found');

      const username = req.body.username || current.username;
      const hash = req.body.password
        ? bcrypt.hashSync(req.body.password, 10)
        : current.passwordHash;

      UserDAO.updateUserById({ id, username, hash });
      const user = UserDAO.selectUserById(id);
      res.json(toUserDTO(user));
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  remove(req, res) {
    try {
      UserDAO.deleteUserById(Number(req.params.id));
      res.json({ message: 'User deleted' });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  list(_req, res) {
    try {
      const users = UserDAO.selectUsers();
      res.json(toUserListDTO(users));
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },
};

module.exports = UserController;
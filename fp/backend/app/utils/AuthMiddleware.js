const sessions = require('../controllers/UserController').sessions;

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !sessions.has(token))
    return res.status(401).json({ error: 'Unauthorized' });
  req.userId = sessions.get(token);
  next();
}
module.exports = { requireAuth };
const RoleDAO = require('../dao/RoleDAO');
const UserDAO = require('../dao/UserDAO');

const RoleController = {
  list(req, res) {
    try {
      const executor = UserDAO.selectRoleAndOrgByUserId(req.userId);

      if (!executor || executor.role === 'miembro')
        throw new Error('Sin permisos para ver roles');

      const roles = RoleDAO.selectAll();
      res.json(roles);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
};

module.exports = RoleController;
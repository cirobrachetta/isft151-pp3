const OrganizationDAO = require('../dao/OrganizationDAO');

const OrganizationController = {
  list(_req, res) {
    try {
      const rows = OrganizationDAO.selectAll();
      res.json(rows);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  create(req, res) {
    try {
      const { name, contact } = req.body;
      if (!name?.trim()) throw new Error('Organization name required');
      const org = OrganizationDAO.insert({ name, contact });
      res.status(201).json(org);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },
};

module.exports = OrganizationController;
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
  get(req, res) {
    try {
      const id = Number(req.params.id);
      const org = OrganizationDAO.findById(id);
      if (!org) return res.status(404).json({ error: 'Organization not found' });
      res.json(org);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  updateBudget(req, res) {
    try {
      const id = Number(req.params.id);
      const delta = Number(req.body.delta);
      if (isNaN(delta)) return res.status(400).json({ error: 'delta must be a number' });
      const org = OrganizationDAO.incrementBudget(id, delta);
      res.json(org);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },
};

module.exports = OrganizationController;
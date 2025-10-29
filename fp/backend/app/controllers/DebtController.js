const DebtDAO = require('../dao/DebtDAO');

class DebtController {
  async create(req, res) {
    try {
      // Normalize input: accept { creditor } or { entity_type, entity_id }
      let payload = { ...req.body };
      if (!payload.creditor) {
        if (payload.entity_type && payload.entity_id) {
          payload.creditor = `${payload.entity_type}:${payload.entity_id}`;
        } else if (payload.entity_id) {
          payload.creditor = payload.entity_id;
        }
      }
      payload.amount = Number(payload.amount);

      const created = await DebtDAO.insert(payload);
      if (created) return res.status(201).json(created);
      return res.status(201).json({ message: 'Debt created successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      const debts = await DebtDAO.findAll();
      res.json(debts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const debt = await DebtDAO.findById(req.params.id);
      res.json(debt);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await DebtDAO.deleteById(req.params.id);
      res.json({ message: 'Debt deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new DebtController();

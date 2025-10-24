const CashMovementDAO = require('../dao/CashMovementDAO');

class CashMovementController {
  async create(req, res) {
    try {
      await CashMovementDAO.insert(req.body);
      res.status(201).json({ message: 'Cash movement created successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      const data = await CashMovementDAO.findAll();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const data = await CashMovementDAO.findById(req.params.id);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await CashMovementDAO.deleteById(req.params.id);
      res.json({ message: 'Cash movement deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new CashMovementController();

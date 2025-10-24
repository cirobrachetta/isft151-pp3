const PaymentDAO = require('../dao/PaymentDAO');

class PaymentController {
  async create(req, res) {
    try {
      await PaymentDAO.insert(req.body);
      res.status(201).json({ message: 'Payment recorded successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async listByDebt(req, res) {
    try {
      const payments = await PaymentDAO.findByDebtId(req.params.debtId);
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const payment = await PaymentDAO.findById(req.params.id);
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await PaymentDAO.deleteById(req.params.id);
      res.json({ message: 'Payment deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new PaymentController();

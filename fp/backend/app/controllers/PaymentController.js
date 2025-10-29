const PaymentDAO = require('../dao/PaymentDAO');
const DebtDAO = require('../dao/DebtDAO');

class PaymentController {
  async create(req, res) {
    try {
      // Normalize payload
      const debtId = Number(req.body.debt_id);
      const amount = Number(req.body.amount);

      // Validate inputs
      if (!debtId || isNaN(debtId)) {
        return res.status(400).json({ error: 'Invalid or missing debt_id' });
      }
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount, must be a number > 0' });
      }

      // Verify debt exists
      const debt = DebtDAO.findById(debtId);
      if (!debt) {
        return res.status(400).json({ error: `Debt with id ${debtId} not found` });
      }

      const payload = {
        debt_id: debtId,
        amount: amount,
        method: req.body.method || null,
        notes: req.body.notes || null,
      };

      const created = await PaymentDAO.insert(payload);
      if (created) return res.status(201).json(created);
      return res.status(201).json({ message: 'Payment recorded successfully' });
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

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

      // Prevent overpayment: do not allow payment greater than remaining amount
      const remaining = Number(debt.amount_remaining || (Number(debt.amount) - Number(debt.amount_paid || 0)));
      if (amount > remaining) {
        return res.status(400).json({ error: `Payment amount exceeds remaining debt (${remaining})` });
      }

      const payload = {
        debt_id: debtId,
        amount: amount,
        method: req.body.method || null,
        notes: req.body.notes || null,
      };

      // Use an atomic DAO method that inserts the payment and updates the debt inside a transaction
      try {
        const orgId = req.body.organization_id || null;
        const result = PaymentDAO.insertAndApplyToDebt(payload, orgId, true);
        if (result) return res.status(201).json(result);
      } catch (e) {
        // Handle known error codes
        if (e && e.code === 'OVERPAYMENT') {
          return res.status(400).json({ error: e.message });
        }
        if (e && e.code === 'DEBT_NOT_FOUND') {
          return res.status(400).json({ error: e.message });
        }
        console.error('Error inserting payment atomically:', e && e.message);
        return res.status(500).json({ error: e && e.message ? e.message : 'Failed to create payment' });
      }
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

  async listAll(_req, res) {
    try {
      const payments = await PaymentDAO.findAll();
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

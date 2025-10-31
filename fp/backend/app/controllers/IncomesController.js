const IncomeDAO = require('../dao/IncomeDAO');

class IncomesController {
  create(req, res) {
    try {
      // Normalizar tipos del frontend a los valores esperados por la DB
      const typeMap = {
        income: 'ingreso',
        expense: 'egreso',
        ingreso: 'ingreso',
        egreso: 'egreso',
      };
      const payload = {
        ...req.body,
        type: typeMap[req.body.type] || req.body.type,
        amount: Number(req.body.amount),
      };

      // Prevent registering capital outflows (egresos) here — use Payments API instead
      if (payload.type === 'egreso') {
        return res.status(400).json({ error: 'Egresos must be created via the Payments API. Create a Payment to record capital outflows.' });
      }

      // insert and apply to organization budget atomically (only ingresos allowed)
      try {
  const result = IncomeDAO.insertAndApplyToBudget(payload, req.body.organization_id || null);
        if (result) return res.status(201).json(result);
      } catch (e) {
        console.error('Error creating income with budget update:', e && e.message);
        return res.status(500).json({ error: e && e.message });
      }
      return res.status(201).json({ message: 'Income created successfully' });
    } catch (err) {
      console.error("Error al crear income:", err);
      res.status(500).json({ error: err.message });
    }
  }

  list(_req, res) {
    try {
  const data = IncomeDAO.findAll();
      res.json(data);
    } catch (err) {
      console.error("Error al listar incomes:", err);
      res.status(500).json({ error: err.message });
    }
  }

  get(req, res) {
    try {
  const data = IncomeDAO.findById(req.params.id);
      res.json(data);
    } catch (err) {
      console.error("Error al obtener income:", err);
      res.status(500).json({ error: err.message });
    }
  }

  delete(req, res) {
    try {
  IncomeDAO.deleteById(req.params.id);
      res.json({ message: 'Income deleted' });
    } catch (err) {
      console.error("Error al eliminar income:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new IncomesController();

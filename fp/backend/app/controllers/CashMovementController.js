const CashMovementDAO = require('../dao/CashMovementDAO');

class CashMovementController {
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

      // insert and apply to organization budget atomically
      try {
        const result = CashMovementDAO.insertAndApplyToBudget(payload, req.body.organization_id || null);
        if (result) return res.status(201).json(result);
      } catch (e) {
        console.error('Error creating cash movement with budget update:', e && e.message);
        return res.status(500).json({ error: e && e.message });
      }
      return res.status(201).json({ message: 'Cash movement created successfully' });
    } catch (err) {
      console.error("Error al crear movimiento:", err);
      res.status(500).json({ error: err.message });
    }
  }

  list(_req, res) {
    try {
      const data = CashMovementDAO.findAll();
      res.json(data);
    } catch (err) {
      console.error("Error al listar movimientos:", err);
      res.status(500).json({ error: err.message });
    }
  }

  get(req, res) {
    try {
      const data = CashMovementDAO.findById(req.params.id);
      res.json(data);
    } catch (err) {
      console.error("Error al obtener movimiento:", err);
      res.status(500).json({ error: err.message });
    }
  }

  delete(req, res) {
    try {
      CashMovementDAO.deleteById(req.params.id);
      res.json({ message: 'Cash movement deleted' });
    } catch (err) {
      console.error("Error al eliminar movimiento:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new CashMovementController();

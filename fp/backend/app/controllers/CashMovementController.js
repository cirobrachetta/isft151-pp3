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

      const created = CashMovementDAO.insert(payload);
      // Devolver la fila creada para que el frontend tenga los campos alineados
      if (created) {
        return res.status(201).json(created);
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

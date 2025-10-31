const DebtController = require('../backend/app/controllers/DebtController');

const req = { body: { entity_type: 'supplier', entity_id: '42', amount: '300', description: 'controller test', due_date: '2025-12-31' } };
const res = {
  status(code) { this.statusCode = code; return this; },
  json(obj) { console.log('response status', this.statusCode || 200, 'body', obj); }
};

DebtController.create(req, res).catch(err => console.error('controller error', err));
console.log("📦 Nuevo registro de deuda recibido:", req.body);

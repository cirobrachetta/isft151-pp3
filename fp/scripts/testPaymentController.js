const PaymentController = require('../backend/app/controllers/PaymentController');

const req = { body: { debt_id: 1, amount: '75' } };
const res = {
  status(code) { this.statusCode = code; return this; },
  json(obj) { console.log('response status', this.statusCode || 200, 'body', obj); }
};

PaymentController.create(req, res).catch(err => console.error('controller error', err));

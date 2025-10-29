const PaymentController = require('../backend/app/controllers/PaymentController');
const DebtDAO = require('../backend/app/dao/DebtDAO');

(async () => {
  // Find a valid debt id if any
  const debts = DebtDAO.findAll();
  const validId = debts && debts.length ? debts[0].id : null;
  const invalidId = 999999;

  const res = {
    status(code) { this.statusCode = code; return this; },
    json(obj) { console.log('response status', this.statusCode || 200, 'body', obj); }
  };

  console.log('Testing invalid debt id insertion...');
  await PaymentController.create({ body: { debt_id: invalidId, amount: '10' } }, res).catch(e=>console.error(e));

  if (validId) {
    console.log('\nTesting valid debt id insertion...');
    await PaymentController.create({ body: { debt_id: validId, amount: '10' } }, res).catch(e=>console.error(e));
  } else {
    console.log('No valid debt found to test valid insertion.');
  }
})();

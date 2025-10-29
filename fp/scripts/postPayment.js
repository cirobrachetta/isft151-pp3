const http = require('http');
const data = JSON.stringify({ debt_id: 1, amount: 50 });

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/tesoreria/payments',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  console.log('status', res.statusCode);
  let d = '';
  res.on('data', (c) => d += c);
  res.on('end', () => {
    console.log('body', d);
    process.exit(0);
  });
});

req.on('error', (e) => { console.error('err', e.message); process.exit(2); });
req.write(data);
req.end();

const http = require('http');
const data = JSON.stringify({ type: 'ingreso', amount: 123.45, description: 'test from script' });

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/tesoreria/incomes',
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
  });
});

req.on('error', (e) => console.error('err', e.message));
req.write(data);
req.end();

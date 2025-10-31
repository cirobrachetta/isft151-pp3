const http = require('http');
const url = 'http://localhost:4000/api/tesoreria/incomes';

http.get(url, (res) => {
  console.log('status', res.statusCode);
  let d = '';
  res.on('data', (c) => d += c);
  res.on('end', () => {
    console.log('body', d);
    process.exit(0);
  });
}).on('error', (e) => {
  console.error('err', e.message);
  process.exit(2);
});

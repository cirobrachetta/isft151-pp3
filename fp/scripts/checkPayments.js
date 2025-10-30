const http = require('http');
const url = 'http://localhost:4000/api/tesoreria/payments';

http.get(url, (res) => {
  console.log('status', res.statusCode);
  let d = '';
  res.on('data', (c) => d += c);
  res.on('end', () => {
    try { console.log('body', JSON.parse(d)); }
    catch(e) { console.log('body', d); }
    process.exit(0);
  });
}).on('error', (e) => {
  console.error('err', e.message);
  process.exit(2);
});

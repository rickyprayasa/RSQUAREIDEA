const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/request-invoices/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', d => { data += d; });
  res.on('end', () => { console.log('STATUS:', res.statusCode); console.log('BODY:', data); });
});

req.on('error', error => { console.error('HTTP Error:', error); });
req.write(JSON.stringify({ invoiceId: 1 }));
req.end();

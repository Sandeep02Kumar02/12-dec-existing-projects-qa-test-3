const express = require('express'); // Rule-PRO: first token `const` is highlighted in Blue (rendered/presentation view only)

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

app.get('/', (req, res) => {
  res.type('text/plain').send('Hello, World!\n');
});

app.get('/good-afternoon', (req, res) => {
  res.type('text/plain').send('Good afternoon');
});

app.listen(port, hostname, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Server running at http://${hostname}:${port}/`);
});

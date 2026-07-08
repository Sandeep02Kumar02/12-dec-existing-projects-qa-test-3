/**
 * @fileoverview The `hello_world` minimal HTTP server that returns a constant
 * "Hello, World!" response for every request. Built exclusively on the Node.js
 * core `http` module with zero third-party dependencies.
 */
const http = require('http');

/**
 * Loopback host interface the server binds to.
 * @constant {string}
 */
const hostname = '127.0.0.1';
/**
 * TCP port the server listens on.
 * @constant {number}
 */
const port = 3000;

/**
 * HTTP request handler. Responds to every request, regardless of method or
 * path, with an HTTP 200 status, a `text/plain` Content-Type header, and the
 * body "Hello, World!\n". The request object is not inspected.
 *
 * @param {http.IncomingMessage} req - The incoming HTTP request (not used).
 * @param {http.ServerResponse} res - The server response used to send the reply.
 * @returns {void}
 */
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

/**
 * Server startup callback. Invoked once the server is listening; logs the
 * address the server is bound to.
 *
 * @returns {void}
 */
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

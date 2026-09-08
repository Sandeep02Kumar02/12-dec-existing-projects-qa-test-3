# hello_world — Hello World HTTP Server

A minimal Node.js HTTP server that returns a constant `Hello, World!` response for every request the Node.js HTTP parser accepts (Source: server.js:1-42).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [License](#license)
- [Decision Log](#decision-log)

## Overview

`hello_world` is a minimal HTTP server built exclusively on the Node.js core `http` module (Source: server.js:6). It listens on the loopback interface and responds to **every** incoming request the Node.js HTTP parser accepts — regardless of HTTP method or path — with an HTTP `200` status, a `text/plain` content type, and the body `Hello, World!\n` (Source: server.js:28-32); requests the parser rejects never reach the handler (see [Platform-Level Exceptions](#platform-level-exceptions)). Per the HTTP specification, a `HEAD` request receives the same status and header but no body (see [API Documentation](#api-documentation) for details). The project has **zero third-party dependencies** (Source: package-lock.json). It serves as a minimal reference implementation of a Node.js HTTP server.

## Features

- **Single-file server** — the entire application lives in `server.js` (Source: server.js:1-42).
- **Zero dependencies** — uses only the Node.js core `http` module; no external packages are installed (Source: server.js:6; package-lock.json).
- **Constant plain-text response** — returns `200 OK` with the body `Hello, World!\n` for any method and any path the Node.js HTTP parser accepts (a `HEAD` request receives the same status and headers with no body, per the HTTP specification; parser-rejected requests are listed under [Platform-Level Exceptions](#platform-level-exceptions)); the request is never inspected (Source: server.js:28-32).
- **Loopback binding** — listens on `127.0.0.1:3000` (Source: server.js:12, server.js:17).

## Tech Stack

| Component | Details |
|-----------|---------|
| Runtime | Node.js |
| Server library | Node.js core `http` module only (Source: server.js:6) |
| External dependencies | None — zero packages (Source: package-lock.json) |

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| Node.js | A currently supported Node.js LTS release — for example, Node.js 22 LTS or 24 LTS (current as of July 2026 per the [official Node.js release schedule](https://nodejs.org/en/about/previous-releases)); verified on Node.js 22.x. The project does not pin an engine version in `package.json` (Source: package.json:1-11). |
| npm | Bundled with the Node.js runtime (see the [Node.js download page](https://nodejs.org/en/download)); used only for the (dependency-free) install step (Source: package-lock.json:1-13). |

> The project declares no `engines` field in `package.json` (Source: package.json:1-11), so any currently supported Node.js LTS runtime is sufficient. Consult the [official Node.js release schedule](https://nodejs.org/en/about/previous-releases) for the current list of supported LTS versions.

## Installation

```bash
git clone <repository-url>
cd hello_world
npm install
```

`npm install` completes without installing anything because the project has **zero dependencies** (Source: package-lock.json).

## Running the Server

```bash
node server.js
```

On startup the server logs the address it is bound to (Source: server.js:40-42):

```text
Server running at http://127.0.0.1:3000/
```

> **Entry point note:** Start the server with `node server.js`.
>
> - Do **not** use `npm start` — no `start` script is defined in `package.json` (Source: package.json:6-8).
> - Do **not** use `node index.js` — the `main` field names `index.js`, but that file does not exist in the repository. The actual entry point is `server.js` (Source: package.json:5).

## API Documentation

The server exposes a single behavior: the request handler runs identically for **every** request the Node.js HTTP parser accepts. It does not inspect the request, so the HTTP method, path, query string, and body are all ignored (Source: server.js:28-32). Every response carries an HTTP `200` status and a `Content-Type: text/plain` header; every method except `HEAD` also returns the `Hello, World!\n` body (see the `HEAD` note below). Requests the parser rejects are answered by the Node.js runtime before the handler runs (see [Platform-Level Exceptions](#platform-level-exceptions)).

### Endpoint Reference

| Method | Path | Status | Content-Type | Response Body |
|--------|------|--------|--------------|----------------|
| `ANY` | `/*` (any path) | `200 OK` | `text/plain` | `Hello, World!\n` (empty for `HEAD` — see note) |

_Source: server.js:28-32_

> **`HEAD` requests:** A `HEAD` response returns the same `200` status and `Content-Type: text/plain` header as the other methods, but with **no message body** and **no `Content-Length`** header. The request handler is identical for every method (Source: server.js:28-32); per the HTTP specification, the Node.js `http` runtime omits the body — and the `Content-Length` derived from it — from `HEAD` responses. All other methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, …) return the full `Hello, World!\n` body with `Content-Length: 14`. Verify with `curl -I http://127.0.0.1:3000/`.

> **Parser-level exceptions:** The `ANY` / `/*` row above covers every request the Node.js HTTP parser accepts. A request whose method token the parser does not recognize, or whose request line and headers exceed Node's default header-size limit, is answered by the Node.js runtime with a `400` or `431` before the request handler is reached (Source: server.js:28-32). Both cases, their exact responses, and the sizes that still return `200` are listed under [Platform-Level Exceptions](#platform-level-exceptions).

### Example Request

```bash
curl -i http://127.0.0.1:3000/
```

Expected response — HTTP `200`, `Content-Type: text/plain`, `Content-Length: 14`, and the body `Hello, World!`:

```text
HTTP/1.1 200 OK
Content-Type: text/plain
Date: <current date>
Connection: keep-alive
Keep-Alive: timeout=5
Content-Length: 14

Hello, World!
```

The response body `Hello, World!\n` is 14 bytes, which is reflected by `Content-Length: 14` (Source: server.js:31).

### Request Lifecycle

```mermaid
sequenceDiagram
    participant C as HTTP Client (curl / browser)
    participant S as server.js (127.0.0.1:3000)
    C->>S: Any request (any method, any path)
    S->>S: statusCode = 200#59; Content-Type text/plain
    S-->>C: 200 OK — "Hello, World!"
```

_The diagram depicts a request accepted by the Node.js HTTP parser and passed to the handler (Source: server.js:28-32); for the requests the parser rejects instead, see [Platform-Level Exceptions](#platform-level-exceptions)._

### Platform-Level Exceptions

The Node.js HTTP parser validates the request line and headers before the request handler is invoked (Source: server.js:28-32). Two classes of request are answered by the Node.js runtime itself, and in both cases the request handler never runs:

| Request | Response | Handler invoked |
|---------|----------|-----------------|
| A method token the parser does not recognize — it accepts only the tokens in [`http.METHODS`](https://nodejs.org/api/http.html#httpmethods) (35 on Node.js 22.x, among them `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, `OPTIONS`), and method tokens are case-sensitive, so `get` is not `GET`. Example: `curl -X FROBNICATE http://127.0.0.1:3000/` or `curl -X get http://127.0.0.1:3000/` | `HTTP/1.1 400 Bad Request` with a single `Connection: close` header — no message body and no `Content-Type` header | No |
| A request line plus headers larger than Node's default [`http.maxHeaderSize`](https://nodejs.org/api/http.html#httpmaxheadersize) of `16384` bytes (16 KiB). Example: a URL path of 16,500 characters, or one request header with a 20,000-byte value | `HTTP/1.1 431 Request Header Fields Too Large` with a single `Connection: close` header — empty message body | No |

The `16384`-byte ceiling is a Node.js runtime default, changed only through the runtime's own `--max-http-header-size` flag. It is not an application setting: `server.js` exposes no configuration surface — `hostname` and `port` are hard-coded constants (Source: server.js:12, server.js:17).

The limit applies to the request line and headers only, not to the request body or to the number of headers. Each of the following returns the documented `200` / `text/plain` / `Content-Length: 14` / `Hello, World!\n` response:

- a URL path of 8,000 characters,
- 200 distinct small request headers,
- a 10 MB request body.

Either rejection closes only that connection: the next request receives the documented `200` response (Source: server.js:28-32).

## How It Works

A construct-by-construct walkthrough of `server.js`:

1. **Import the HTTP module** — `const http = require('http');` loads the Node.js core `http` module, the only module the server needs (Source: server.js:6).
2. **Define the host constant** — `const hostname = '127.0.0.1';` sets the loopback interface the server binds to (Source: server.js:12).
3. **Define the port constant** — `const port = 3000;` sets the TCP port the server listens on (Source: server.js:17).
4. **Create the server with a request handler** — `http.createServer((req, res) => { ... })` registers a callback that runs for every request the Node.js HTTP parser accepts (Source: server.js:28-32); requests the parser rejects are answered before the callback runs (see [Platform-Level Exceptions](#platform-level-exceptions)). Inside the handler:
   - `res.statusCode = 200;` sets the HTTP status to `200 OK` (Source: server.js:29).
   - `res.setHeader('Content-Type', 'text/plain');` sets the response content type (Source: server.js:30).
   - `res.end('Hello, World!\n');` writes the response body and ends the response (Source: server.js:31).
5. **Start listening** — `server.listen(port, hostname, () => { ... })` binds the server to `127.0.0.1:3000` and, once listening, logs `Server running at http://127.0.0.1:3000/` from the startup callback (Source: server.js:40-42).

## Deployment

For anything beyond local development, run the server under a process manager or in a container so that it restarts on failure and survives reboots. The examples below are generic.

**Using pm2:**

```bash
npm install -g pm2
pm2 start server.js --name hello_world
pm2 save
```

**Using systemd (unit sketch):**

```ini
[Unit]
Description=hello_world HTTP server
After=network.target

[Service]
ExecStart=/usr/bin/node /path/to/server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

**Using a container (Dockerfile sketch):**

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "server.js"]
```

> **⚠️ Loopback binding caveat:** The server binds to `127.0.0.1` (Source: server.js:12), so it is reachable **only from the local host** and will not accept traffic from other machines as-is. To expose it externally, either:
>
> - place it behind a reverse proxy (for example, Nginx) that listens on a public interface and forwards to `127.0.0.1:3000`, or
> - change the bind host in `server.js` (for example, to `0.0.0.0`).
>
> The port is fixed at `3000` in source (Source: server.js:17). Both host and port are hard-coded module constants — there are no environment variables or configuration files — so changing them means editing `server.js`. Do not edit `package.json` for this.

## Project Structure

```text
.
├── server.js          # The HTTP server (documented here)
├── package.json       # npm manifest (name, version, license)
├── package-lock.json  # npm lockfile (zero dependencies)
├── README.md          # This documentation
├── DECISIONS.md       # Decision log (rationale)
├── LoginTest.java     # Unrelated test fixture — not part of this app
├── industry.csv       # Unrelated reference dataset — not part of this app
├── test.py.txt        # Unrelated fixture (empty) — not part of this app
├── test.txt.txt       # Unrelated fixture (empty) — not part of this app
├── 100Pages.pdf       # Unrelated binary fixture — not part of this app
├── demo.jpg           # Unrelated binary fixture — not part of this app
└── sample.doc         # Unrelated binary fixture — not part of this app
```

Only `server.js` carries the documented application logic. The Java, CSV, text, and binary files (`LoginTest.java`, `industry.csv`, `test.py.txt`, `test.txt.txt`, `100Pages.pdf`, `demo.jpg`, `sample.doc`) are **unrelated test fixtures and are not part of the documented application**.

## Testing

Automated tests are **not configured** for this project. The `test` script in `package.json` intentionally exits with an error (Source: package.json:7):

```bash
npm test
# > hello_world@1.0.0 test
# > echo "Error: no test specified" && exit 1
#
# Error: no test specified
```

Running `npm test` fails by design. There is no test suite to execute.

## License

This project is licensed under the **MIT License** (Source: package.json:10). The author is `hxu` (Source: package.json:9). There is no separate `LICENSE` file in the repository; the license is declared in `package.json`.

## Decision Log

See [DECISIONS.md](./DECISIONS.md) for the rationale behind key documentation decisions — what was decided, the alternatives considered, why each choice was made, and the risks it carries.

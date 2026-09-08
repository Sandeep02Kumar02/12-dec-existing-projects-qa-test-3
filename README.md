# hello_world — Hello World HTTP Server

A minimal Node.js HTTP server that returns a constant `Hello, World!` response for every request the Node.js runtime passes to it (Source: server.js:1-42).

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

`hello_world` is a minimal HTTP server built exclusively on the Node.js core `http` module (Source: server.js:6). It listens on the loopback interface and responds to **every** incoming request the Node.js runtime passes to it — regardless of HTTP method or path — with an HTTP `200` status, a `text/plain` content type, and the body `Hello, World!\n` (Source: server.js:28-32); a small number of requests are answered or closed by the Node.js runtime before the handler is reached (see [Platform-Level Exceptions](#platform-level-exceptions)). Per the HTTP specification, a `HEAD` request receives the same status and header but no body (see [API Documentation](#api-documentation) for details). The project has **zero third-party dependencies** (Source: package-lock.json). It serves as a minimal reference implementation of a Node.js HTTP server.

## Features

- **Single-file server** — the entire application lives in `server.js` (Source: server.js:1-42).
- **Zero dependencies** — uses only the Node.js core `http` module; no external packages are installed (Source: server.js:6; package-lock.json).
- **Constant plain-text response** — returns `200 OK` with the body `Hello, World!\n` for any method and any path (a `HEAD` request receives the same status and headers with no body, per the HTTP specification; the requests the Node.js runtime intercepts first are listed under [Platform-Level Exceptions](#platform-level-exceptions)); the request is never inspected (Source: server.js:28-32).
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

The server exposes a single behavior: the request handler runs identically for **every** request the Node.js runtime passes to it. It does not inspect the request, so the HTTP method, path, query string, and body are all ignored (Source: server.js:28-32). Every response carries an HTTP `200` status and a `Content-Type: text/plain` header; every method except `HEAD` also returns the `Hello, World!\n` body (see the `HEAD` note below). A small number of requests are intercepted by the Node.js runtime before the handler runs (see [Platform-Level Exceptions](#platform-level-exceptions)).

### Endpoint Reference

| Method | Path | Status | Content-Type | Response Body |
|--------|------|--------|--------------|----------------|
| `ANY` | `/*` (any path) | `200 OK` | `text/plain` | `Hello, World!\n` (empty for `HEAD` — see note) |

_Source: server.js:28-32_

> **`HEAD` requests:** A `HEAD` response returns the same `200` status and `Content-Type: text/plain` header as the other methods, but with **no message body** and **no `Content-Length`** header. The request handler is identical for every method (Source: server.js:28-32); per the HTTP specification, the Node.js `http` runtime omits the body — and the `Content-Length` derived from it — from `HEAD` responses. All other methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, …) return the full `Hello, World!\n` body with `Content-Length: 14`. Verify with `curl -I http://127.0.0.1:3000/`.

> **Runtime-level exceptions:** The `ANY` / `/*` row above covers every request the Node.js runtime passes to the handler. A malformed request line, a request whose headers exceed Node's default header-size limit, and a `CONNECT` request are each disposed of by the Node.js runtime itself without reaching the handler; `server.js` registers only the request listener above, with no [`'clientError'`](https://nodejs.org/docs/latest-v22.x/api/http.html#event-clienterror) or [`'connect'`](https://nodejs.org/docs/latest-v22.x/api/http.html#event-connect_1) handler anywhere in the file (Source: server.js:1-42). All three cases, their exact responses, and the sizes that still return `200` are listed under [Platform-Level Exceptions](#platform-level-exceptions).

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

_The diagram depicts a request the Node.js runtime passes to the handler (Source: server.js:28-32); for the requests it intercepts first, see [Platform-Level Exceptions](#platform-level-exceptions)._

### Platform-Level Exceptions

The Node.js runtime parses and routes each request before the handler runs, so a small number of requests never reach the application. `server.js` contains a single `request` listener that inspects nothing (Source: server.js:28-32) and registers no [`'clientError'`](https://nodejs.org/docs/latest-v22.x/api/http.html#event-clienterror) or [`'connect'`](https://nodejs.org/docs/latest-v22.x/api/http.html#event-connect_1) handler and no `maxHeaderSize` server option (Source: server.js:1-42), so Node's own defaults apply in the three cases below. All three were observed on Node.js 22.x.

| Request | Response | Handler invoked |
|---------|----------|-----------------|
| A malformed request line — either a method token the parser does not recognize (it accepts only the tokens in [`http.METHODS`](https://nodejs.org/docs/latest-v22.x/api/http.html#httpmethods), 35 on Node.js 22.x, and they are case-sensitive, so `get` is not `GET`), or an unsupported HTTP version. Examples: `curl -X FROBNICATE http://127.0.0.1:3000/`, `curl -X get http://127.0.0.1:3000/`, or a raw `GET / HTTP/9.9` request line | `HTTP/1.1 400 Bad Request` with a single `Connection: close` header — no message body and no `Content-Type` header | No |
| A request line plus headers larger than [`http.maxHeaderSize`](https://nodejs.org/docs/latest-v22.x/api/http.html#httpmaxheadersize), which defaults to `16384` bytes (16 KiB). Examples: a URL path of 16,500 characters, or one request header with a 20,000-byte value | `HTTP/1.1 431 Request Header Fields Too Large` with a single `Connection: close` header — empty message body | No |
| A `CONNECT` request. The token is one of the 35 in `http.METHODS`, but Node.js routes it to the server's [`'connect'`](https://nodejs.org/docs/latest-v22.x/api/http.html#event-connect_1) event rather than to `'request'`. Example: a raw `CONNECT 127.0.0.1:3000 HTTP/1.1` request line | The connection is closed with **no response at all** — zero bytes are returned | No |

An upgrade request is **not** intercepted: a request carrying `Connection: Upgrade` and, for example, `Upgrade: websocket` reaches the handler and receives the same `200` response as any other request; `server.js` registers no [`'upgrade'`](https://nodejs.org/docs/latest-v22.x/api/http.html#event-upgrade_1) listener either (Source: server.js:1-42).

The `400` and `431` rejections close the connection, and the next request on a fresh connection is served normally with `200`. Requests that stay under the ceiling are unaffected — a 16,000-character path, or a 16,000-byte header value, still returns `200`. The `16384`-byte ceiling is a Node.js default, adjustable through the runtime's `--max-http-header-size` flag or per server through the [`maxHeaderSize` option of `http.createServer`](https://nodejs.org/docs/latest-v22.x/api/http.html#httpcreateserveroptions-requestlistener); `server.js` passes no options to `http.createServer` (Source: server.js:28). The `400` and `431` response shapes, and the closing of a `CONNECT` connection, are likewise Node defaults, changed by registering `'clientError'` and `'connect'` handlers, which this server does not do (Source: server.js:1-42). Beyond these runtime settings the server exposes no configuration surface: `hostname` and `port` are hard-coded constants (Source: server.js:12, server.js:17).

## How It Works

A construct-by-construct walkthrough of `server.js`:

1. **Import the HTTP module** — `const http = require('http');` loads the Node.js core `http` module, the only module the server needs (Source: server.js:6).
2. **Define the host constant** — `const hostname = '127.0.0.1';` sets the loopback interface the server binds to (Source: server.js:12).
3. **Define the port constant** — `const port = 3000;` sets the TCP port the server listens on (Source: server.js:17).
4. **Create the server with a request handler** — `http.createServer((req, res) => { ... })` registers a callback that runs for every request (Source: server.js:28-32). Inside the handler:
   - `res.statusCode = 200;` sets the HTTP status to `200 OK` (Source: server.js:29).
   - `res.setHeader('Content-Type', 'text/plain');` sets the response content type (Source: server.js:30).
   - `res.end('Hello, World!\n');` writes the response body and ends the response (Source: server.js:31).
5. **Start listening** — `server.listen(port, hostname, () => { ... })` binds the server to `127.0.0.1:3000` and, once listening, logs `Server running at http://127.0.0.1:3000/` from the startup callback (Source: server.js:40-42).

## Deployment

For anything beyond local development, run the server under a process manager or in a container so that it restarts after a crash and, once the platform's boot hook is installed, comes back after a reboot. The examples below are generic.

**Using pm2:**

```bash
npm install -g pm2
pm2 start server.js --name hello_world
pm2 startup
pm2 save
```

`pm2 start` gives crash restarts immediately; reboot survival needs the last two commands together. `pm2 startup` detects the init system and generates the boot hook — run as an unprivileged user it prints a `sudo env PATH=... pm2 startup ...` command that must then be executed with root privileges to finish installing it — and `pm2 save` writes the current process list to `~/.pm2/dump.pm2` for that hook to resurrect at boot. `pm2 save` on its own only records the process list — with no startup hook installed, nothing brings pm2 or the server back after a reboot.

**Using systemd (unit sketch):**

```ini
[Unit]
Description=hello_world HTTP server
After=network.target

[Service]
WorkingDirectory=/path/to
ExecStart=/usr/bin/node /path/to/server.js
User=hello_world
Group=hello_world
NoNewPrivileges=true
Restart=always

[Install]
WantedBy=multi-user.target
```

Replace `/path/to` with the directory holding `server.js`, and create the unprivileged account the unit runs as before enabling it (for example, `useradd --system --no-create-home --shell /usr/sbin/nologin hello_world`). A unit with no `User=`/`Group=` runs the service as `root`; the server needs no elevated privileges because port `3000` is outside the privileged range below 1024 (Source: server.js:17), so a dedicated unprivileged account is enough, and `NoNewPrivileges=true` stops the process gaining any. Install the file as `/etc/systemd/system/hello_world.service`, then run `systemctl daemon-reload` and `systemctl enable --now hello_world`: `Restart=always` covers crashes, and `enable` is what starts the unit at boot.

**Using a container (Dockerfile sketch):**

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY server.js package.json package-lock.json ./
RUN npm install
EXPOSE 3000
CMD ["node", "server.js"]
```

The `COPY` names only the application files. The repository root also holds the unrelated fixtures listed under [Project Structure](#project-structure) — `LoginTest.java`, `industry.csv`, `test.py.txt`, `test.txt.txt`, `100Pages.pdf`, `demo.jpg` and `sample.doc` — plus the `.git` history, and the repository contains no `.dockerignore` or `.gitignore` to filter them, so `COPY . .` would copy about 11.7 MB of unrelated content and the full Git history into the image. Broadening the copy therefore requires adding a `.dockerignore` that excludes those fixtures and `.git`. Read the loopback caveat below before publishing the port — `EXPOSE 3000` and `docker run -p 3000:3000` are not sufficient on their own.

> **⚠️ Loopback binding caveat:** The server binds to `127.0.0.1` (Source: server.js:12), so it is reachable **only from the local host** — the machine, or in a container the container itself, that the process runs on — and will not accept traffic from other machines as-is. To expose it externally, either:
>
> - place it behind a reverse proxy (for example, Nginx) that listens on a public interface and forwards to `127.0.0.1:3000`, or
> - change the bind host in `server.js` (for example, to `0.0.0.0`).
>
> **In a container the same bind also blocks published ports:** traffic from `docker run -p 3000:3000` is forwarded to the container's own network interface, not to its loopback interface, and a `127.0.0.1` listener does not accept it — the connection is refused or reset even though `EXPOSE 3000` is declared. Publishing a port therefore needs the bind-host change above (for example, to `0.0.0.0`) applied inside the image.
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
├── blitzy/            # Generated project documentation — not part of this app
├── LoginTest.java     # Unrelated test fixture — not part of this app
├── industry.csv       # Unrelated reference dataset — not part of this app
├── test.py.txt        # Unrelated fixture (empty) — not part of this app
├── test.txt.txt       # Unrelated fixture (empty) — not part of this app
├── 100Pages.pdf       # Unrelated binary fixture — not part of this app
├── demo.jpg           # Unrelated binary fixture — not part of this app
└── sample.doc         # Unrelated binary fixture — not part of this app
```

Only `server.js` carries the documented application logic. The Java, CSV, text, and binary files (`LoginTest.java`, `industry.csv`, `test.py.txt`, `test.txt.txt`, `100Pages.pdf`, `demo.jpg`, `sample.doc`) are **unrelated test fixtures and are not part of the documented application**, and the `blitzy/` directory holds generated project documentation rather than application code. None of them is referenced by `server.js` (Source: server.js:1-42).

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

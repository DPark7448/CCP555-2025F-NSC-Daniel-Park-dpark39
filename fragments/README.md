# Fragments API

This repository contains the initial setup for the Fragments back-end services.

---

## Installation

```bash
npm install
# or
npm ci
```

---

## Scripts

### Lint

```bash
npm run lint
```

### Start

```bash
npm start
```

### Dev (watch mode)

```bash
npm run dev
```

### Debug (VS Code attach)

```bash
npm run debug
```

---

## Health Check

### Browser

```
http://localhost:8080
```

### curl + jq

```powershell
curl.exe -s http://localhost:8080 | jq
```

### curl with headers

```powershell
curl.exe -i http://localhost:8080
```

---

## Debugging in VS Code

1. Open `.vscode/launch.json`
2. Select **Debug via npm run debug**
3. Set breakpoint in `src/app.js` at:

```js
res.status(200).json({
```

4. Start debugger (F5)
5. Run:

```powershell
curl.exe http://localhost:8080
```

---

## Debug-only Env Dump

```js
if (process.env.LOG_LEVEL === 'debug') {
  logger.debug({ env: process.env }, 'process.env (debug mode)');
}
```

Run with:

```bash
npm run dev
```

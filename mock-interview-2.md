# Node.js Mock Interview Questions

## 1. How would you implement a simple HTTP video streaming endpoint in Node.js?

```js
const express = require('express');
const fs = require('fs');
const path = require('path')
const app = express();

app.get('/video/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'videos', req.params.filename);

    let stat;
    try {
        stat = fs.statSync(filePath);
    } catch (err) {
        return res.status(404).send('File not found');
    }
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        });
        file.pipe(res);
    } else {
        res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': 'video/mp4' });
        fs.createReadStream(filePath).pipe(res);
    }
});

app.listen(3000, () => {
    console.log('Express server listening on port 3000');
});
```

**How to answer:**

- Explain HTTP 206 Partial Content for range requests.
- Mention limitations: memory usage, large files.
- Possible improvements: streaming from cloud storage, caching, using `express-range` or `ffmpeg` for transcoding.

---

## 2. How can you handle asynchronous operations in Node.js without blocking the event loop?

```js
// Using async/await
async function fetchData() {
    const data = await fetch('https://api.example.com/data');
    return data.json();
}
```

**Answer:**

- Explain non-blocking I/O and the event loop.
- Mention async/await, Promises, `setImmediate`, `process.nextTick`.
- Highlight avoiding CPU-intensive tasks in the main thread, suggest worker threads for heavy computation.

---

## 3. What’s the difference between `process.nextTick()` and `setImmediate()`?

```js
console.log('start');

process.nextTick(() => console.log('nextTick'));
setImmediate(() => console.log('setImmediate'));

console.log('end');
```

**Answer:**

- `process.nextTick()` runs before the next event loop iteration.
- `setImmediate()` runs on the next iteration of the event loop.
- Demonstrate understanding with the snippet above.

---

## 4. How would you implement a custom debounce function in Node.js?

```js
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Usage
const debounced = debounce(() => console.log('Called!'), 300);
debounced();
```

**Answer:**

- Explain debouncing in backend context, e.g., API request limiting.

---

## 5. Explain how to handle backpressure when streaming large files in Node.js.

```js
const fs = require('fs');
const readable = fs.createReadStream('largefile.txt');
const writable = fs.createWriteStream('output.txt');

readable.on('data', (chunk) => {
    if (!writable.write(chunk)) {
        readable.pause();
    }
});

writable.on('drain', () => {
    readable.resume();
});
```

**Answer:**

- Show understanding of streams and backpressure handling.

---

## 6. How would you implement caching for a Node.js API?

```js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100 });

function getData(key, fetchFn) {
    const cached = cache.get(key);
    if (cached) return Promise.resolve(cached);
    return fetchFn().then(data => {
        cache.set(key, data);
        return data;
    });
}
```

**Answer:**

- Discuss in-memory cache (`NodeCache`), Redis, and pros/cons for distributed systems.

---

## 7. Show a code snippet of error handling in async functions in Node.js.

```js
async function fetchData() {
    try {
        const res = await fetch('https://api.example.com/data');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error fetching data', err);
        throw new Error('Failed to fetch data');
    }
}
```

**Answer:**

- Emphasize proper error propagation, logging, and handling in APIs.

---

## 8. How do you handle database connection pooling in Node.js?

```js
const { Pool } = require('pg');
const pool = new Pool({
    user: 'user',
    host: 'localhost',
    database: 'testdb',
    password: 'pass',
    max: 10, // pool size
});

pool.query('SELECT * FROM users', (err, res) => {
    if (err) throw err;
    console.log(res.rows);
});
```

**Answer:**

- Explain connection pooling reduces connection overhead and improves performance.

---

## 9. How would you implement a rate limiter in Node.js?

```js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests
});

app.use(limiter);
```

**Answer:**

- Explain importance of protecting APIs from abuse.
- Mention Redis-based distributed rate limiting for multiple server instances.

---

## 10. Explain the difference between `require()` and `import` in Node.js.

```js
// CommonJS
const fs = require('fs');

// ES Module
import fs from 'fs';
```

**Answer:**

- `require()` is synchronous, CommonJS.
- `import` is asynchronous, ES module, supports top-level await.
- Mention Node.js ESM support and `"type": "module"` in `package.json`.

---

## 11. How do you handle graceful shutdown in Node.js servers?

```js
const server = require('http').createServer();

server.listen(3000);

process.on('SIGINT', () => {
    console.log('Closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
```

**Answer:**

- Explain cleanup of open connections, database connections, and timers.

---

## 12. How can you offload CPU-intensive tasks in Node.js?

```js
const { Worker } = require('worker_threads');

const worker = new Worker('./heavyTask.js');
worker.on('message', (msg) => console.log(msg));
worker.postMessage({ payload: 42 });
```

**Answer:**

- Explain that Node.js is single-threaded; heavy CPU tasks block event loop.
- Suggest `worker_threads` or child processes.

---

## 13. How would you handle file uploads in Node.js?

```js
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    console.log(req.file);
    res.send('File uploaded');
});
```

**Answer:**

- Explain multer usage, streaming files to disk/cloud.
- Mention limits, validation, and memory concerns.

---

## 14. Show a simple middleware in Express.js.

```js
function logger(req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next();
}

app.use(logger);
```

**Answer:**

- Explain middleware chain and importance for logging, auth, error handling.

---

## 15. How would you implement JWT authentication in Node.js?

```js
const jwt = require('jsonwebtoken');
const secret = 'supersecret';

function generateToken(payload) {
    return jwt.sign(payload, secret, { expiresIn: '1h' });
}

function verifyToken(token) {
    return jwt.verify(token, secret);
}
```

**Answer:**

- Mention secure secret handling, token expiration, refresh tokens.

---

## 16. How do you implement streaming JSON response in Node.js?

```js
const { Readable } = require('stream');

const readable = Readable.from([{ id: 1 }, { id: 2 }, { id: 3 }].map(JSON.stringify));

readable.pipe(res);
```

**Answer:**

- Discuss performance benefits for large datasets.

---

## 17. How do you debug memory leaks in Node.js?

```sh
node --inspect app.js
```
Then connect Chrome DevTools for heap snapshot.

**Answer:**

- Explain common leaks: global variables, unclosed listeners, caching.

---

## 18. How can you implement transactional operations in Node.js with Postgres?

```js
const { Pool } = require('pg');
const pool = new Pool();

async function transfer(from, to, amount) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, from]);
        await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, to]);
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
```

**Answer:**

- Explain transactions, rollback on errors, and atomicity.

---

## 19. How do you implement a health check endpoint?

```js
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).send('OK');
    } catch {
        res.status(500).send('DB Connection Failed');
    }
});
```

**Answer:**

- Explain monitoring readiness and liveness probes in production.

---

## 20. What are the differences between `process.env`, config files, and a library like dotenv?

```js
require('dotenv').config();
console.log(process.env.DB_HOST);
```

**Answer:**

- Explain environment variables for secrets, config files for defaults, dotenv for dev.
- Discuss 12-factor app best practices.

---

### ✅ These 20 questions and code snippets cover:

- Video streaming
- Async JS & Node.js internals
- Error handling & logging
- Middleware & Express
- Worker threads & CPU-bound tasks
- Database usage & transactions
- JWT & API security
- Streams & backpressure
- Rate limiting & caching

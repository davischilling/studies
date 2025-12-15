# Node.js Core Concepts

### 1. The Node.js Event Loop (Deep Understanding)

**Explanation:**
The **event loop** is the heart of Node.js's non-blocking I/O model. It's a single-threaded loop that processes asynchronous operations.

**Event Loop Phases** (in order):
1. **Timers**: Executes callbacks scheduled by `setTimeout()` and `setInterval()`
2. **Pending callbacks**: Executes I/O callbacks deferred to the next loop iteration
3. **Idle, prepare**: Internal use only
4. **Poll**: Retrieves new I/O events; executes I/O callbacks (except close, timers, setImmediate)
5. **Check**: Executes `setImmediate()` callbacks
6. **Close callbacks**: Executes close event callbacks (e.g., `socket.on('close')`)

**Between each phase**: Process `process.nextTick()` queue and microtasks (Promises)

**Key Points**:
- `process.nextTick()` has highest priority (executes before any phase)
- Microtasks (Promises) execute after `nextTick` queue, before next phase
- `setImmediate()` executes in Check phase (after Poll)
- `setTimeout(fn, 0)` executes in Timers phase (next iteration)

**Exercise:**
```javascript
// 1. Predict the output order and explain why
console.log('1: Start');

setTimeout(() => console.log('2: setTimeout 0'), 0);
setImmediate(() => console.log('3: setImmediate'));

Promise.resolve().then(() => console.log('4: Promise'));

process.nextTick(() => console.log('5: nextTick'));

console.log('6: End');

// 2. Implement a function that demonstrates all phases
function demonstrateEventLoop() {
  // Create examples for each phase
  // Add console.logs to show execution order
  // Include: timers, I/O, setImmediate, nextTick, promises
}

// 3. Explain this behavior
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});

// Why is setImmediate always first here?

// 4. Create a visualization tool
function visualizeEventLoop(callback) {
  // Log which phase is currently executing
  // Track queue sizes
  // Show execution timeline
}

// 5. Identify the problem and fix it
function blockingOperation() {
  const start = Date.now();
  while (Date.now() - start < 5000) {} // Blocks for 5 seconds
}

setTimeout(() => console.log('This should run after 1 second'), 1000);
blockingOperation();
// Why doesn't the timeout fire after 1 second?
```

---

### 2. libuv & Thread Pool

**Explanation:**
**libuv** is the C library that provides Node.js with:
- Event loop implementation
- Asynchronous I/O operations
- Thread pool for operations that can't be done asynchronously at OS level

**Thread Pool**:
- Default size: 4 threads (configurable via `UV_THREADPOOL_SIZE`, max 1024)
- Used for: File system operations, DNS lookups, some crypto operations, zlib compression
- NOT used for: Network I/O (uses OS-level async APIs)

**Operations using thread pool**:
- `fs.*` (except `fs.watch()`)
- `dns.lookup()` (but NOT `dns.resolve()`)
- `crypto.pbkdf2()`, `crypto.randomBytes()`, `crypto.randomFill()`
- `zlib` compression

**Why it matters**: Thread pool exhaustion can cause performance bottlenecks

**Exercise:**
```javascript
// 1. Demonstrate thread pool size impact
const crypto = require('crypto');

// Set UV_THREADPOOL_SIZE=2 and run this
console.time('4 operations');
for (let i = 0; i < 4; i++) {
  crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', () => {
    console.log(`Operation ${i + 1} complete`);
  });
}
// Observe: First 2 complete together, then next 2
// Why? Only 2 threads available

// 2. Compare thread pool vs non-thread pool operations
const dns = require('dns');
const https = require('https');

console.time('dns.lookup'); // Uses thread pool
dns.lookup('google.com', () => console.timeEnd('dns.lookup'));

console.time('dns.resolve'); // Does NOT use thread pool
dns.resolve('google.com', () => console.timeEnd('dns.resolve'));

// Which is faster and why?

// 3. Identify thread pool starvation
const fs = require('fs');

// This can starve the thread pool
for (let i = 0; i < 100; i++) {
  fs.readFile('large-file.txt', () => {});
}

// How would you fix this?

// 4. Implement a thread pool monitor
class ThreadPoolMonitor {
  constructor() {
    // Track active operations
    // Warn when pool is saturated
  }

  wrapOperation(fn) {
    // Wrap thread pool operations
    // Log queue depth
    // Measure wait time
  }
}

// 5. Optimize this code
async function processFiles(files) {
  // Currently: All files read simultaneously (exhausts thread pool)
  const results = await Promise.all(
    files.map(file => fs.promises.readFile(file))
  );

  // Refactor to: Limit concurrent operations
  // Use a queue or semaphore pattern
}
```

---

### 3. How Node Handles Async I/O

**Explanation:**
Node.js uses **non-blocking I/O** to handle thousands of concurrent operations efficiently.

**Two approaches**:
1. **OS-level async APIs** (preferred): Network I/O, TCP/UDP sockets
   - Uses epoll (Linux), kqueue (macOS), IOCP (Windows)
   - True async, no threads needed

2. **Thread pool** (fallback): File system, DNS lookup, crypto
   - When OS doesn't provide async API
   - libuv manages thread pool

**Flow**:
1. Application makes async call (e.g., `fs.readFile()`)
2. Node delegates to libuv
3. libuv either:
   - Uses OS async API (network), or
   - Assigns to thread pool (file system)
4. When complete, callback queued in event loop
5. Event loop executes callback in appropriate phase

**Key insight**: Node is single-threaded for JavaScript execution, but I/O happens in parallel

**Exercise:**
```javascript
// 1. Compare sync vs async I/O
const fs = require('fs');

// Synchronous (blocks event loop)
console.time('sync');
const data1 = fs.readFileSync('file1.txt');
const data2 = fs.readFileSync('file2.txt');
console.timeEnd('sync');

// Asynchronous (non-blocking)
console.time('async');
let count = 0;
fs.readFile('file1.txt', () => {
  if (++count === 2) console.timeEnd('async');
});
fs.readFile('file2.txt', () => {
  if (++count === 2) console.timeEnd('async');
});

// Which is faster and why?

// 2. Demonstrate non-blocking nature
const http = require('http');

const server = http.createServer((req, res) => {
  // Simulate slow I/O
  fs.readFile('large-file.txt', (err, data) => {
    res.end('Done');
  });
});

// Start server and make multiple requests
// All requests are handled concurrently
// How many can Node handle simultaneously?

// 3. Identify the bottleneck
async function processRequest(req) {
  const data = await fs.promises.readFile('config.json'); // I/O
  const parsed = JSON.parse(data); // CPU
  const result = heavyComputation(parsed); // CPU - blocks!
  return result;
}

// How would you optimize this?

// 4. Implement an async operation tracker
class AsyncTracker {
  track(operation, type) {
    // Track: network I/O, file I/O, CPU-bound
    // Measure duration
    // Identify blocking operations
  }

  report() {
    // Show breakdown of operation types
    // Identify performance bottlenecks
  }
}
```

---

### 4. Node.js Architecture & How It Differs from Browsers

**Explanation:**
**Node.js Architecture**:
- **V8 Engine**: JavaScript execution (same as Chrome)
- **libuv**: Event loop, async I/O, thread pool
- **C++ bindings**: Bridge between JS and native code
- **Core modules**: Built-in APIs (fs, http, crypto, etc.)

**Key Differences from Browsers**:

| Feature | Node.js | Browser |
|---------|---------|---------|
| **Global object** | `global` (or `globalThis`) | `window` |
| **APIs** | File system, OS, networking | DOM, Web APIs |
| **Module system** | CommonJS, ESM | ESM, script tags |
| **Event loop** | libuv (more phases) | Browser-specific |
| **Security** | Full system access | Sandboxed |
| **Entry point** | CLI, scripts | HTML pages |
| **Timers** | More precise | Throttled in background |

**Node.js has**:
- `process`, `Buffer`, `__dirname`, `__filename`, `require()`
- File system access, child processes, networking APIs
- No DOM, no `window`, no browser APIs

**Exercise:**
```javascript
// 1. Identify what works where
// Mark each as: Node only, Browser only, or Both

console.log('Hello'); // ?
document.querySelector('div'); // ?
fs.readFile('file.txt'); // ?
fetch('https://api.com'); // ?
localStorage.setItem('key', 'value'); // ?
process.env.NODE_ENV; // ?
setTimeout(() => {}, 1000); // ?
window.location.href; // ?
Buffer.from('data'); // ?
__dirname; // ?

// 2. Create a universal module (isomorphic)
// Works in both Node.js and browser
const universalFetch = (() => {
  // Detect environment
  // Use appropriate fetch implementation
  // Handle differences gracefully
})();

// 3. Polyfill browser APIs in Node
class LocalStorage {
  // Implement localStorage API for Node.js
  // Use file system for persistence
  setItem(key, value) {}
  getItem(key) {}
  removeItem(key) {}
  clear() {}
}

// 4. Explain the security implications
// Why can Node.js do this but browsers can't?
const fs = require('fs');
fs.unlinkSync('/important-file.txt'); // Deletes file!

// What prevents this in browsers?

// 5. Create an environment detector
function detectEnvironment() {
  // Return: 'node', 'browser', 'worker', 'unknown'
  // Check for: process, window, self, global
  // Handle edge cases
}
```

---

### 5. Streams (Readable/Writable, Duplex/Transform, Backpressure)

**Explanation:**
**Streams** are collections of data that might not be available all at once. They allow processing data piece by piece without loading everything into memory.

**Types**:
1. **Readable**: Source of data (e.g., `fs.createReadStream()`, HTTP request)
2. **Writable**: Destination for data (e.g., `fs.createWriteStream()`, HTTP response)
3. **Duplex**: Both readable and writable (e.g., TCP socket)
4. **Transform**: Duplex stream that modifies data (e.g., zlib compression)

**Key Concepts**:
- **Flowing mode**: Data flows automatically via `data` events
- **Paused mode**: Data must be explicitly read via `read()`
- **Backpressure**: When consumer can't keep up with producer
- **Piping**: `readable.pipe(writable)` handles backpressure automatically

**Why streams matter for video**:
- Stream large files without loading into memory
- Start playback before entire file downloads
- Handle range requests for seeking

**Exercise:**
```javascript
const fs = require('fs');
const { Readable, Writable, Transform, pipeline } = require('stream');

// 1. Create a custom Readable stream
class NumberStream extends Readable {
  constructor(max) {
    super();
    this.current = 0;
    this.max = max;
  }

  _read() {
    // Implement: Push numbers 0 to max
    // Push null when done
  }
}

// Test: Stream numbers 1-100
const numbers = new NumberStream(100);
numbers.on('data', chunk => console.log(chunk.toString()));

// 2. Create a custom Transform stream
class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    // Convert chunk to uppercase
    // Push transformed data
  }
}

// Test: Transform file to uppercase
fs.createReadStream('input.txt')
  .pipe(new UpperCaseTransform())
  .pipe(fs.createWriteStream('output.txt'));

// 3. Demonstrate backpressure
const slowWritable = new Writable({
  write(chunk, encoding, callback) {
    // Simulate slow consumer
    setTimeout(callback, 100);
  }
});

const fastReadable = new Readable({
  read() {
    // Fast producer
    this.push('data'.repeat(1000));
  }
});

// Without pipe (manual): Handle backpressure
fastReadable.on('data', chunk => {
  const canContinue = slowWritable.write(chunk);
  if (!canContinue) {
    fastReadable.pause();
    slowWritable.once('drain', () => fastReadable.resume());
  }
});

// With pipe (automatic): Handles backpressure
fastReadable.pipe(slowWritable);

// 4. Implement a video streaming transform
class VideoChunkTransform extends Transform {
  constructor(chunkSize) {
    super();
    // Split video into chunks of specified size
    // Useful for adaptive streaming
  }

  _transform(chunk, encoding, callback) {
    // Your code here
  }
}

// 5. Handle stream errors properly
function safeStreamPipeline(source, ...transforms, destination) {
  // Use pipeline() to handle errors
  // Clean up on error
  // Return promise
}

// 6. Implement a progress tracker
class ProgressStream extends Transform {
  constructor(totalSize) {
    super();
    this.transferred = 0;
    this.totalSize = totalSize;
  }

  _transform(chunk, encoding, callback) {
    this.transferred += chunk.length;
    const percent = (this.transferred / this.totalSize * 100).toFixed(2);
    console.log(`Progress: ${percent}%`);
    callback(null, chunk);
  }
}
```

---

### 6. Buffers

**Explanation:**
**Buffer** is a fixed-size chunk of memory allocated outside the V8 heap for handling binary data.

**Key Points**:
- Used for: File I/O, network I/O, image processing, cryptography
- Fixed size (cannot be resized)
- More efficient than arrays for binary data
- Encoding: 'utf8', 'ascii', 'base64', 'hex', 'binary'

**Common operations**:
```javascript
Buffer.from('hello'); // Create from string
Buffer.alloc(10); // Allocate 10 bytes (filled with 0)
Buffer.allocUnsafe(10); // Faster but contains old data
buf.toString('utf8'); // Convert to string
buf.slice(0, 5); // Create view (shares memory!)
Buffer.concat([buf1, buf2]); // Combine buffers
```

**Important**: `slice()` creates a view, not a copy. Modifying the slice modifies the original!

**Exercise:**
```javascript
// 1. Basic buffer operations
const buf = Buffer.from('Hello World');

console.log(buf); // <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64>
console.log(buf.length); // ?
console.log(buf.toString()); // ?
console.log(buf.toString('hex')); // ?
console.log(buf[0]); // ? (ASCII code)

// 2. Demonstrate slice behavior
const original = Buffer.from('Hello');
const slice = original.slice(0, 2);
slice[0] = 0x4A; // Change 'H' to 'J'
console.log(original.toString()); // What does this print?

// How to create a true copy?

// 3. Implement a binary file parser
function parseBinaryFile(buffer) {
  // Read file header (first 4 bytes)
  // Read file size (next 4 bytes, little-endian)
  // Read file type (next 2 bytes)
  // Return parsed metadata

  const header = buffer.slice(0, 4).toString();
  const size = buffer.readUInt32LE(4);
  const type = buffer.readUInt16LE(8);

  return { header, size, type };
}

// 4. Convert between encodings
function convertEncoding(str, from, to) {
  // Convert string from one encoding to another
  // Example: UTF-8 to Base64
}

// Test:
convertEncoding('Hello', 'utf8', 'base64'); // SGVsbG8=
convertEncoding('SGVsbG8=', 'base64', 'utf8'); // Hello

// 5. Implement a buffer pool
class BufferPool {
  constructor(bufferSize, poolSize) {
    // Pre-allocate buffers
    // Reuse instead of allocating new ones
  }

  acquire() {
    // Get a buffer from pool
    // Allocate new if pool empty
  }

  release(buffer) {
    // Return buffer to pool
    // Clear buffer data
  }
}

// 6. Handle large buffers safely
function processLargeFile(filePath) {
  // Problem: Buffer.from(fs.readFileSync(file)) loads entire file
  // Solution: Use streams to process in chunks

  const stream = fs.createReadStream(filePath, {
    highWaterMark: 64 * 1024 // 64KB chunks
  });

  stream.on('data', (chunk) => {
    // Process chunk (Buffer)
  });
}

// 7. Implement a binary protocol
class BinaryProtocol {
  // Create a simple binary message format:
  // [4 bytes: message length][1 byte: message type][N bytes: payload]

  static encode(type, payload) {
    // Create buffer with header + payload
  }

  static decode(buffer) {
    // Parse buffer and return { type, payload }
  }
}
```

---

### 7. Child Processes & Worker Threads

**Explanation:**
Both allow running code in parallel, but serve different purposes:

**Child Processes** (`child_process` module):
- Spawn separate Node.js processes or system commands
- Separate memory space (isolated)
- Higher overhead (full process)
- Use for: Running external commands, CPU-intensive tasks, isolation

**Methods**:
- `spawn()`: Stream-based, for long-running processes
- `exec()`: Buffer-based, for short commands
- `execFile()`: Like exec but more efficient
- `fork()`: Spawn Node.js processes with IPC

**Worker Threads** (`worker_threads` module):
- Run JavaScript in parallel threads
- Share memory (can transfer/share ArrayBuffers)
- Lower overhead than processes
- Use for: CPU-intensive JavaScript, parallel processing

**When to use what**:
- **Child process**: External commands, isolation needed, separate Node instances
- **Worker thread**: CPU-intensive JS, shared memory needed, lower overhead

**Exercise:**
```javascript
const { spawn, exec, fork } = require('child_process');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// 1. Use spawn for streaming output
function runCommand(command, args) {
  const child = spawn(command, args);

  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child.on('close', (code) => {
    console.log(`Process exited with code ${code}`);
  });
}

// Test: runCommand('ls', ['-la']);

// 2. Use exec for simple commands
function getSystemInfo() {
  return new Promise((resolve, reject) => {
    exec('uname -a', (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}

// 3. Use fork for Node.js child processes
// Main file:
const child = fork('worker.js');
child.send({ task: 'process', data: [1, 2, 3] });
child.on('message', (result) => {
  console.log('Result:', result);
});

// worker.js:
process.on('message', (msg) => {
  const result = msg.data.reduce((a, b) => a + b, 0);
  process.send(result);
});

// 4. Implement CPU-intensive task with Worker Threads
// main.js:
function calculatePrimes(max) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./prime-worker.js', {
      workerData: { max }
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
    });
  });
}

// prime-worker.js:
if (!isMainThread) {
  const { max } = workerData;
  const primes = [];

  for (let i = 2; i <= max; i++) {
    let isPrime = true;
    for (let j = 2; j < i; j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(i);
  }

  parentPort.postMessage(primes);
}

// 5. Create a worker pool
class WorkerPool {
  constructor(workerScript, poolSize) {
    // Create pool of workers
    // Queue tasks when all workers busy
  }

  async execute(data) {
    // Get available worker
    // Send task
    // Return result
  }

  terminate() {
    // Terminate all workers
  }
}

// 6. Compare performance
async function comparePerformance() {
  // Run same CPU-intensive task:
  // 1. In main thread
  // 2. In child process
  // 3. In worker thread
  // Measure and compare execution time
}
```

---

### 8. Node Clustering

**Explanation:**
**Clustering** allows creating multiple Node.js processes (workers) that share the same server port, utilizing all CPU cores.

**How it works**:
- Master process spawns worker processes (one per CPU core)
- Master distributes incoming connections to workers (round-robin by default)
- Each worker has its own event loop and memory
- Workers can communicate via IPC

**Benefits**:
- Utilize all CPU cores
- Improved throughput
- Automatic restart on worker crash
- Zero-downtime restarts

**Trade-offs**:
- No shared memory between workers
- Session affinity issues (use Redis for sessions)
- More complex deployment

**Exercise:**
```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

// 1. Basic cluster setup
if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Restart worker
    cluster.fork();
  });
} else {
  // Workers share the same port
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Handled by worker ${process.pid}\n`);
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}

// 2. Implement graceful shutdown
if (cluster.isMaster) {
  process.on('SIGTERM', () => {
    console.log('Master received SIGTERM, shutting down gracefully');

    for (const id in cluster.workers) {
      cluster.workers[id].send('shutdown');
    }

    setTimeout(() => {
      console.log('Forcing shutdown');
      process.exit(0);
    }, 10000);
  });
} else {
  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      // Stop accepting new connections
      server.close(() => {
        // Close database connections, etc.
        process.exit(0);
      });
    }
  });
}

// 3. Implement zero-downtime restart
class ClusterManager {
  constructor(workerScript) {
    this.workers = new Map();
  }

  start() {
    // Fork workers
  }

  async reload() {
    // Restart workers one by one
    // Wait for new worker to be ready before killing old one
    // Ensures zero downtime
  }

  async restartWorker(worker) {
    // Fork new worker
    // Wait for it to listen
    // Disconnect old worker
    // Kill old worker after timeout
  }
}

// 4. Handle worker communication
if (cluster.isMaster) {
  // Broadcast message to all workers
  function broadcast(message) {
    for (const id in cluster.workers) {
      cluster.workers[id].send(message);
    }
  }

  // Collect stats from all workers
  function collectStats() {
    return new Promise((resolve) => {
      const stats = [];
      let responses = 0;

      for (const id in cluster.workers) {
        cluster.workers[id].send({ cmd: 'getStats' });
      }

      cluster.on('message', (worker, msg) => {
        if (msg.cmd === 'stats') {
          stats.push(msg.data);
          if (++responses === Object.keys(cluster.workers).length) {
            resolve(stats);
          }
        }
      });
    });
  }
} else {
  process.on('message', (msg) => {
    if (msg.cmd === 'getStats') {
      process.send({
        cmd: 'stats',
        data: {
          pid: process.pid,
          memory: process.memoryUsage(),
          uptime: process.uptime()
        }
      });
    }
  });
}

// 5. Implement sticky sessions
// Problem: Load balancer may send requests from same client to different workers
// Solution: Use consistent hashing based on IP address

if (cluster.isMaster) {
  const net = require('net');

  net.createServer({ pauseOnConnect: true }, (connection) => {
    // Get client IP
    const ip = connection.remoteAddress;

    // Hash IP to worker index
    const workerIndex = hashIP(ip) % Object.keys(cluster.workers).length;
    const worker = cluster.workers[Object.keys(cluster.workers)[workerIndex]];

    // Send connection to specific worker
    worker.send('sticky-session', connection);
  }).listen(8000);

  function hashIP(ip) {
    // Simple hash function
    return ip.split('.').reduce((acc, octet) => acc + parseInt(octet), 0);
  }
}

// 6. Monitor cluster health
class ClusterMonitor {
  constructor() {
    this.metrics = new Map();
  }

  trackWorker(worker) {
    // Track: CPU usage, memory, request count, errors
    // Alert on: High memory, slow responses, crashes
  }

  getHealthReport() {
    // Return health status of all workers
    // Identify problematic workers
  }
}
```

---

### 9. Module System: ESM vs CommonJS

**Explanation:**
Node.js supports two module systems:

**CommonJS (CJS)** - Traditional Node.js modules:
```javascript
// Exporting
module.exports = { foo, bar };
exports.foo = foo; // Shorthand

// Importing
const module = require('./module');
const { foo } = require('./module');
```

**ES Modules (ESM)** - Modern JavaScript modules:
```javascript
// Exporting
export { foo, bar };
export default foo;

// Importing
import module from './module.js';
import { foo } from './module.js';
```

**Key Differences**:

| Feature | CommonJS | ES Modules |
|---------|----------|------------|
| **Syntax** | `require()`, `module.exports` | `import`, `export` |
| **Loading** | Synchronous | Asynchronous |
| **File extension** | `.js` (default) | `.mjs` or `.js` with `"type": "module"` |
| **Top-level await** | ❌ No | ✅ Yes |
| **`__dirname`, `__filename`** | ✅ Available | ❌ Not available (use `import.meta.url`) |
| **Dynamic imports** | ✅ `require(variable)` | ✅ `import(variable)` (async) |
| **Tree shaking** | ❌ No | ✅ Yes |
| **Circular dependencies** | Partial exports | Better handling |

**Enabling ESM**:
1. Use `.mjs` extension, or
2. Add `"type": "module"` to `package.json`, or
3. Use `--input-type=module` flag

**Exercise:**
```javascript
// 1. Convert CommonJS to ESM

// CommonJS:
const fs = require('fs');
const { join } = require('path');
const myModule = require('./my-module');

function readConfig() {
  const configPath = join(__dirname, 'config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

module.exports = { readConfig };

// ESM equivalent:
// Your code here (handle __dirname replacement)

// 2. Use top-level await (ESM only)
// config.js
const response = await fetch('https://api.example.com/config');
const config = await response.json();
export default config;

// Can you do this in CommonJS?

// 3. Implement dynamic imports
async function loadPlugin(pluginName) {
  // ESM:
  const plugin = await import(`./plugins/${pluginName}.js`);

  // CommonJS:
  const plugin = require(`./plugins/${pluginName}`);

  // What's the difference?
}

// 4. Handle __dirname in ESM
// CommonJS:
const configPath = path.join(__dirname, 'config.json');

// ESM:
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, 'config.json');

// Create a helper function for this

// 5. Create a dual-package (works with both CJS and ESM)
// package.json:
{
  "name": "my-package",
  "exports": {
    "import": "./dist/index.mjs",
    "require": "./dist/index.cjs"
  }
}

// How do you build this?

// 6. Handle circular dependencies
// a.js (CommonJS)
const b = require('./b');
exports.foo = () => b.bar();

// b.js (CommonJS)
const a = require('./a');
exports.bar = () => a.foo();

// What happens? How does ESM handle this better?

// 7. Implement conditional exports
// package.json:
{
  "exports": {
    ".": {
      "node": "./node-version.js",
      "browser": "./browser-version.js",
      "default": "./default-version.js"
    },
    "./feature": "./feature.js"
  }
}

// How do consumers use this?

// 8. Create a module that detects its own type
function getModuleType() {
  // Return 'commonjs' or 'module'
  // Hint: Check for module.exports vs import.meta
}
```

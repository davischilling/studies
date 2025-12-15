# Debugging

### 1. Reading Stack Traces

**Explanation:**
**Stack traces** show the call stack when an error occurs.

**How to read**:
- Start from the top (most recent call)
- Look for your code (not node_modules)
- Check line numbers
- Understand the error message

**Exercise:**
```javascript
// Example error:
Error: User not found
    at UserService.getUser (/app/services/userService.js:15:11)
    at async /app/routes/users.js:23:18
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
    at next (/app/node_modules/express/lib/router/route.js:144:13)

// Reading the trace:
// 1. Error message: "User not found"
// 2. Origin: userService.js line 15, column 11
// 3. Called from: users.js line 23, column 18
// 4. Framework code: express internals (can ignore)

// userService.js:15
async getUser(id) {
  const user = await db.findUser(id);
  if (!user) {
    throw new Error('User not found'); // Line 15
  }
  return user;
}

// users.js:23
router.get('/users/:id', async (req, res) => {
  const user = await userService.getUser(req.params.id); // Line 23
  res.json(user);
});

// Tips:
// 1. Look for YOUR code first
// 2. Ignore node_modules unless debugging a library
// 3. Check async stack traces (may be incomplete)
// 4. Use source maps for transpiled code
```

---

### 2. Common Node Error Messages

**Explanation:**
Understanding common Node.js errors helps debug faster.

**Exercise:**
```javascript
// 1. TypeError: Cannot read property 'x' of undefined
const user = undefined;
console.log(user.name); // TypeError

// Fix: Check if object exists
if (user) {
  console.log(user.name);
}
// Or use optional chaining:
console.log(user?.name);

// 2. ReferenceError: x is not defined
console.log(myVariable); // ReferenceError

// Fix: Declare variable
const myVariable = 'value';

// 3. SyntaxError: Unexpected token
const obj = { name: 'John', }; // Trailing comma (old Node versions)

// Fix: Remove trailing comma or update Node

// 4. Error: Cannot find module 'x'
const missing = require('./missing'); // Error

// Fix: Check file path, install package
npm install missing-package

// 5. ECONNREFUSED: Connection refused
await fetch('http://localhost:3000'); // ECONNREFUSED

// Fix: Check if server is running, correct port

// 6. EADDRINUSE: Address already in use
app.listen(3000); // EADDRINUSE if port 3000 is taken

// Fix: Kill process on port or use different port
lsof -ti:3000 | xargs kill -9

// 7. UnhandledPromiseRejectionWarning
async function fetchData() {
  throw new Error('Failed');
}
fetchData(); // Unhandled rejection

// Fix: Add error handling
fetchData().catch(err => console.error(err));

// 8. MaxListenersExceededWarning
const emitter = new EventEmitter();
for (let i = 0; i < 20; i++) {
  emitter.on('event', () => {}); // Warning after 10
}

// Fix: Remove listeners or increase limit
emitter.setMaxListeners(20);

// 9. ENOENT: no such file or directory
fs.readFileSync('./missing.txt'); // ENOENT

// Fix: Check file path, create file
if (fs.existsSync('./file.txt')) {
  fs.readFileSync('./file.txt');
}

// 10. ERR_HTTP_HEADERS_SENT
res.json({ data: 'first' });
res.json({ data: 'second' }); // Error

// Fix: Only send response once
if (!res.headersSent) {
  res.json({ data: 'response' });
}
```

---

### 3. Debugging Memory Leaks Using Node Inspector

**Explanation:**
**Memory leaks** occur when memory is not released, causing increasing memory usage.

**Tools**:
- Chrome DevTools
- Node.js `--inspect` flag
- Heap snapshots

**Exercise:**
```javascript
// 1. Start Node with inspector
// node --inspect server.js
// Open chrome://inspect in Chrome

// 2. Take heap snapshots
// Memory tab → Take snapshot
// Compare snapshots to find leaks

// Common memory leak patterns:

// Leak 1: Global variables
global.cache = {}; // Never cleaned!

function cacheData(key, value) {
  global.cache[key] = value;
}

// Fix: Use LRU cache with size limit
const LRU = require('lru-cache');
const cache = new LRU({ max: 500 });

// Leak 2: Event listeners not removed
const emitter = new EventEmitter();

setInterval(() => {
  emitter.on('data', (data) => {
    // Listener never removed!
  });
}, 1000);

// Fix: Remove listeners
const handler = (data) => {};
emitter.on('data', handler);
// Later:
emitter.removeListener('data', handler);

// Leak 3: Closures holding references
function createHandler() {
  const largeData = new Array(1000000).fill('data');

  return function() {
    console.log('Handler called');
    // largeData is kept in memory!
  };
}

// Fix: Don't capture unnecessary variables
function createHandler() {
  return function() {
    console.log('Handler called');
  };
}

// Leak 4: Timers not cleared
function startPolling() {
  setInterval(() => {
    fetchData();
  }, 1000);
}

// Fix: Clear timers
function startPolling() {
  const interval = setInterval(() => {
    fetchData();
  }, 1000);

  return () => clearInterval(interval);
}

// 3. Programmatic heap snapshot
const v8 = require('v8');
const fs = require('fs');

function takeHeapSnapshot(filename) {
  const snapshotStream = v8.writeHeapSnapshot(filename);
  console.log(`Heap snapshot written to ${snapshotStream}`);
}

// Take snapshots at different points
takeHeapSnapshot('before.heapsnapshot');
// Run your code
takeHeapSnapshot('after.heapsnapshot');
// Compare in Chrome DevTools

// 4. Monitor memory usage
function logMemoryUsage() {
  const used = process.memoryUsage();
  console.log({
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(used.external / 1024 / 1024)} MB`
  });
}

setInterval(logMemoryUsage, 5000);

// 5. Force garbage collection (requires --expose-gc flag)
// node --expose-gc --inspect server.js

if (global.gc) {
  global.gc();
  console.log('Garbage collection triggered');
}

// 6. Detect memory leaks
class MemoryLeakDetector {
  constructor() {
    this.baseline = null;
    this.threshold = 50 * 1024 * 1024; // 50MB
  }

  setBaseline() {
    if (global.gc) global.gc();
    this.baseline = process.memoryUsage().heapUsed;
  }

  check() {
    if (global.gc) global.gc();
    const current = process.memoryUsage().heapUsed;
    const diff = current - this.baseline;

    if (diff > this.threshold) {
      console.warn(`Possible memory leak: ${Math.round(diff / 1024 / 1024)} MB increase`);
      takeHeapSnapshot(`leak-${Date.now()}.heapsnapshot`);
      return true;
    }

    return false;
  }
}

const detector = new MemoryLeakDetector();
detector.setBaseline();

setInterval(() => {
  detector.check();
}, 60000);
```

# Performance & Optimization

### 1. Profiling CPU

**Explanation:**
CPU profiling identifies which functions consume the most CPU time.

**Tools**:
- Node.js built-in profiler (`--prof`)
- Chrome DevTools
- Clinic.js
- 0x

**Exercise:**
```javascript
// 1. Built-in profiler
// Run: node --prof app.js
// Process: node --prof-process isolate-*.log > processed.txt

// 2. Programmatic profiling
const { Session } = require('inspector');
const fs = require('fs');

function startProfiling() {
  const session = new Session();
  session.connect();

  session.post('Profiler.enable', () => {
    session.post('Profiler.start', () => {
      console.log('Profiling started');
    });
  });

  return session;
}

function stopProfiling(session) {
  session.post('Profiler.stop', (err, { profile }) => {
    if (!err) {
      fs.writeFileSync('profile.cpuprofile', JSON.stringify(profile));
      console.log('Profile saved to profile.cpuprofile');
    }
    session.disconnect();
  });
}

// Usage:
const session = startProfiling();
// Run your code
setTimeout(() => stopProfiling(session), 10000);

// 3. Identify hot paths
function expensiveOperation() {
  console.time('expensiveOperation');

  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(i);
  }

  console.timeEnd('expensiveOperation');
  return result;
}

// 4. Use performance hooks
const { performance, PerformanceObserver } = require('perf_hooks');

const obs = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

obs.observe({ entryTypes: ['measure'] });

performance.mark('start');
// Your code here
performance.mark('end');
performance.measure('My Operation', 'start', 'end');

// 5. Clinic.js usage
// Install: npm install -g clinic
// Run: clinic doctor -- node app.js
// Load test: autocannon http://localhost:3000
// Stop: Ctrl+C
// View: Opens HTML report automatically

// 6. Optimize hot paths
// Bad: Inefficient
function findUser(users, id) {
  return users.find(u => u.id === id); // O(n)
}

// Good: Use Map for O(1) lookup
const userMap = new Map(users.map(u => [u.id, u]));
function findUser(id) {
  return userMap.get(id); // O(1)
}
```

---

### 2. Profiling Memory

**Explanation:**
Memory profiling identifies memory leaks and high memory usage.

**Tools**:
- Chrome DevTools (heap snapshots)
- `process.memoryUsage()`
- Clinic.js
- heapdump

**Exercise:**
```javascript
// 1. Monitor memory usage
function logMemoryUsage() {
  const used = process.memoryUsage();

  console.log({
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`, // Resident Set Size
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(used.external / 1024 / 1024)} MB`
  });
}

setInterval(logMemoryUsage, 5000);

// 2. Take heap snapshots
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

// 3. Detect memory leaks
class MemoryLeakDetector {
  constructor() {
    this.baseline = null;
    this.threshold = 50 * 1024 * 1024; // 50MB
  }

  setBaseline() {
    global.gc(); // Requires --expose-gc flag
    this.baseline = process.memoryUsage().heapUsed;
  }

  check() {
    global.gc();
    const current = process.memoryUsage().heapUsed;
    const diff = current - this.baseline;

    if (diff > this.threshold) {
      console.warn(`Possible memory leak: ${Math.round(diff / 1024 / 1024)} MB increase`);
      return true;
    }

    return false;
  }
}

// Usage:
const detector = new MemoryLeakDetector();
detector.setBaseline();
// Run your code
setInterval(() => detector.check(), 60000);

// 4. Common memory leak patterns
// Bad: Event listener leak
function badExample() {
  const emitter = new EventEmitter();

  setInterval(() => {
    emitter.on('data', (data) => {
      // Listener never removed!
    });
  }, 1000);
}

// Good: Remove listeners
function goodExample() {
  const emitter = new EventEmitter();

  const handler = (data) => {
    // Handle data
  };

  emitter.on('data', handler);

  // Clean up
  setTimeout(() => {
    emitter.removeListener('data', handler);
  }, 10000);
}

// 5. Avoid global variables
// Bad: Global cache grows indefinitely
global.cache = {};

function cacheData(key, value) {
  global.cache[key] = value; // Never cleaned!
}

// Good: Use LRU cache with size limit
const LRU = require('lru-cache');

const cache = new LRU({
  max: 500, // Maximum items
  maxAge: 1000 * 60 * 60 // 1 hour
});

function cacheData(key, value) {
  cache.set(key, value); // Automatically evicts old items
}
```

---

### 3. Identifying Event Loop Blocking

**Explanation:**
Event loop blocking occurs when synchronous operations take too long, preventing other operations from running.

**Symptoms**:
- Slow response times
- Timeouts
- High latency

**Exercise:**
```javascript
// 1. Measure event loop lag
const { performance } = require('perf_hooks');

let lastCheck = performance.now();

setInterval(() => {
  const now = performance.now();
  const lag = now - lastCheck - 100; // Expected 100ms

  if (lag > 10) {
    console.warn(`Event loop lag: ${lag.toFixed(2)}ms`);
  }

  lastCheck = now;
}, 100);

// 2. Use blocked-at library
const blocked = require('blocked-at');

blocked((time, stack) => {
  console.log(`Blocked for ${time}ms`);
  console.log(stack);
}, { threshold: 50 }); // Alert if blocked > 50ms

// 3. Identify blocking operations
// Bad: Synchronous file read
app.get('/users', (req, res) => {
  const data = fs.readFileSync('users.json'); // BLOCKS!
  res.json(JSON.parse(data));
});

// Good: Asynchronous
app.get('/users', async (req, res) => {
  const data = await fs.promises.readFile('users.json');
  res.json(JSON.parse(data));
});

// 4. Break up CPU-intensive tasks
function processLargeArray(array) {
  let index = 0;

  function processChunk() {
    const chunkSize = 1000;
    const end = Math.min(index + chunkSize, array.length);

    for (; index < end; index++) {
      // Process item
      heavyComputation(array[index]);
    }

    if (index < array.length) {
      setImmediate(processChunk); // Yield to event loop
    } else {
      console.log('Processing complete');
    }
  }

  processChunk();
}

// 5. Use worker threads for CPU-intensive tasks
const { Worker } = require('worker_threads');

function runInWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', {
      workerData: data
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

// 6. Monitor with Clinic.js
// Run: clinic bubbleprof -- node app.js
// Visualizes async operations and event loop delays
```

---

### 4. Caching Layers (Redis, In-Memory)

**Explanation:**
Caching stores frequently accessed data to reduce database queries and computation.

**Strategies**:
- **In-memory**: Fast but limited by RAM
- **Redis**: Distributed, persistent
- **CDN**: For static assets
- **HTTP caching**: Browser/proxy caching

**Exercise:**
```javascript
// 1. In-memory caching
const cache = new Map();

async function getCachedUser(id) {
  // Check cache
  if (cache.has(id)) {
    console.log('Cache hit');
    return cache.get(id);
  }

  // Cache miss: fetch from database
  console.log('Cache miss');
  const user = await db.getUser(id);

  // Store in cache
  cache.set(id, user);

  return user;
}

// 2. LRU cache with expiration
const LRU = require('lru-cache');

const userCache = new LRU({
  max: 500, // Maximum 500 items
  maxAge: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true // Reset TTL on access
});

async function getCachedUser(id) {
  let user = userCache.get(id);

  if (!user) {
    user = await db.getUser(id);
    userCache.set(id, user);
  }

  return user;
}

// 3. Redis caching
const Redis = require('ioredis');
const redis = new Redis();

async function getCachedUserRedis(id) {
  const cacheKey = `user:${id}`;

  // Try cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const user = await db.getUser(id);

  // Store in Redis with 5 minute expiration
  await redis.setex(cacheKey, 300, JSON.stringify(user));

  return user;
}

// 4. Cache-aside pattern
class CacheService {
  constructor(redis, db) {
    this.redis = redis;
    this.db = db;
  }

  async get(key, fetchFn, ttl = 300) {
    // Try cache
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from source
    const data = await fetchFn();

    // Store in cache
    await this.redis.setex(key, ttl, JSON.stringify(data));

    return data;
  }

  async invalidate(key) {
    await this.redis.del(key);
  }
}

// Usage:
const cacheService = new CacheService(redis, db);

app.get('/users/:id', async (req, res) => {
  const user = await cacheService.get(
    `user:${req.params.id}`,
    () => db.getUser(req.params.id),
    300
  );

  res.json(user);
});

// 5. Cache warming
async function warmCache() {
  console.log('Warming cache...');

  const popularUsers = await db.getPopularUsers();

  for (const user of popularUsers) {
    await redis.setex(`user:${user.id}`, 3600, JSON.stringify(user));
  }

  console.log(`Cached ${popularUsers.length} users`);
}

// Warm cache on startup
warmCache();

// 6. Cache invalidation strategies
// Strategy 1: TTL (Time To Live)
await redis.setex('key', 300, 'value'); // Expires in 5 minutes

// Strategy 2: Manual invalidation
app.put('/users/:id', async (req, res) => {
  const user = await db.updateUser(req.params.id, req.body);

  // Invalidate cache
  await redis.del(`user:${req.params.id}`);

  res.json(user);
});

// Strategy 3: Cache tags
await redis.sadd('tag:users', 'user:1', 'user:2', 'user:3');

async function invalidateTag(tag) {
  const keys = await redis.smembers(`tag:${tag}`);
  if (keys.length > 0) {
    await redis.del(...keys);
    await redis.del(`tag:${tag}`);
  }
}

// 7. HTTP caching
app.get('/api/data', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
  res.setHeader('ETag', generateETag(data));
  res.json(data);
});
```

---

### 5. Load Balancing in Node

**Explanation:**
Load balancing distributes traffic across multiple Node.js processes/servers.

**Strategies**:
- **Clustering**: Multiple processes on one machine
- **Reverse proxy**: nginx, HAProxy
- **Cloud load balancers**: AWS ALB, GCP Load Balancer

**Exercise:**
```javascript
// 1. Node.js clustering
const cluster = require('cluster');
const os = require('os');
const express = require('express');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;

  console.log(`Master ${process.pid} is running`);
  console.log(`Forking ${numCPUs} workers`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Replace dead workers
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    console.log('Starting a new worker');
    cluster.fork();
  });
} else {
  // Worker process
  const app = express();

  app.get('/', (req, res) => {
    res.send(`Handled by process ${process.pid}`);
  });

  app.listen(3000, () => {
    console.log(`Worker ${process.pid} started`);
  });
}

// 2. Graceful shutdown with clustering
if (cluster.isMaster) {
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');

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
      server.close(() => {
        console.log(`Worker ${process.pid} shutting down`);
        process.exit(0);
      });
    }
  });
}

// 3. PM2 for production
// Install: npm install -g pm2
// Start: pm2 start app.js -i max
// Monitor: pm2 monit
// Logs: pm2 logs
// Restart: pm2 restart app
// Stop: pm2 stop app

// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    script: './app.js',
    instances: 'max', // Use all CPUs
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    merge_logs: true,
    autorestart: true,
    watch: false
  }]
};

// 4. nginx load balancer
/*
upstream backend {
    least_conn; # Load balancing method
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
*/

// 5. Health checks
app.get('/health', (req, res) => {
  // Check database connection
  db.ping()
    .then(() => res.status(200).send('OK'))
    .catch(() => res.status(503).send('Service Unavailable'));
});

// 6. Sticky sessions (for WebSocket, sessions)
// nginx config:
/*
upstream backend {
    ip_hash; # Same IP goes to same server
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
}
*/

// Or use Redis for shared sessions:
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

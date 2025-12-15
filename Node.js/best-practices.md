# Best Practices

### 1. Folder Structure Patterns

**Explanation:**
Organize code for maintainability and scalability.

**Common patterns**:

**Feature-based** (recommended for large apps):
```
src/
├── features/
│   ├── users/
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   ├── user.model.js
│   │   ├── user.routes.js
│   │   └── user.test.js
│   └── posts/
│       ├── post.controller.js
│       ├── post.service.js
│       └── ...
├── shared/
│   ├── middleware/
│   ├── utils/
│   └── config/
└── app.js
```

**Layer-based** (traditional MVC):
```
src/
├── controllers/
├── services/
├── models/
├── routes/
├── middleware/
├── utils/
├── config/
└── app.js
```

**Exercise:**
```javascript
// 1. Implement feature-based structure
// users/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticate } = require('../../shared/middleware/auth');

router.get('/', authenticate, userController.getAll);
router.post('/', authenticate, userController.create);

module.exports = router;

// users/user.controller.js
const userService = require('./user.service');

exports.getAll = async (req, res, next) => {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// users/user.service.js
const User = require('./user.model');

exports.findAll = async () => {
  return await User.find();
};

// 2. Create index files for clean imports
// features/index.js
module.exports = {
  users: require('./users/user.routes'),
  posts: require('./posts/post.routes')
};

// Usage:
const features = require('./features');
app.use('/api/users', features.users);
```

---

### 2. Dependency Injection

**Explanation:**
**Dependency Injection (DI)** provides dependencies to a module rather than having it create them internally.

**Benefits**:
- Easier testing (mock dependencies)
- Loose coupling
- Better code reusability

**Exercise:**
```javascript
// Bad: Hard-coded dependencies
class UserService {
  constructor() {
    this.db = require('./database'); // Hard-coded!
  }

  async getUser(id) {
    return await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}

// Good: Dependency injection
class UserService {
  constructor(database) {
    this.db = database; // Injected!
  }

  async getUser(id) {
    return await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}

// Usage:
const database = require('./database');
const userService = new UserService(database);

// Testing:
const mockDb = {
  query: jest.fn().mockResolvedValue({ id: 1, name: 'John' })
};
const userService = new UserService(mockDb);

// 2. DI Container
class Container {
  constructor() {
    this.services = new Map();
  }

  register(name, factory) {
    this.services.set(name, factory);
  }

  get(name) {
    const factory = this.services.get(name);
    if (!factory) throw new Error(`Service ${name} not found`);
    return factory(this);
  }
}

// Usage:
const container = new Container();

container.register('database', () => require('./database'));
container.register('userService', (c) => new UserService(c.get('database')));
container.register('userController', (c) => new UserController(c.get('userService')));

const userController = container.get('userController');
```

---

### 3. Environment Variable Management

**Explanation:**
Store configuration in environment variables, never in code.

**Best practices**:
- Use `.env` files for development (never commit!)
- Use environment-specific files: `.env.development`, `.env.production`
- Validate required variables at startup
- Provide defaults where appropriate

**Exercise:**
```javascript
// 1. Use dotenv
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  }
};

// 2. Validate required variables
function validateEnv() {
  const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateEnv();

// 3. Type-safe config
const Joi = require('joi');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  JWT_SECRET: Joi.string().required().min(32)
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  database: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT
  }
};
```

---

### 4. Logging Best Practices

**Explanation:**
Proper logging helps debug issues, monitor application health, and audit user actions.

**Best practices**:
- Use structured logging (JSON format)
- Include context (request ID, user ID, timestamp)
- Use appropriate log levels (error, warn, info, debug)
- Don't log sensitive data (passwords, tokens)
- Use centralized logging (ELK, CloudWatch, Datadog)

**Exercise:**
```javascript
// 1. Use Winston for structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Usage:
logger.info('User logged in', { userId: 123, ip: '192.168.1.1' });
logger.error('Database connection failed', { error: err.message });

// 2. Request logging middleware
const { v4: uuidv4 } = require('uuid');

function requestLogger(req, res, next) {
  req.id = uuidv4();
  const start = Date.now();

  logger.info('Request started', {
    requestId: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  res.on('finish', () => {
    logger.info('Request completed', {
      requestId: req.id,
      statusCode: res.statusCode,
      duration: Date.now() - start
    });
  });

  next();
}

// 3. Child loggers with context
function createChildLogger(context) {
  return logger.child(context);
}

// Usage:
app.use((req, res, next) => {
  req.logger = createChildLogger({ requestId: req.id });
  next();
});

app.get('/users/:id', async (req, res) => {
  req.logger.info('Fetching user', { userId: req.params.id });
  // ...
});

// 4. Sanitize sensitive data
function sanitize(obj) {
  const sensitive = ['password', 'token', 'secret', 'apiKey'];
  const sanitized = { ...obj };

  for (const key of Object.keys(sanitized)) {
    if (sensitive.includes(key)) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

logger.info('User data', sanitize(userData));
```

---

### 5. Graceful Shutdown

**Explanation:**
Gracefully shut down the server to finish processing requests and clean up resources.

**Steps**:
1. Stop accepting new connections
2. Wait for existing requests to complete
3. Close database connections
4. Exit process

**Exercise:**
```javascript
const express = require('express');
const app = express();

let server;
let isShuttingDown = false;

// 1. Basic graceful shutdown
function gracefulShutdown(signal) {
  console.log(`${signal} received, starting graceful shutdown`);
  isShuttingDown = true;

  server.close(() => {
    console.log('HTTP server closed');

    // Close database connections
    db.close(() => {
      console.log('Database connections closed');
      process.exit(0);
    });
  });

  // Force shutdown after timeout
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000); // 30 seconds
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 2. Reject new requests during shutdown
app.use((req, res, next) => {
  if (isShuttingDown) {
    res.setHeader('Connection', 'close');
    return res.status(503).send('Server is shutting down');
  }
  next();
});

// 3. Track active connections
const activeConnections = new Set();

server = app.listen(3000, () => {
  console.log('Server started');
});

server.on('connection', (conn) => {
  activeConnections.add(conn);

  conn.on('close', () => {
    activeConnections.delete(conn);
  });
});

function gracefulShutdownWithConnections() {
  console.log(`Closing ${activeConnections.size} active connections`);

  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Destroy connections after timeout
  setTimeout(() => {
    activeConnections.forEach(conn => conn.destroy());
  }, 10000);
}

// 4. Kubernetes-ready shutdown
app.get('/health', (req, res) => {
  if (isShuttingDown) {
    return res.status(503).send('Shutting down');
  }
  res.send('OK');
});
```

---

### 6. Avoiding Callback Hell

**Explanation:**
**Callback hell** (pyramid of doom) occurs when callbacks are nested deeply.

**Solutions**:
- Use Promises
- Use async/await
- Modularize code
- Use control flow libraries

**Exercise:**
```javascript
// Bad: Callback hell
fs.readFile('file1.txt', (err, data1) => {
  if (err) return console.error(err);

  fs.readFile('file2.txt', (err, data2) => {
    if (err) return console.error(err);

    fs.readFile('file3.txt', (err, data3) => {
      if (err) return console.error(err);

      console.log(data1, data2, data3);
    });
  });
});

// Good: Promises
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

readFile('file1.txt')
  .then(data1 => readFile('file2.txt'))
  .then(data2 => readFile('file3.txt'))
  .then(data3 => console.log(data3))
  .catch(err => console.error(err));

// Better: async/await
async function readFiles() {
  try {
    const data1 = await readFile('file1.txt');
    const data2 = await readFile('file2.txt');
    const data3 = await readFile('file3.txt');
    console.log(data1, data2, data3);
  } catch (err) {
    console.error(err);
  }
}

// Best: Parallel execution
async function readFilesParallel() {
  try {
    const [data1, data2, data3] = await Promise.all([
      readFile('file1.txt'),
      readFile('file2.txt'),
      readFile('file3.txt')
    ]);
    console.log(data1, data2, data3);
  } catch (err) {
    console.error(err);
  }
}
```

---

### 7. Avoiding Blocking the Event Loop

**Explanation:**
Node.js is single-threaded. Blocking operations freeze the entire server.

**Common blockers**:
- Synchronous I/O (`fs.readFileSync`)
- Heavy CPU computations
- Large JSON parsing
- Complex regex

**Solutions**:
- Use async APIs
- Offload to worker threads
- Break up work with `setImmediate()`
- Use streaming for large data

**Exercise:**
```javascript
// Bad: Blocking
app.get('/users', (req, res) => {
  const data = fs.readFileSync('users.json'); // BLOCKS!
  res.json(JSON.parse(data));
});

// Good: Non-blocking
app.get('/users', async (req, res) => {
  const data = await fs.promises.readFile('users.json');
  res.json(JSON.parse(data));
});

// Bad: Heavy computation blocks event loop
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

app.get('/fib/:n', (req, res) => {
  const result = fibonacci(parseInt(req.params.n)); // BLOCKS!
  res.json({ result });
});

// Good: Use worker threads
const { Worker } = require('worker_threads');

app.get('/fib/:n', (req, res) => {
  const worker = new Worker('./fibonacci-worker.js', {
    workerData: { n: parseInt(req.params.n) }
  });

  worker.on('message', result => res.json({ result }));
  worker.on('error', err => res.status(500).json({ error: err.message }));
});

// fibonacci-worker.js
const { parentPort, workerData } = require('worker_threads');

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

parentPort.postMessage(fibonacci(workerData.n));

// 3. Break up long-running tasks
function processLargeArray(array, callback) {
  let index = 0;

  function processChunk() {
    const chunkSize = 1000;
    const end = Math.min(index + chunkSize, array.length);

    for (; index < end; index++) {
      // Process item
      processItem(array[index]);
    }

    if (index < array.length) {
      setImmediate(processChunk); // Yield to event loop
    } else {
      callback();
    }
  }

  processChunk();
}

// 4. Monitor event loop lag
const { performance } = require('perf_hooks');

let lastCheck = performance.now();

setInterval(() => {
  const now = performance.now();
  const lag = now - lastCheck - 1000; // Expected 1000ms

  if (lag > 100) {
    console.warn(`Event loop lag: ${lag}ms`);
  }

  lastCheck = now;
}, 1000);
```

---

### 8. Using Async Local Storage & Context Propagation

**Explanation:**
**AsyncLocalStorage** provides context that persists across async operations without passing it explicitly.

**Use cases**:
- Request ID tracking
- User context
- Transaction management
- Logging context

**Exercise:**
```javascript
const { AsyncLocalStorage } = require('async_hooks');
const asyncLocalStorage = new AsyncLocalStorage();

// 1. Basic usage
app.use((req, res, next) => {
  const store = {
    requestId: req.id,
    userId: req.user?.id,
    startTime: Date.now()
  };

  asyncLocalStorage.run(store, () => {
    next();
  });
});

// Access context anywhere
function logWithContext(message) {
  const store = asyncLocalStorage.getStore();
  console.log({
    message,
    requestId: store?.requestId,
    userId: store?.userId
  });
}

app.get('/users', async (req, res) => {
  logWithContext('Fetching users'); // Has context!
  const users = await getUsers();
  res.json(users);
});

async function getUsers() {
  logWithContext('Querying database'); // Still has context!
  return await db.query('SELECT * FROM users');
}

// 2. Transaction management
class TransactionManager {
  constructor() {
    this.storage = new AsyncLocalStorage();
  }

  async runInTransaction(callback) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const result = await this.storage.run(client, callback);

      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  getClient() {
    return this.storage.getStore();
  }
}

const txManager = new TransactionManager();

// Usage:
app.post('/transfer', async (req, res) => {
  await txManager.runInTransaction(async () => {
    await debitAccount(req.body.from, req.body.amount);
    await creditAccount(req.body.to, req.body.amount);
  });

  res.json({ success: true });
});

async function debitAccount(accountId, amount) {
  const client = txManager.getClient(); // Gets transaction client!
  await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, accountId]);
}
```

---

### 9. Testing Strategies

**Explanation:**
Different testing levels serve different purposes.

**Testing pyramid**:
- **Unit tests** (70%): Test individual functions
- **Integration tests** (20%): Test modules together
- **E2E tests** (10%): Test entire application

**Exercise:**
```javascript
// 1. Unit test (Jest)
// userService.test.js
const UserService = require('./userService');

describe('UserService', () => {
  let userService;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      query: jest.fn()
    };
    userService = new UserService(mockDb);
  });

  test('getUser returns user when found', async () => {
    const mockUser = { id: 1, name: 'John' };
    mockDb.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userService.getUser(1);

    expect(result).toEqual(mockUser);
    expect(mockDb.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE id = $1',
      [1]
    );
  });

  test('getUser throws when not found', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    await expect(userService.getUser(1)).rejects.toThrow('User not found');
  });
});

// 2. Integration test
// userRoutes.test.js
const request = require('supertest');
const app = require('./app');

describe('User Routes', () => {
  test('GET /users returns list of users', async () => {
    const response = await request(app)
      .get('/users')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /users creates user', async () => {
    const newUser = { name: 'John', email: 'john@example.com' };

    const response = await request(app)
      .post('/users')
      .send(newUser)
      .expect(201);

    expect(response.body).toMatchObject(newUser);
    expect(response.body.id).toBeDefined();
  });
});

// 3. E2E test (with test database)
describe('User Flow E2E', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  test('complete user registration flow', async () => {
    // Register
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'Password123!' })
      .expect(201);

    // Login
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'Password123!' })
      .expect(200);

    const token = loginRes.body.token;

    // Access protected route
    await request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
```

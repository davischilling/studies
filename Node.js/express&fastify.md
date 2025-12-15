# Express / Fastify

### 1. Middleware Pattern

**Explanation:**
**Middleware** functions have access to request, response, and the next middleware in the chain.

**Signature**: `(req, res, next) => {}`

**Types**:
1. **Application-level**: `app.use()`, `app.METHOD()`
2. **Router-level**: `router.use()`, `router.METHOD()`
3. **Error-handling**: `(err, req, res, next) => {}`
4. **Built-in**: `express.json()`, `express.static()`
5. **Third-party**: `cors()`, `helmet()`, `morgan()`

**Execution order**: Top to bottom, must call `next()` to continue

**Exercise:**
```javascript
const express = require('express');
const app = express();

// 1. Create custom middleware
function logger(req, res, next) {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next(); // MUST call next() to continue
}

app.use(logger);

// 2. Middleware with configuration
function timeout(ms) {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      res.status(408).send('Request Timeout');
    }, ms);

    res.on('finish', () => clearTimeout(timer));
    next();
  };
}

app.use(timeout(5000));

// 3. Conditional middleware
function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
}

app.get('/admin', adminOnly, (req, res) => {
  res.send('Admin panel');
});

// 4. Async middleware (Express 5+ or use wrapper)
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

app.get('/users', asyncHandler(async (req, res) => {
  const users = await db.getUsers();
  res.json(users);
}));

// 5. Middleware chain
app.get('/protected',
  authenticate,
  authorize('admin'),
  validate(userSchema),
  asyncHandler(async (req, res) => {
    // Handler
  })
);

// 6. Router-level middleware
const router = express.Router();

router.use((req, res, next) => {
  console.log('Router middleware');
  next();
});

router.get('/users', (req, res) => {
  res.json({ users: [] });
});

app.use('/api', router);

// 7. Fastify equivalent
const fastify = require('fastify')();

// Fastify hooks (similar to middleware)
fastify.addHook('onRequest', async (request, reply) => {
  console.log(`${request.method} ${request.url}`);
});

fastify.addHook('preHandler', async (request, reply) => {
  // Runs before handler
  if (!request.headers.authorization) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// 8. Implement request timing middleware
function requestTimer(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });

  next();
}

// 9. Implement rate limiting middleware
const rateLimit = new Map();

function rateLimiter(maxRequests, windowMs) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimit.has(key)) {
      rateLimit.set(key, []);
    }

    const requests = rateLimit.get(key).filter(time => time > windowStart);

    if (requests.length >= maxRequests) {
      return res.status(429).send('Too Many Requests');
    }

    requests.push(now);
    rateLimit.set(key, requests);
    next();
  };
}

app.use(rateLimiter(100, 60000)); // 100 requests per minute
```

---

### 2. Error Handling

**Explanation:**
**Error handling middleware** has 4 parameters: `(err, req, res, next)`

**Best practices**:
- Define error middleware last (after all routes)
- Distinguish operational vs programmer errors
- Log errors appropriately
- Don't expose internal errors to clients
- Use async error handlers

**Exercise:**
```javascript
const express = require('express');
const app = express();

// 1. Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 2. Structured error handling
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Usage:
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await db.getUser(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// 3. Comprehensive error handler
app.use((err, req, res, next) => {
  // Log error
  console.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Operational error: send to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode
      }
    });
  }

  // Programming error: don't leak details
  res.status(500).json({
    error: {
      message: 'Internal server error',
      statusCode: 500
    }
  });
});

// 4. Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

app.get('/users', catchAsync(async (req, res) => {
  const users = await db.getUsers();
  res.json(users);
}));

// 5. 404 handler (must be after all routes)
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      statusCode: 404
    }
  });
});

// 6. Fastify error handling
fastify.setErrorHandler((error, request, reply) => {
  // Log error
  request.log.error(error);

  // Send response
  reply.status(error.statusCode || 500).send({
    error: {
      message: error.message,
      statusCode: error.statusCode || 500
    }
  });
});

// 7. Validation errors
const { validationResult } = require('express-validator');

app.post('/users', (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
});

// 8. Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
```

---

### 3. Request Validation

**Explanation:**
Validate incoming data to prevent security issues and ensure data integrity.

**Validation libraries**:
- **express-validator**: Middleware-based validation
- **Joi**: Schema-based validation
- **Yup**: Similar to Joi
- **Ajv**: JSON Schema validator (used by Fastify)

**What to validate**:
- Request body, query parameters, URL parameters, headers
- Data types, formats, ranges, patterns
- Required fields, optional fields

**Exercise:**
```javascript
const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const Joi = require('joi');

const app = express();
app.use(express.json());

// 1. Express-validator: Middleware-based
app.post('/users',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('age').optional().isInt({ min: 18, max: 120 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Process valid data
    res.json({ message: 'User created' });
  }
);

// 2. Joi: Schema-based validation
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  age: Joi.number().integer().min(18).max(120).optional(),
  role: Joi.string().valid('user', 'admin').default('user')
});

function validateJoi(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        errors: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }

    req.body = value; // Use validated/sanitized data
    next();
  };
}

app.post('/users', validateJoi(userSchema), (req, res) => {
  res.json({ message: 'User created', data: req.body });
});

// 3. Fastify: Built-in JSON Schema validation
fastify.post('/users', {
  schema: {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        age: { type: 'integer', minimum: 18, maximum: 120 }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  // Data is already validated
  const user = await createUser(request.body);
  reply.send(user);
});

// 4. Custom validators
const customValidators = {
  isStrongPassword: (value) => {
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);
    return hasUpper && hasLower && hasNumber && hasSpecial;
  },

  isValidUsername: (value) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(value);
  }
};

// 5. Sanitization
app.post('/posts',
  body('title').trim().escape(),
  body('content').trim(),
  body('tags').toArray().customSanitizer(tags =>
    tags.map(tag => tag.toLowerCase().trim())
  ),
  (req, res) => {
    // Data is sanitized
    res.json(req.body);
  }
);

// 6. Query parameter validation
app.get('/users',
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sort').optional().isIn(['name', 'email', 'createdAt']),
  query('order').optional().isIn(['asc', 'desc']),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    // Use validated parameters
  }
);

// 7. File upload validation
const multer = require('multer');

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ file: req.file });
});
```

---

### 4. Performance Trade-offs

**Explanation:**
Different frameworks have different performance characteristics.

**Express**:
- ✅ Mature, large ecosystem, flexible
- ❌ Slower than modern alternatives
- ❌ No built-in validation/serialization
- Use when: Ecosystem and flexibility matter more than raw speed

**Fastify**:
- ✅ 2-3x faster than Express
- ✅ Built-in JSON schema validation
- ✅ Async/await first
- ✅ Better TypeScript support
- ❌ Smaller ecosystem
- Use when: Performance is critical

**Performance considerations**:
- JSON parsing/serialization (Fastify uses fast-json-stringify)
- Routing algorithm (Fastify uses find-my-way, faster than Express)
- Middleware overhead
- Schema validation overhead vs runtime errors

**Exercise:**
```javascript
// 1. Benchmark Express vs Fastify
const express = require('express');
const fastify = require('fastify')();

// Express
const expressApp = express();
expressApp.get('/test', (req, res) => {
  res.json({ message: 'Hello' });
});

// Fastify
fastify.get('/test', async (request, reply) => {
  return { message: 'Hello' };
});

// Use autocannon or wrk to benchmark:
// autocannon -c 100 -d 10 http://localhost:3000/test

// 2. Optimize JSON serialization
// Express (manual):
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  password: 'secret', // Don't send!
  createdAt: new Date()
};

res.json({
  id: user.id,
  name: user.name,
  email: user.email
});

// Fastify (automatic with schema):
fastify.get('/user', {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }
  }
}, async () => {
  return user; // Fastify only serializes defined fields
});

// 3. Optimize routing
// Express: Linear search O(n)
app.get('/users/:id', handler);
app.get('/posts/:id', handler);
app.get('/comments/:id', handler);
// ... 100 more routes

// Fastify: Radix tree O(log n)
// Automatically optimized

// 4. Reduce middleware overhead
// Bad: Too many middleware
app.use(middleware1);
app.use(middleware2);
app.use(middleware3);
// ... 20 more

// Good: Combine middleware
app.use((req, res, next) => {
  // Do everything in one pass
  middleware1Logic();
  middleware2Logic();
  middleware3Logic();
  next();
});

// 5. Use streaming for large responses
// Bad: Load everything into memory
app.get('/large-data', async (req, res) => {
  const data = await db.getAllRecords(); // 1GB of data!
  res.json(data);
});

// Good: Stream data
app.get('/large-data', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.write('[');

  const stream = db.streamRecords();
  let first = true;

  stream.on('data', (record) => {
    if (!first) res.write(',');
    res.write(JSON.stringify(record));
    first = false;
  });

  stream.on('end', () => {
    res.write(']');
    res.end();
  });
});

// 6. Connection pooling
const { Pool } = require('pg');

const pool = new Pool({
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Good: Reuse connections
app.get('/users', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users');
    res.json(result.rows);
  } finally {
    client.release();
  }
});

// 7. Caching
const cache = new Map();

app.get('/expensive-operation', async (req, res) => {
  const cacheKey = 'expensive-result';

  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  const result = await expensiveOperation();
  cache.set(cacheKey, result);

  setTimeout(() => cache.delete(cacheKey), 60000); // Expire after 1 minute

  res.json(result);
});
```

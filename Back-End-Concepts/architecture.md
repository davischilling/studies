# Architecture

### 1. REST Fundamentals

**Explanation:**
**REST (Representational State Transfer)** is an architectural style for APIs.

**Principles**:
- **Stateless**: Each request contains all needed information
- **Resource-based**: URLs represent resources
- **HTTP methods**: GET, POST, PUT, PATCH, DELETE
- **Status codes**: 200, 201, 400, 404, 500, etc.

**Exercise:**
```javascript
// RESTful API design:

// Resources (nouns, not verbs):
GET    /users          // List users
GET    /users/123      // Get user
POST   /users          // Create user
PUT    /users/123      // Update user (full)
PATCH  /users/123      // Update user (partial)
DELETE /users/123      // Delete user

// Nested resources:
GET    /users/123/orders       // Get user's orders
POST   /users/123/orders       // Create order for user
GET    /users/123/orders/456   // Get specific order

// Bad (not RESTful):
GET    /getUser?id=123
POST   /createUser
POST   /deleteUser

// Status codes:
app.get('/users/:id', async (req, res) => {
  const user = await db.getUser(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json(user);
});

app.post('/users', async (req, res) => {
  const user = await db.createUser(req.body);
  res.status(201).json(user);
});

app.delete('/users/:id', async (req, res) => {
  await db.deleteUser(req.params.id);
  res.status(204).send();
});

// Filtering, sorting, pagination:
GET /users?role=admin&sort=created_at&order=desc&page=1&limit=10

app.get('/users', async (req, res) => {
  const { role, sort, order, page = 1, limit = 10 } = req.query;

  const users = await db.getUsers({
    role,
    sort,
    order,
    offset: (page - 1) * limit,
    limit
  });

  res.json({
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: await db.countUsers({ role })
    }
  });
});
```

---

### 2. RPC vs REST

**Explanation:**
**RPC (Remote Procedure Call)**: Call functions remotely
**REST**: Manipulate resources via HTTP

**Comparison**:

| Aspect | REST | RPC |
|--------|------|-----|
| Focus | Resources | Actions |
| Protocol | HTTP | HTTP, gRPC, etc. |
| Caching | Easy | Hard |
| Discovery | Self-documenting | Needs docs |
| Performance | Slower | Faster (gRPC) |

**Exercise:**
```javascript
// REST:
POST /users
GET /users/123
PUT /users/123
DELETE /users/123

// RPC:
POST /createUser
POST /getUser
POST /updateUser
POST /deleteUser

// gRPC example:
// user.proto
service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc CreateUser (CreateUserRequest) returns (User);
  rpc UpdateUser (UpdateUserRequest) returns (User);
  rpc DeleteUser (DeleteUserRequest) returns (Empty);
}

// When to use REST:
// - Public APIs
// - CRUD operations
// - Caching important

// When to use RPC:
// - Internal microservices
// - Complex operations
// - Performance critical
```

---

### 3. Microservices vs Monoliths

**Explanation:**
**Monolith**: Single application
**Microservices**: Multiple small services

**Trade-offs**:

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| Complexity | Low | High |
| Deployment | Simple | Complex |
| Scaling | Vertical | Horizontal |
| Development | Fast (initially) | Slow (initially) |
| Debugging | Easy | Hard |

**Exercise:**
```javascript
// Monolith:
// Single codebase, single deployment
app.js
├── routes/
│   ├── users.js
│   ├── orders.js
│   └── products.js
├── models/
└── services/

// Microservices:
// Multiple services, independent deployments
user-service/
order-service/
product-service/

// Communication between services:
// 1. HTTP/REST
const axios = require('axios');

async function createOrder(userId, items) {
  // Call user service
  const user = await axios.get(`http://user-service/users/${userId}`);

  // Call product service
  const products = await axios.post('http://product-service/products/batch', { ids: items });

  // Create order
  return await db.createOrder({ userId, items, products });
}

// 2. Message queue (async)
const amqp = require('amqplib');

async function createOrder(userId, items) {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('orders');
  channel.sendToQueue('orders', Buffer.from(JSON.stringify({ userId, items })));
}

// When to use monolith:
// - Small team
// - Simple application
// - Fast iteration needed

// When to use microservices:
// - Large team
// - Complex domain
// - Independent scaling needed
```

---

### 4. API Versioning

**Explanation:**
**API versioning** allows breaking changes without affecting existing clients.

**Strategies**:
- **URL versioning**: `/v1/users`, `/v2/users`
- **Header versioning**: `Accept: application/vnd.api+json; version=1`
- **Query parameter**: `/users?version=1`

**Exercise:**
```javascript
// 1. URL versioning (most common)
app.use('/v1', v1Routes);
app.use('/v2', v2Routes);

// v1/users.js
router.get('/users/:id', async (req, res) => {
  const user = await db.getUser(req.params.id);
  res.json({ id: user.id, name: user.name }); // Old format
});

// v2/users.js
router.get('/users/:id', async (req, res) => {
  const user = await db.getUser(req.params.id);
  res.json({
    data: {
      id: user.id,
      attributes: { name: user.name, email: user.email }
    }
  }); // New format
});

// 2. Header versioning
app.use((req, res, next) => {
  const version = req.headers['api-version'] || '1';
  req.apiVersion = version;
  next();
});

router.get('/users/:id', async (req, res) => {
  const user = await db.getUser(req.params.id);

  if (req.apiVersion === '1') {
    res.json({ id: user.id, name: user.name });
  } else {
    res.json({ data: { id: user.id, attributes: { name: user.name } } });
  }
});

// 3. Deprecation warnings
router.get('/users/:id', async (req, res) => {
  if (req.apiVersion === '1') {
    res.setHeader('Warning', '299 - "API v1 is deprecated. Please upgrade to v2."');
  }

  // ...
});
```

---

### 5. Message Queues (Kafka, RabbitMQ, SQS)

**Explanation:**
**Message queues** enable asynchronous communication between services.

**Use cases**:
- Decouple services
- Handle traffic spikes
- Retry failed operations
- Event-driven architecture

**Exercise:**
```javascript
// RabbitMQ example:
const amqp = require('amqplib');

// Producer:
async function sendEmail(email) {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('emails');
  channel.sendToQueue('emails', Buffer.from(JSON.stringify(email)));

  console.log('Email queued');
}

// Consumer:
async function processEmails() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('emails');

  channel.consume('emails', async (msg) => {
    const email = JSON.parse(msg.content.toString());

    try {
      await sendEmailService(email);
      channel.ack(msg); // Acknowledge
    } catch (err) {
      channel.nack(msg); // Reject and requeue
    }
  });
}

// AWS SQS example:
const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

// Send message:
await sqs.sendMessage({
  QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/my-queue',
  MessageBody: JSON.stringify({ email: 'test@example.com' })
}).promise();

// Receive message:
const messages = await sqs.receiveMessage({
  QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/my-queue',
  MaxNumberOfMessages: 10,
  WaitTimeSeconds: 20
}).promise();

for (const message of messages.Messages || []) {
  // Process message
  await processMessage(JSON.parse(message.Body));

  // Delete message
  await sqs.deleteMessage({
    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/my-queue',
    ReceiptHandle: message.ReceiptHandle
  }).promise();
}
```

---

### 6. Caching Strategies (Redis, CDN, Memory)

**Explanation:**
**Caching** stores frequently accessed data for faster retrieval.

**Layers**:
- **Browser cache**: Client-side
- **CDN**: Edge locations
- **Application cache**: In-memory (Redis)
- **Database cache**: Query cache

**Strategies**:
- **Cache-aside**: App checks cache, then database
- **Write-through**: Write to cache and database
- **Write-behind**: Write to cache, async to database

**Exercise:**
```javascript
// 1. In-memory cache (simple)
const cache = new Map();

async function getUser(id) {
  if (cache.has(id)) {
    return cache.get(id);
  }

  const user = await db.getUser(id);
  cache.set(id, user);

  return user;
}

// 2. Redis cache
const Redis = require('ioredis');
const redis = new Redis();

async function getUser(id) {
  // Check cache
  const cached = await redis.get(`user:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const user = await db.getUser(id);

  // Store in cache (5 minutes)
  await redis.setex(`user:${id}`, 300, JSON.stringify(user));

  return user;
}

// 3. CDN caching (HTTP headers)
app.get('/api/products', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
  res.setHeader('ETag', generateETag(products));
  res.json(products);
});

// 4. Cache invalidation
app.put('/users/:id', async (req, res) => {
  const user = await db.updateUser(req.params.id, req.body);

  // Invalidate cache
  await redis.del(`user:${req.params.id}`);

  res.json(user);
});
```

---

### 7. Rate Limiting / Throttling

**Explanation:**
**Rate limiting**: Limit requests per time window
**Throttling**: Slow down requests

**Algorithms**:
- **Fixed window**: 100 requests per minute
- **Sliding window**: More accurate
- **Token bucket**: Allow bursts

**Exercise:**
```javascript
const rateLimit = require('express-rate-limit');

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests'
});

app.use('/api/', limiter);

// Different limits for different endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5 // Strict limit for auth
});

app.post('/auth/login', authLimiter, loginHandler);

// Custom rate limiter with Redis
const Redis = require('ioredis');
const redis = new Redis();

async function rateLimiter(req, res, next) {
  const key = `ratelimit:${req.ip}`;
  const limit = 100;
  const window = 60; // seconds

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, window);
  }

  if (current > limit) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', limit - current);

  next();
}

app.use(rateLimiter);
```

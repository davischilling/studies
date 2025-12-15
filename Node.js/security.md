# Security

### 1. OWASP Basics

**Explanation:**
**OWASP Top 10** are the most critical web application security risks.

**Top risks**:
1. **Injection** (SQL, NoSQL, Command)
2. **Broken Authentication**
3. **Sensitive Data Exposure**
4. **XML External Entities (XXE)**
5. **Broken Access Control**
6. **Security Misconfiguration**
7. **Cross-Site Scripting (XSS)**
8. **Insecure Deserialization**
9. **Using Components with Known Vulnerabilities**
10. **Insufficient Logging & Monitoring**

**Exercise:**
```javascript
// 1. Prevent SQL Injection
// Bad: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;
// Vulnerable to: ' OR '1'='1

// Good: Parameterized queries
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);

// 2. Prevent NoSQL Injection
// Bad: Direct object insertion
const user = await User.findOne({ email: req.body.email });
// Vulnerable to: { email: { $ne: null } }

// Good: Validate and sanitize
const email = String(req.body.email);
if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
  throw new Error('Invalid email');
}
const user = await User.findOne({ email });

// 3. Prevent Command Injection
// Bad: Direct command execution
const { exec } = require('child_process');
exec(`ls ${req.query.dir}`); // Vulnerable to: ; rm -rf /

// Good: Use array syntax or validate
const { execFile } = require('child_process');
execFile('ls', [req.query.dir]); // Safer

// 4. Secure authentication
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// 5. Prevent XSS
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Use in templates
res.send(`<div>${escapeHtml(userInput)}</div>`);

// 6. Secure session management
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // No JavaScript access
    maxAge: 3600000, // 1 hour
    sameSite: 'strict' // CSRF protection
  }
}));
```

---

### 2. Input Validation

**Explanation:**
**Never trust user input**. Validate all input on the server side.

**What to validate**:
- Type, format, length, range
- Whitelist allowed values
- Sanitize before use

**Exercise:**
```javascript
const Joi = require('joi');
const validator = require('validator');

// 1. Schema validation with Joi
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  age: Joi.number().integer().min(18).max(120),
  role: Joi.string().valid('user', 'admin').default('user'),
  website: Joi.string().uri()
});

function validateUser(data) {
  const { error, value } = userSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new ValidationError(error.details);
  }

  return value;
}

// 2. Manual validation
function validateEmail(email) {
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email');
  }
  return validator.normalizeEmail(email);
}

function validatePassword(password) {
  if (password.length < 8) {
    throw new Error('Password too short');
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain uppercase');
  }

  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain lowercase');
  }

  if (!/\d/.test(password)) {
    throw new Error('Password must contain number');
  }

  return password;
}

// 3. Sanitize input
function sanitizeInput(input) {
  // Remove HTML tags
  let sanitized = validator.stripLow(input);
  sanitized = validator.escape(sanitized);

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

// 4. Validate file uploads
const multer = require('multer');

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Whitelist MIME types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }

    // Validate extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      return cb(new Error('Invalid file extension'));
    }

    cb(null, true);
  }
});

// 5. Validate query parameters
function validatePagination(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1 || page > 1000) {
    return res.status(400).json({ error: 'Invalid page' });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({ error: 'Invalid limit' });
  }

  req.pagination = { page, limit };
  next();
}
```

---

### 3. Avoiding Prototype Pollution

**Explanation:**
**Prototype pollution** allows attackers to modify Object.prototype, affecting all objects.

**Vulnerable code**: Merging user input into objects without validation

**Exercise:**
```javascript
// Bad: Vulnerable to prototype pollution
function merge(target, source) {
  for (let key in source) {
    target[key] = source[key];
  }
  return target;
}

// Attack:
const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');
merge({}, malicious);
// Now ALL objects have isAdmin: true!

// Good: Safe merge
function safeMerge(target, source) {
  for (let key in source) {
    if (source.hasOwnProperty(key) && key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
      target[key] = source[key];
    }
  }
  return target;
}

// Better: Use Object.assign or spread
const merged = { ...target, ...source }; // Still vulnerable!

// Best: Validate keys
function secureMerge(target, source, allowedKeys) {
  for (let key of allowedKeys) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
  return target;
}

// 2. Prevent in JSON parsing
app.use(express.json({
  reviver: (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  }
}));

// 3. Use Object.create(null)
const safeObject = Object.create(null);
// No prototype, can't be polluted

// 4. Freeze prototypes
Object.freeze(Object.prototype);
Object.freeze(Array.prototype);

// 5. Validate object keys
function validateKeys(obj, allowedKeys) {
  const keys = Object.keys(obj);
  const dangerous = ['__proto__', 'constructor', 'prototype'];

  for (let key of keys) {
    if (dangerous.includes(key)) {
      throw new Error(`Dangerous key: ${key}`);
    }

    if (!allowedKeys.includes(key)) {
      throw new Error(`Unexpected key: ${key}`);
    }
  }
}
```

---

### 4. Rate Limiting

**Explanation:**
**Rate limiting** prevents abuse by limiting requests per time window.

**Strategies**:
- Fixed window: 100 requests per minute
- Sliding window: More accurate
- Token bucket: Burst handling

**Exercise:**
```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// 1. Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false
});

app.use('/api/', limiter);

// 2. Different limits for different routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Strict limit for auth
  skipSuccessfulRequests: true // Don't count successful logins
});

app.post('/auth/login', authLimiter, loginHandler);

// 3. Redis-based rate limiting (for distributed systems)
const redis = new Redis();

const distributedLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:'
  }),
  windowMs: 60 * 1000,
  max: 100
});

// 4. Custom rate limiter
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  middleware() {
    return (req, res, next) => {
      const key = req.ip;
      const now = Date.now();
      const windowStart = now - this.windowMs;

      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }

      const userRequests = this.requests.get(key);

      // Remove old requests
      const validRequests = userRequests.filter(time => time > windowStart);

      if (validRequests.length >= this.maxRequests) {
        res.setHeader('Retry-After', Math.ceil(this.windowMs / 1000));
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: this.windowMs / 1000
        });
      }

      validRequests.push(now);
      this.requests.set(key, validRequests);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', this.maxRequests - validRequests.length);
      res.setHeader('X-RateLimit-Reset', new Date(now + this.windowMs).toISOString());

      next();
    };
  }
}

// 5. Token bucket algorithm
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate; // tokens per second
    this.lastRefill = Date.now();
  }

  consume(tokens = 1) {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  refill() {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}
```

---

### 5. CORS

**Explanation:**
**CORS (Cross-Origin Resource Sharing)** controls which origins can access your API.

**Headers**:
- `Access-Control-Allow-Origin`: Allowed origins
- `Access-Control-Allow-Methods`: Allowed HTTP methods
- `Access-Control-Allow-Headers`: Allowed headers
- `Access-Control-Allow-Credentials`: Allow cookies

**Exercise:**
```javascript
const cors = require('cors');

// 1. Allow all origins (development only!)
app.use(cors());

// 2. Specific origin
app.use(cors({
  origin: 'https://example.com'
}));

// 3. Multiple origins
const allowedOrigins = ['https://example.com', 'https://app.example.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 4. Manual CORS implementation
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// 5. Route-specific CORS
app.get('/public', cors(), publicHandler);
app.get('/private', cors({ origin: 'https://app.example.com' }), privateHandler);
```

---

### 6. Secure Secrets Management

**Explanation:**
**Never hardcode secrets**. Use environment variables and secret management services.

**Best practices**:
- Use `.env` files (never commit!)
- Use secret management services (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly
- Use different secrets per environment

**Exercise:**
```javascript
// 1. Use environment variables
require('dotenv').config();

const config = {
  dbPassword: process.env.DB_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
  apiKey: process.env.API_KEY
};

// 2. AWS Secrets Manager
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({
    SecretId: secretName
  }).promise();

  return JSON.parse(data.SecretString);
}

// Usage:
const dbCredentials = await getSecret('prod/db/credentials');

// 3. HashiCorp Vault
const vault = require('node-vault')({
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN
});

async function getVaultSecret(path) {
  const result = await vault.read(path);
  return result.data;
}

// 4. Encrypt secrets at rest
const crypto = require('crypto');

function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text, key) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// 5. Validate secrets at startup
function validateSecrets() {
  const required = [
    'DB_PASSWORD',
    'JWT_SECRET',
    'API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required secrets: ${missing.join(', ')}`);
  }

  // Validate format
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
}

validateSecrets();

// 6. Rotate secrets
async function rotateSecret(secretName) {
  // Generate new secret
  const newSecret = crypto.randomBytes(32).toString('hex');

  // Update in secret manager
  await secretsManager.updateSecret({
    SecretId: secretName,
    SecretString: newSecret
  }).promise();

  // Update application config
  config.jwtSecret = newSecret;

  console.log(`Secret ${secretName} rotated`);
}
```

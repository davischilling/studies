# Node.js Best Practices - Summary

A comprehensive guide covering 102+ best practices for Node.js development across 8 major categories.

---

## 1. Project Architecture (6 practices)

**Key Principles:**
- **Structure by Components**: Organize code by business domains (e.g., `orders`, `users`, `payments`) rather than technical roles
- **3-Tier Layering**: Separate each component into entry-points (API/controllers), domain (business logic), and data-access layers
- **Environment-Aware Config**: Use hierarchical configuration with environment variables and secure secret management
- **TypeScript Usage**: Apply thoughtfully - consider team expertise and project complexity
- **Framework Selection**: Evaluate long-term consequences including community support, performance, and ecosystem

**Example Structure:**
```bash
my-system
├─ apps (components)
│  ├─ orders
│  │  ├─ entry-points (API controllers)
│  │  ├─ domain (business logic)
│  │  ├─ data-access (DB layer)
│  ├─ users
│  ├─ payments
├─ libraries (shared utilities)
│  ├─ logger
│  ├─ authenticator
```

---

## 2. Error Handling (13 practices)

**Key Principles:**
- **Async/Await**: Use async-await or promises instead of callbacks for cleaner error handling
- **Extend Error Object**: Create custom error classes with operational/programmer error distinction
- **Centralized Handling**: Handle errors in a dedicated middleware, not scattered throughout code
- **Graceful Shutdown**: Exit process gracefully when encountering unknown errors
- **Mature Logger**: Use structured logging libraries (Winston, Pino) for better error visibility
- **Catch Unhandled Rejections**: Always handle promise rejections to prevent silent failures
- **Always Await**: Await promises before returning to avoid partial stack traces

**Example:**
```javascript
// Async error handling
async function executeTask() {
  try {
    const result = await functionA();
    return await functionB(result);
  } catch (err) {
    logger.error(err);
    throw err; // Re-throw for centralized handling
  }
}

// Custom error class
class AppError extends Error {
  constructor(name, httpCode, isOperational, description) {
    super(description);
    this.name = name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
  }
}
```

---

## 3. Code Style (13 practices)

**Key Principles:**
- **ESLint + Prettier**: Use ESLint for code quality and Prettier for formatting
- **Node.js ESLint Plugins**: Apply Node-specific rules (eslint-plugin-node, eslint-plugin-security)
- **Naming Conventions**: Use camelCase for variables/functions, PascalCase for classes, UPPER_CASE for constants
- **Const over Let**: Prefer `const`, avoid `var` entirely
- **Strict Equality**: Always use `===` instead of `==`
- **Async/Await over Callbacks**: Modern async patterns for better readability
- **Arrow Functions**: Use arrow functions for cleaner syntax
- **Avoid Side Effects**: Keep functions pure, avoid effects outside function scope

**Example:**
```javascript
// Good practices
const MAX_RETRIES = 3;

class UserService {
  async getUserById(userId) {
    const user = await db.users.findOne({ id: userId });
    return user;
  }
}

const processData = (data) => data.map(item => item.value);
```

---

## 4. Testing & Quality (13 practices)

**Key Principles:**
- **API/Component Testing**: Prioritize integration tests over unit tests
- **AAA Pattern**: Structure tests as Arrange-Act-Assert for clarity
- **3-Part Test Names**: "When [scenario], should [expected behavior]"
- **Unified Node Version**: Use .nvmrc or package.json engines field
- **Avoid Global Fixtures**: Add test data per-test for isolation
- **Test Coverage**: Monitor coverage to identify untested code paths
- **Mock External Services**: Isolate tests from external dependencies
- **Test 5 Outcomes**: Right data, right errors, edge cases, performance, security

**Example:**
```javascript
describe('Customer classifier', () => {
  test('When customer spent more than 500$, should be classified as premium', () => {
    // Arrange
    const customer = { spent: 505, joined: new Date(), id: 1 };
    const DBStub = sinon.stub(dataAccess, 'getCustomer')
      .returns({ id: 1, classification: 'regular' });
    
    // Act
    const classification = customerClassifier.classifyCustomer(customer);
    
    // Assert
    expect(classification).toBe('premium');
  });
});
```

---

## 5. Production Practices (19 practices)

**Key Principles:**
- **Monitoring**: Track CPU, memory, response time, error rates, and uptime
- **Smart Logging**: Use structured logs with context (transaction IDs, user IDs)
- **Reverse Proxy**: Delegate SSL, gzip, rate limiting to nginx/HAProxy
- **Lock Dependencies**: Use package-lock.json and npm ci for reproducible builds
- **Process Management**: Use PM2, systemd, or Docker for process uptime
- **Utilize All CPUs**: Use cluster module or PM2 to leverage multi-core systems
- **Stateless Design**: Store session data externally (Redis, DB) for horizontal scaling
- **NODE_ENV=production**: Enable production optimizations
- **LTS Node Version**: Use Long-Term Support releases for stability
- **Log to stdout**: Let infrastructure handle log routing

**Example:**
```javascript
// Smart logging with context
logger.info('User login successful', {
  transactionId: req.id,
  userId: user.id,
  timestamp: new Date(),
  ip: req.ip
});

// Cluster for multi-core
if (cluster.isMaster) {
  const numCPUs = require('os').cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  app.listen(3000);
}
```

---

## 6. Security (27 practices)

**Key Principles:**
- **Linter Security Rules**: Use eslint-plugin-security to catch vulnerabilities
- **Rate Limiting**: Prevent brute-force attacks with express-rate-limit
- **Secret Management**: Never commit secrets; use environment variables or secret managers (Vault, AWS Secrets)
- **ORM/ODM Usage**: Prevent SQL/NoSQL injection with parameterized queries
- **Secure Headers**: Use Helmet.js to set security HTTP headers
- **Dependency Scanning**: Regularly run `npm audit` and use Snyk for vulnerability detection
- **Password Hashing**: Use bcrypt or scrypt (never plain text or weak hashing)
- **Input Validation**: Validate all incoming JSON with schemas (Joi, JSON Schema)
- **JWT Best Practices**: Support token blocklisting and set expiration
- **Avoid eval()**: Never use eval, Function constructor, or dynamic requires
- **Regex DoS Prevention**: Validate regex patterns to prevent catastrophic backtracking
- **Run as Non-Root**: Always run Node processes with limited privileges
- **Limit Payload Size**: Prevent DoS by limiting request body size
- **2FA for npm**: Enable two-factor authentication for package publishing
- **Use node: Protocol**: Import built-in modules with `node:` prefix (e.g., `node:fs`)

**Example:**
```javascript
// Input validation with Joi
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  age: Joi.number().integer().min(18).max(120)
});

app.post('/users', (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) return res.status(400).send(error.details);
  // Process validated data
});

// Password hashing with bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, saltRounds);
}

// Secure headers with Helmet
const helmet = require('helmet');
app.use(helmet());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

---

## 7. Performance (2 practices)

**Key Principles:**
- **Don't Block Event Loop**: Avoid CPU-intensive operations in the main thread
- **Native Methods**: Prefer native JavaScript methods over utility libraries (Lodash) when possible

**Example:**
```javascript
// Bad - Blocking the event loop
function processLargeArray(arr) {
  for (let i = 0; i < 1000000; i++) {
    // Heavy computation
  }
}

// Good - Use Worker Threads for CPU-intensive tasks
const { Worker } = require('worker_threads');

function processLargeArray(arr) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', { workerData: arr });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

// Prefer native methods
// Instead of: _.map(array, item => item.value)
const values = array.map(item => item.value);
```

---

## 8. Docker Best Practices (15 practices)

**Key Principles:**
- **Multi-Stage Builds**: Create smaller, more secure images by separating build and runtime
- **Use node Command**: Start with `CMD ["node", "server.js"]` not `npm start`
- **Docker Handles Uptime**: Let orchestration tools manage restarts, not PM2 in containers
- **.dockerignore**: Prevent leaking secrets and reduce image size
- **Clean Dependencies**: Run `npm ci --production` and clean cache
- **Graceful Shutdown**: Handle SIGTERM signals properly
- **Memory Limits**: Set both Docker and V8 memory limits
- **Efficient Caching**: Order Dockerfile commands to maximize layer caching
- **Explicit Image Tags**: Never use `latest` tag in production
- **Smaller Base Images**: Use Alpine or slim variants (node:18-alpine)
- **No Build Secrets**: Use multi-stage builds to avoid secrets in final image
- **Scan Images**: Use Docker scan or Snyk to detect vulnerabilities
- **Lint Dockerfile**: Use hadolint to validate Dockerfile best practices

**Example:**
```dockerfile
# Multi-stage build
FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production && npm cache clean --force

FROM node:18-alpine
WORKDIR /usr/src/app

# Run as non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

COPY --from=build --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Set memory limit
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Use node directly, not npm
CMD ["node", "server.js"]
```

---

## Summary Statistics

- **Total Best Practices**: 102+
- **Major Categories**: 8
- **Updated for**: Node.js 22.0.0
- **Last Updated**: January 2024

## Quick Start Checklist

✅ Structure code by business components, not technical layers
✅ Use async/await with proper error handling
✅ Configure ESLint + Prettier for code quality
✅ Write API tests with AAA pattern
✅ Set up monitoring and structured logging
✅ Scan dependencies regularly with npm audit
✅ Validate all inputs with schemas
✅ Use Docker multi-stage builds
✅ Set NODE_ENV=production
✅ Run as non-root user

---

**For detailed information on each practice, refer to the full documentation in the `/sections` directory.**


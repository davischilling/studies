# Error Handling

### 1. Operational vs Programmer Errors

**Explanation:**
**Operational errors**: Expected errors during normal operation (network failures, invalid input, file not found)
**Programmer errors**: Bugs in code (undefined variable, wrong type, logic errors)

**How to handle**:
- **Operational**: Catch, log, respond gracefully
- **Programmer**: Fix the bug, crash and restart if necessary

**Exercise:**
```javascript
// Operational errors (handle gracefully)
class OperationalError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'OperationalError';
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Examples of operational errors:
async function getUser(id) {
  const user = await db.findUser(id);

  if (!user) {
    throw new OperationalError('User not found', 404);
  }

  return user;
}

async function connectToDatabase() {
  try {
    await db.connect();
  } catch (err) {
    throw new OperationalError('Database connection failed', 503);
  }
}

// Programmer errors (should crash)
function calculateTotal(items) {
  // Programmer error: forgot to check if items is array
  return items.reduce((sum, item) => sum + item.price, 0);
  // If items is undefined → crash!
}

// Correct version:
function calculateTotal(items) {
  if (!Array.isArray(items)) {
    throw new TypeError('items must be an array'); // Programmer error
  }
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Error handler middleware
app.use((err, req, res, next) => {
  // Log all errors
  logger.error(err);

  // Operational error: send to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode
      }
    });
  }

  // Programmer error: don't leak details
  res.status(500).json({
    error: {
      message: 'Internal server error',
      statusCode: 500
    }
  });

  // In production: crash and let process manager restart
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// 2. Distinguish errors in practice
function isOperationalError(error) {
  if (error.isOperational) {
    return true;
  }

  // Common operational error types
  const operationalErrors = [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNRESET'
  ];

  return operationalErrors.includes(error.code);
}

// 3. Handle different error types
async function handleRequest(req, res) {
  try {
    const result = await processRequest(req);
    res.json(result);
  } catch (err) {
    if (isOperationalError(err)) {
      // Log and respond
      logger.warn('Operational error', { error: err.message });
      res.status(err.statusCode || 500).json({ error: err.message });
    } else {
      // Log, respond, and crash
      logger.error('Programmer error', { error: err.stack });
      res.status(500).json({ error: 'Internal server error' });
      process.exit(1);
    }
  }
}
```

---

### 2. Global Handlers (uncaughtException, unhandledRejection)

**Explanation:**
**uncaughtException**: Synchronous error not caught
**unhandledRejection**: Promise rejection not caught

**Best practice**: Log and exit gracefully

**Exercise:**
```javascript
// 1. Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.error(err.stack);

  // Log to external service
  logger.fatal('Uncaught exception', { error: err.stack });

  // Graceful shutdown
  process.exit(1);
});

// 2. Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);

  // Log to external service
  logger.fatal('Unhandled rejection', { reason, promise });

  // Graceful shutdown
  process.exit(1);
});

// 3. Proper error handling to avoid these
// Bad: Unhandled rejection
async function badExample() {
  await someAsyncOperation(); // If this throws, unhandled rejection!
}

// Good: Caught
async function goodExample() {
  try {
    await someAsyncOperation();
  } catch (err) {
    console.error('Error:', err);
  }
}

// 4. Global error handler with cleanup
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);

  try {
    // Close server
    await new Promise((resolve) => {
      server.close(resolve);
    });

    // Close database
    await db.close();

    // Flush logs
    await logger.flush();
  } catch (cleanupErr) {
    console.error('Cleanup error:', cleanupErr);
  } finally {
    process.exit(1);
  }
});

// 5. Warning handler
process.on('warning', (warning) => {
  console.warn('Warning:', warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});

// 6. Prevent crashes in development
if (process.env.NODE_ENV === 'development') {
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection (dev mode):', reason);
    // Don't exit in development
  });
}
```

---

### 3. Structured Errors with Codes

**Explanation:**
Use error codes for programmatic error handling.

**Benefits**:
- Clients can handle specific errors
- Easier internationalization
- Better logging/monitoring

**Exercise:**
```javascript
// 1. Define error codes
const ErrorCodes = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
};

// 2. Create structured error class
class AppError extends Error {
  constructor(code, message, statusCode = 500, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        details: this.details
      }
    };
  }
}

// 3. Create specific error classes
class UserNotFoundError extends AppError {
  constructor(userId) {
    super(
      ErrorCodes.USER_NOT_FOUND,
      'User not found',
      404,
      { userId }
    );
  }
}

class ValidationError extends AppError {
  constructor(errors) {
    super(
      ErrorCodes.VALIDATION_ERROR,
      'Validation failed',
      400,
      { errors }
    );
  }
}

class InsufficientPermissionsError extends AppError {
  constructor(requiredPermission) {
    super(
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      'Insufficient permissions',
      403,
      { requiredPermission }
    );
  }
}

// 4. Usage
async function getUser(id) {
  const user = await db.findUser(id);

  if (!user) {
    throw new UserNotFoundError(id);
  }

  return user;
}

function validateUser(data) {
  const errors = [];

  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  }

  if (!data.password || data.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
}

// 5. Error handler
app.use((err, req, res, next) => {
  // Log error
  logger.error('Error occurred', {
    code: err.code,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Send structured response
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Unknown error
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      statusCode: 500
    }
  });
});

// 6. Client-side handling
// Client can handle specific errors:
try {
  await api.getUser(123);
} catch (err) {
  if (err.code === 'USER_NOT_FOUND') {
    // Show "user not found" message
  } else if (err.code === 'INSUFFICIENT_PERMISSIONS') {
    // Redirect to login
  } else {
    // Show generic error
  }
}

// 7. Error factory
class ErrorFactory {
  static userNotFound(userId) {
    return new UserNotFoundError(userId);
  }

  static validation(errors) {
    return new ValidationError(errors);
  }

  static insufficientPermissions(permission) {
    return new InsufficientPermissionsError(permission);
  }
}

// Usage:
throw ErrorFactory.userNotFound(123);
```

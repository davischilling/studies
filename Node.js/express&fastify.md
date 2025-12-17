# Express / Fastify

### 1. frameworks Pattern

Express and Fastify are popular Node.js web frameworks for building APIs and web applications.

- **Express**: The most widely used Node.js framework. It’s minimal, flexible, and has a large ecosystem of middleware. Great for quick prototyping and production apps.

- **Fastify**: A newer framework focused on high performance and low overhead. It offers a similar API to Express but is optimized for speed, has built-in schema validation, and better TypeScript support.

Both help handle routing, middleware, and HTTP requests, but Fastify is generally faster and more modern.

---

### 2. Error Handling

**Best Practices for Error Handling in Express and Fastify:**

---

### Express

- **Use centralized error-handling middleware** (with 4 parameters: `err, req, res, next`) after all routes.
- **Distinguish operational vs. programming errors** (send safe messages for operational errors, generic for programming errors).
- **Log errors** for debugging and monitoring.
- **Handle async errors** by passing them to `next(err)` or using a wrapper like `catchAsync`.
- **Global handlers** for uncaught exceptions and unhandled promise rejections.

**Example:**
```javascript
app.use((err, req, res, next) => {
  // Log error
  console.error(err);

  // Operational error
  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Programming error
  res.status(500).json({ error: 'Internal server error' });
});
```

### 3. Request Validation

**Best Practices for Request Validation in Express and Fastify:**

---

### Express

- **Use validation middleware** (e.g., express-validator, Joi) to validate and sanitize input before your route logic.
- **Validate all user input**: body, query, params, and headers.
- **Return clear error messages** for invalid input, using a consistent error format.
- **Sanitize data** to prevent injection attacks (e.g., trim, escape, normalize).
- **Centralize validation logic** for maintainability (e.g., reusable validation functions or schemas).
- **Fail fast**: Stop processing and respond immediately if validation fails.

---

### Fastify

- **Leverage built-in JSON Schema validation** by defining schemas for request bodies, querystrings, params, and headers.
- **Define response schemas** to ensure consistent API responses and automatic serialization.
- **Keep schemas close to routes** for clarity and maintainability.
- **Use AJV custom keywords** for advanced validation needs.
- **Validation is automatic**: Fastify rejects invalid requests before your handler runs.

---

**General Tips:**
- Always validate and sanitize all incoming data.
- Use schemas for both validation and documentation (OpenAPI/Swagger).
- Provide helpful error responses, but avoid leaking sensitive details.
- Keep validation logic DRY and reusable.

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

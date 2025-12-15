# G2i Node.js Senior Interview Study Plan

---

## 📅 Day 1 — Advanced JavaScript Fundamentals

**Goal:** Refresh core JS knowledge that interviews test.

### Study

- Scope, closures, hoisting
- `this` binding rules (`call`, `apply`, `bind`)
- Prototypes & inheritance
- Destructuring, spread, rest
- Value vs reference
- Event loop basics

### Action

Solve 5 short JS exercises on Replit:

1. Implement `once(fn)`
2. Implement a custom `map`
3. Prototype-based inheritance example
4. Debounce (simple version)
5. Promise chaining example

**Final drill:**  
_Explain verbally:_  
> How does the event loop work in JavaScript?

---

## 📅 Day 2 — Asynchronous JavaScript (Deep Dive)

**Goal:** Master async flows — heavily tested at senior level.

### Study

- Promises (`resolve`, `reject`, `race`, `all`, `allSettled`)
- `async/await` mechanics
- Error propagation in Promises
- Microtasks vs macrotasks (very important)
- Common pitfalls (callbacks + promises mix)

### Action

Implement on Replit:

1. A custom Promise retry wrapper
2. A function that runs tasks in parallel with concurrency limits

**Final drill:**  
_Explain verbally:_  
> Why can an async function block the event loop even if it’s async?

---

## 📅 Day 3 — Node.js Core Architecture

**Goal:** Show senior-level understanding of Node internals.

### Study

- Node event loop in depth
- libuv overview
- Thread pool
- Why Node is single-threaded but can do parallel IO
- Common Node best practices

### Action

Implement:

1. A simple HTTP server using the `http` module
2. Log timestamps inside `setTimeout`, `setImmediate`, and `process.nextTick` to demonstrate event loop phases

**Final drill:**  
_Explain verbally:_  
> What are the differences between `setImmediate`, `nextTick`, and `setTimeout`?

---

## 📅 Day 4 — Streams, Buffers & Video Streaming Endpoint

**Goal:** Master the guaranteed interview question.

### Study

- Readable, Writable, Duplex, Transform streams
- Backpressure
- `fs.createReadStream`
- Buffer basics
- HTTP Range headers
- Status 206 Partial Content

### Action

On Replit or local:

1. Create an endpoint that streams a large video file
2. Support Range headers

Test with curl:
```sh
curl -H "Range: bytes=0-1024" http://localhost:3000/video
```

**Final drill (VERY IMPORTANT):**  
_Explain verbally:_  
> Describe how you would create a video streaming endpoint in Node.js.

---

## 📅 Day 5 — HTTP Standards, Networking & Architecture

**Goal:** Know enough HTTP to talk like a senior backend engineer.

### Study

- Request/response lifecycle
- Caching headers (`ETag`, `Cache-Control`)
- CORS
- Compression
- Chunked transfer encoding
- MIME types

### Action

- Review HTTP section on [DevDocs](https://devdocs.io/)
- Build:
    - A small server returning JSON, HTML, and a file stream

**Final drill:**  
_Explain verbally:_  
> How does HTTP Range work and why is it necessary for streaming?

---

## 📅 Day 6 — Databases (SQL + NoSQL fundamentals)

**Goal:** Be confident discussing DB design and performance.

### Study (Choose your primary DB)

**If SQL (Postgres/MySQL):**

- Indexes (B-tree, GIN, HASH)
- Joins
- Transactions
- ACID
- Query optimization
- Connection pooling

**If NoSQL (MongoDB):**

- Document modeling
- Aggregation pipeline
- Indexes
- When to use Mongo vs SQL

### Action

On Replit or local:

- Write 3 queries involving JOINs and indexing (Postgres)  
    **or**
- Write 3 aggregation pipelines (Mongo)

**Final drill:**  
_Explain verbally:_  
> How would you design a database for a video streaming platform?

---

## 📅 Day 7 — Node.js Best Practices & Production Experience

**Goal:** Demonstrate senior-level production experience.

### Study

From [node-best-practices](https://github.com/goldbergyoni/nodebestpractices):

- Error handling
- Logging
- Environment variables
- Config patterns
- Security practices
- Folder structure
- DTO/validation
- Dependency injection basics
- Avoiding event loop blocking

### Action

Refactor a small Node project applying:

- Layered architecture
- Centralized error handler
- Config module

**Final drill:**  
_Explain verbally:_  
> How do you ensure your Node.js application is production-ready?

---

## 📅 Day 8 — Testing, Debugging & Error Handling

**Goal:** Be confident with senior-level testing and debugging.

### Study

- Unit tests (Jest)
- Integration tests
- Mocking & stubbing
- Debugging with `node inspect`
- Memory leak debugging
- Common Node errors (`ENOTFOUND`, `ECONNRESET`, etc.)

### Action

Write:

- 2 unit tests
- 1 integration test for a DB query
- A test for a streaming endpoint (just basic)

**Final drill:**  
_Explain verbally:_  
> Difference between operational vs programmer errors in Node.js?

---

## 📅 Day 9 — Full Interview Mock & Review

**Goal:** Simulate the real interview.

### Full Mock

Practice answering out loud (timer: 20–30 min):

- Video streaming endpoint (MUST KNOW PERFECTLY)
- How does Node’s event loop work?
- How do you debug memory leaks?
- How do you prevent blocking the event loop?
- What are Node.js streams and why use them?
- Design a REST API for uploading large files.
- Difference between SQL and NoSQL?
- Describe an issue you solved in production.
- How do you handle concurrency problems in Node?

### Review

- Fix weak spots
- Prepare a short “experience intro”
- Make sure your Replit account is ready
- Test your camera/mic

---

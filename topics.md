# Senior-Level Interview Topics

---

## ✅ 1. JavaScript Topics

### Core Language

- **Scope, hoisting, TDZ**
- **var vs let vs const**
- **Closures and lexical scope**
- **Prototypes & inheritance**
- **Event loop & concurrency model**
    - Microtasks vs macrotasks
    - Call Stack, Queue, Job Queue
- **this binding rules**
- **Arrow functions vs function declarations**
- **Destructuring, spread, rest operators**
- **Pure functions and immutability**
- **Error handling**
    - try/catch, error objects, rethrowing
- **Deep vs shallow copy**
- **Value vs reference types**
- **Asynchronous JavaScript**
    - Promises
    - async/await
    - Promise chaining & error propagation
    - Race conditions & concurrency problems
    - Parallelism vs sequential async flows
    - Debouncing & throttling (conceptually)

### Advanced Concepts

- **Functional programming concepts**
    - Currying & composition
- **Generators & Iterators**
- **Symbols, Maps, Sets, WeakMap, WeakSet**
- **Event emitters** (Node side, but JS conceptually)
- **Memory leaks & debugging memory issues**

---

## ✅ 2. Node.js Topics

### Node.js Core Concepts

- **Event loop (deep understanding)**
- **libuv & thread pool**
- **Async IO handling**
- **Node.js architecture vs browsers**
- **Streams** (important for video streaming)
    - Readable / Writable
    - Duplex / Transform
    - Backpressure
- **Buffers**
- **Child processes & worker threads**
- **Node clustering**
- **Module system:** ESM vs CommonJS

### HTTP & Web Server Fundamentals

- **Creating HTTP servers with `http` module**
- **Request/response lifecycle**
- **Streaming responses**
- **Partial content responses**
    - Range headers
    - 206 Partial Content
    - Content-Length vs chunked transfer
- **Caching headers**
- **MIME types** (esp. video)
- **Security headers**

### Express / Fastify (or similar)

- **Middleware pattern**
- **Error handling**
- **Request validation**
- **Performance trade-offs**

### Best Practices ([node-best-practices](https://github.com/goldbergyoni/nodebestpractices))

- Folder structure patterns
- Dependency injection
- Environment variable management
- Logging best practices
- Graceful shutdown
- Avoiding callback hell
- Avoiding blocking the event loop
- Using async local storage & context propagation
- Testing strategies (unit, integration, e2e)

### Error Handling

- Operational vs programmer errors
- Global handlers (`uncaughtException`, `unhandledRejection`)
- Structured errors with codes

### Security

- OWASP basics
- Input validation
- Avoiding prototype pollution
- Rate limiting
- CORS
- Secure secrets management

### Performance & Optimization

- Profiling CPU & memory
- Identifying event loop blocking
- Caching layers (Redis, in-memory)
- Load balancing in Node

---

## ✅ 3. Video Streaming Endpoint (Guaranteed Question)

**You MUST understand:**

- Implementing a streaming endpoint
- Supporting Range requests
- Chunked responses vs full file reads
- Streams: `fs.createReadStream`
- When to return 206 Partial Content
- Handling large files efficiently
- Limitations (memory, concurrency bottlenecks)
- How CDNs help scale streaming

*You do not need to code it perfectly, but you must show senior-level architectural thinking.*

---

## ✅ 4. Databases

**Prepare for one primary database you know best.**

### General DB Topics

- ACID properties
- Indexing strategies
- Query optimization
- Transactions
- Normalization vs denormalization
- Connection pooling
- N+1 problems
- Data modeling
- Migrations

### SQL-Specific (Postgres/MySQL)

- JOIN types (INNER, LEFT, RIGHT)
- Index types (B-Tree, HASH, GIN, GiST)
- Upsert (`ON CONFLICT` / `INSERT ... ON DUPLICATE`)
- Common performance pitfalls
- Stored procedures vs application logic
- Isolation levels

### NoSQL (MongoDB)

- Document modeling
- Aggregation pipelines
- TTL indexes
- When to choose NoSQL vs SQL
- Sharding basics

### ORM/Query Builders

Be prepared to discuss one:

- Prisma
- Sequelize
- TypeORM
- Knex

Explain:

- Pros/cons
- Common pitfalls
- Migration workflow

---

## ✅ 5. Software Engineering / Back-End Concepts

### Architecture

- REST fundamentals
- RPC vs REST
- Microservices vs monoliths
- API versioning
- Message queues (Kafka, RabbitMQ, SQS)
- Caching strategies (Redis, CDN, memory)
- Rate limiting / throttling

### Testing

- Unit testing
- Integration testing
- E2E testing
- Mocking, stubbing, spying
- Jest / Mocha / Supertest basics

### CI/CD & DevOps Basics

- Git branching & PR workflows
- Docker basics
- GitHub Actions
- Environment promotion (dev → staging → production)

### Debugging

- Reading stack traces
- Common Node error messages
- Debugging memory leaks using Node inspector

---

## ✅ 6. Senior-Level Soft Skills

- Explaining a solution to another engineer
- Breaking down complex problems
- Proposing trade-offs ("X is simple but not scalable because…")
- Communicating limitations and mitigation strategies
- Thinking like a production engineer
- Experience working in remote teams (GitHub interaction)


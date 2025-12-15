# Flashcards — JavaScript Advanced (1–10)

Q1: What is the difference between microtasks and macrotasks?
A1: Microtasks (Promises, queueMicrotask) run immediately after the current call stack, before the event loop continues. Macrotasks (setTimeout, setImmediate) run on specific event loop phases. Microtasks run first and can starve the loop.

Q2: What is the difference between null and undefined?
A2: undefined means “not assigned yet”; null means “intentionally empty”. Use undefined for “no value provided”, null for “intentionally empty”.

Q3: Explain closures with a practical example.
A3: A closure occurs when an inner function retains access to outer scope variables after the outer function returns. Example: a function that generates a rate limiter.

Q4: What is a pure function, and why is it useful?
A4: A function with no side effects that returns the same output for the same input. Useful for predictability, testing, and functional programming.

Q5: What is event delegation in JavaScript?
A5: Attaching one event listener to a parent to handle events from children via bubbling. Improves performance and memory usage.

Q6: What’s the difference between == and ===?
A6: === compares without coercion; == coerces types before comparing. Prefer === to avoid hidden conversions.

Q7: What is a generator function and when would you use one?
A7: A generator (function*) yields values lazily. Useful for large datasets, streams, or controlled async flows.

Q8: Explain the module systems: CommonJS vs ES Modules.
A8: CommonJS uses require, synchronous, Node-specific. ESM uses import/export, async, standardized, supports tree-shaking.

Q9: What is tail-call optimization?
A9: Reusing stack frames for tail-recursive calls to prevent stack overflow. Rarely applied in JS engines.

Q10: How does prototypal inheritance work?
A10: Objects inherit directly from other objects via [[Prototype]] chain, enabling shared methods without classical classes.

🟦 Flashcards — Node.js Core (11–20)

Q11: Explain Node’s event loop in simple terms.
A11: Schedules JS execution and async callbacks. Async tasks are offloaded to libuv threads and callbacks queued for execution.

Q12: What is backpressure in Node streams?
A12: When a consumer can’t keep up with producer data. Streams handle it via the write() return value and the drain event.

Q13: How do you prevent blocking the event loop?
A13: Use worker threads, break long loops, streaming, or offload CPU-heavy tasks to background processes.

Q14: Difference between process.nextTick() and setImmediate()?
A14: nextTick runs before the event loop continues, setImmediate runs after the poll phase. nextTick can starve the loop.

Q15: What is the libuv thread pool used for?
A15: Handles file I/O, DNS, crypto, compression, CPU-heavy tasks not natively async.

Q16: Explain Node.js clustering.
A16: Multiple Node processes share a single port to leverage multiple CPU cores. Often used with PM2.

Q17: How would you secure sensitive environment variables?
A17: Use .env files excluded from git, secret managers (AWS Vault), or Kubernetes secrets. Never store them in code.

Q18: How do you handle unhandled promise rejections?
A18: Use process.on('unhandledRejection', handler) to log, alert, and gracefully shut down.

Q19: How do you debug a memory leak in Node?
A19: Use --inspect + Chrome DevTools, take heap snapshots, identify growing objects, fix references or event listeners.

Q20: How do you stream a video file in Node.js?
A20: Support Range headers, return 206 Partial Content, use fs.createReadStream with start/end bytes, handle errors.

🟦 Flashcards — HTTP & APIs (21–30)

Q21: What is the purpose of HTTP Range headers?
A21: Allow clients to request partial content, enabling seeking and efficient streaming.

Q22: Difference between HTTP 301 and 302?
A22: 301 = permanent redirect, caches aggressively. 302 = temporary redirect, re-request next time.

Q23: Explain CORS.
A23: Cross-Origin Resource Sharing controls which origins can access a server via headers like Access-Control-Allow-Origin.

Q24: What is idempotency, and why is it important?
A24: An operation producing the same result no matter how many times it runs. Ensures safe retries, e.g., PUT requests.

Q25: Difference between REST and GraphQL?
A25: REST exposes multiple endpoints per resource. GraphQL exposes a single endpoint with flexible queries, reducing over-fetching.

Q26: What is HATEOAS?
A26: Hypermedia links in responses guide clients through API resources, making REST more discoverable.

Q27: Explain what a reverse proxy does.
A27: Sits in front of apps for routing, caching, SSL termination, load balancing, rate limiting.

Q28: What is ETag and how does it improve performance?
A28: Hash of file content. If unchanged, server returns 304 Not Modified, saving bandwidth.

Q29: Difference between TCP and UDP?
A29: TCP = reliable, ordered, connection-oriented. UDP = fast, connectionless, used for real-time apps.

Q30: What is chunked transfer encoding?
A30: Server sends response in chunks before knowing total size. Useful for streaming.

🟦 Flashcards — Databases (31–40)

Q31: What is an index and why use one?
A31: Speeds lookups, avoids full scans. Slows writes and uses memory.

Q32: What is a transaction?
A32: A set of operations that are atomic, consistent, isolated, durable (ACID).

Q33: What is the N+1 problem?
A33: One query plus one query per row. Fix with JOINs, eager loading, batching.

Q34: What is a deadlock in databases?
A34: Two transactions wait for each other’s locks. Fix by ordering locks consistently or retrying.

Q35: When use SQL vs NoSQL?
A35: SQL = structured, strong consistency, complex queries. NoSQL = flexible schema, high write volume, distributed.

Q36: How do you optimize a slow SQL query?
A36: Indexes, analyze query plan, avoid SELECT *, proper joins, caching, table partitioning.

Q37: What are MongoDB aggregation pipelines?
A37: Sequence of stages (match, group, project, unwind) to transform data, similar to SQL GROUP BY.

Q38: Explain database normalization.
A38: Organize tables to reduce redundancy and anomalies; ensures consistency.

Q39: Explain eventual consistency.
A39: In distributed systems, replicas may be temporarily inconsistent but will converge eventually.

Q40: How do you design a database for a video streaming platform?
A40: SQL for metadata, NoSQL/object storage for video chunks, CDN for delivery, indexes on tags/popularity, pre-signed URLs for security.

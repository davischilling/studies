✅ 40 Senior-Level Backend Interview Questions (With Perfect Answers)

(20 new + the original 20 = full set of 40)

🟦 SECTION 1 — JavaScript (Advanced)
1. What is the difference between microtasks and macrotasks?

Perfect Answer:
Microtasks (Promises, queueMicrotask) run after the current stack and before the event loop continues.
Macrotasks (setTimeout, setImmediate) run in specific event loop phases.
Microtasks run first and can starve the loop if misused.

2. What is the difference between null and undefined?

Perfect Answer:
undefined = not assigned yet.
null = intentionally empty.
Use undefined for “no value provided” and null for “purposefully empty”.

3. Explain closures with a practical example.

Perfect Answer:
A closure occurs when an inner function retains access to outer scope variables even after the outer function has returned — useful for things like rate limiters or module patterns.

4. What is a pure function, and why is it useful?

Perfect Answer:
A pure function has no side effects and returns the same output for the same input.
Useful for predictable code, testing, and functional programming.

5. What is event delegation in JavaScript?

Perfect Answer:
Attaching one event listener to a parent element to handle events from its children using bubbling.
It improves performance and reduces memory usage.

6. What’s the difference between == and ===?

Perfect Answer:
=== compares without coercion.
== coerces types before comparing.
Prefer === to avoid hidden conversions.

7. What is a generator function and when would you use one?

Perfect Answer:
A generator (function*) yields values lazily.
Good for iterating through large data sets, streams, or controlling async flow (e.g., co library style).

8. Explain the module systems: CommonJS vs ES Modules.

Perfect Answer:
CommonJS uses require, synchronous, Node-specific.
ESM uses import/export, async, standardized (It works natively in browsers and modern JavaScript environments, not just Node.js), supports tree-shaking.

9. How does prototypal inheritance work?

Perfect Answer:
Prototypal inheritance means objects inherit properties and methods directly from other objects through the Prototype chain, which enables shared behavior, efficient memory usage, and flexible object composition—without needing classical classes.

🟦 SECTION 2 — Node.js Core
10. Explain Node’s event loop in simple terms.

Perfect Answer:
The event loop schedules JS execution and processes callbacks.
Async operations are offloaded to libuv threads and completed callbacks are queued back to the loop.

11. What is backpressure in Node streams?

Perfect Answer:
It’s when a consumer can’t process data as fast as the producer emits it.
Streams handle this automatically using the return value of write() and the drain event.

12. How do you prevent blocking the event loop?

Perfect Answer:
Use worker threads, break long loops, use streaming, or offload CPU-heavy tasks to background processes.

13. Difference between process.nextTick() and setImmediate()?

Perfect Answer:
nextTick runs before the event loop continues;
setImmediate runs after the poll phase.
nextTick can starve the loop.

14. What is libuv and what does it do?

Perfect Answer:
libuv is a multi-platform C library that provides Node.js with an event-driven, asynchronous I/O model. It handles low-level tasks like:

- Handle the event loop
- Asynchronous file and network
- Manages Thread pool
- Cross-platform abstractions (works on Linux, macOS, Windows)
In short, libuv powers Node.js’s non-blocking I/O and event loop, enabling high concurrency and performance.

15. What is the libuv thread pool used for?

Perfect Answer:
Handles filesystem I/O, DNS, crypto, compression, and any CPU-heavy tasks not handled by the OS async APIs.

16. Explain Node.js clustering.

Perfect Answer:
Node.js clusters are implemented using the built-in `cluster` module. Clustering allows you to start multiple Node.js processes (workers) that share the same server port, enabling better CPU utilization on multi-core systems. Best combined with a process manager (PM2).

17. How would you secure sensitive environment variables?

Perfect Answer:
Store them in:

.env files not committed to git

Secret managers (AWS Secrets Manager, Vault)

Kubernetes secrets
Never store them in code.

18. How do you handle unhandled promise rejections?

Perfect Answer:
Attach a global handler:
process.on('unhandledRejection', handler)
Then log, alert, and gracefully shut down.

19. How do you debug a memory leak in Node?

Perfect Answer:
Use --inspect + Chrome DevTools → take heap snapshots → compare → identify growing objects → fix references, event listeners, closures.

20. How do you stream a video file in Node.js?

Perfect Answer:
Support Range headers, return 206 Partial Content, parse ranges, and stream with fs.createReadStream using start/end byte offsets.

🟦 SECTION 3 — HTTP, Networking & APIs
21. What is the purpose of HTTP Range headers?

Perfect Answer:
They allow clients to request partial content, enabling seeking and efficient streaming for large files like videos.

22. What’s the difference between HTTP 301 and 302?

Perfect Answer:
301 = permanent redirect (caches aggressively).
302 = temporary redirect (client should re-request next time).

23. Explain CORS.

Perfect Answer:
CORS controls which origins can access a server.
Set appropriate headers: Access-Control-Allow-Origin, Methods, Headers.

24. What is idempotency, and why is it important?

Perfect Answer:
An idempotent operation yields the same result no matter how many times you call it.
Important for retry logic and safe API design (e.g., PUT is idempotent).

25. Explain the difference between REST and GraphQL.

Perfect Answer:
REST exposes resources via multiple endpoints.
GraphQL exposes a single endpoint that supports precise data fetching and reduces over-fetching.

26. What is HATEOAS?

Perfect Answer:
Hypermedia links embedded in responses that guide clients through the API.
It makes REST APIs more discoverable.

27. Explain what a reverse proxy does.

Perfect Answer:
It sits in front of an application to handle routing, caching, SSL termination, load balancing, and rate limiting.

28. What is ETag and how does it improve performance?

Perfect Answer:
An ETag is a hash representing file content.
If unchanged, the server returns 304 Not Modified, saving bandwidth.

29. Difference between TCP and UDP?

Perfect Answer:
TCP is reliable, ordered, connection-oriented.
UDP is fast, connectionless, best for real-time applications like streaming or games.

30. What is chunked transfer encoding?

Perfect Answer:
The server sends data in chunks before knowing the total size.
Useful for streaming responses and long-polling.

🟦 SECTION 4 — Databases (SQL/NoSQL)
31. What is an index and why use one?

Perfect Answer:
Indexes speed up lookups by avoiding full-table scans.
Tradeoff: slower writes and more memory usage.

32. What is a transaction?

Perfect Answer:
A set of operations guaranteed to be atomic, consistent, isolated, and durable (ACID).

33. What is the N+1 problem?

Perfect Answer:
One main query followed by 1 additional query per record.
Fix with JOINs, eager loading, or batching.

34. What is a deadlock in databases?

Perfect Answer:
Two transactions wait for each other’s locks.
Resolve by ordering locks consistently or using retry logic.

35. When use SQL vs NoSQL?

Perfect Answer:
SQL → structured data, strong consistency, complex queries.
NoSQL → flexible schema, horizontal scaling, high write volume.

36. How do you optimize a slow SQL query?

Perfect Answer:

Add indexes

Analyze query plan

Avoid SELECT *

Use proper joins

Use caching

Partition large tables

37. What are MongoDB aggregation pipelines?

Perfect Answer:
A sequence of stages (match, group, project, unwind) to transform large datasets similar to SQL’s GROUP BY + SELECT.

38. Explain database normalization.

Perfect Answer:
Organizing data into separate tables to reduce redundancy and prevent anomalies.
Use when consistency matters.

39. Explain eventual consistency.

Perfect Answer:
In distributed systems, replicas may not be immediately in sync.
They become consistent eventually.
Common in DynamoDB, Cassandra, and other NoSQL DBs.

40. How do you design a database for a video streaming platform?

Perfect Answer:

SQL for metadata: videos, users, permissions

NoSQL or object storage for video chunks

Index on popularity, tags

CDN for global delivery

Pre-signed URLs for secure access
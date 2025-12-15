# Asynchronous JavaScript

### 1. Promises

**Explanation:**
A **Promise** is an object representing the eventual completion or failure of an asynchronous operation. It has three states:
- **Pending**: Initial state, neither fulfilled nor rejected
- **Fulfilled**: Operation completed successfully (resolved)
- **Rejected**: Operation failed

**Methods**:
- `.then(onFulfilled, onRejected)`: Handles success/failure
- `.catch(onRejected)`: Handles errors
- `.finally(onFinally)`: Executes regardless of outcome

**Static methods**:
- `Promise.resolve(value)`: Returns a fulfilled promise
- `Promise.reject(reason)`: Returns a rejected promise
- `Promise.all(promises)`: Waits for all to fulfill (or any to reject)
- `Promise.race(promises)`: Resolves/rejects with first settled promise
- `Promise.allSettled(promises)`: Waits for all to settle
- `Promise.any(promises)`: Resolves with first fulfilled promise

**Exercise:**
```javascript
// 1. Create a promise that simulates fetching user data
function fetchUser(userId) {
  // Return a promise that:
  // - Resolves after 1 second with user object if userId > 0
  // - Rejects with error if userId <= 0
}

// 2. Implement Promise.all manually
function myPromiseAll(promises) {
  // Your code here
}

// 3. Create a timeout wrapper for promises
function withTimeout(promise, ms) {
  // Return a promise that:
  // - Resolves/rejects with the original promise if it settles in time
  // - Rejects with 'Timeout' error if it takes longer than ms
}

// Test:
const slowPromise = new Promise(resolve => setTimeout(() => resolve('Done'), 2000));
withTimeout(slowPromise, 1000).catch(err => console.log(err)); // Should timeout

// 4. Implement a retry mechanism
async function retry(fn, maxAttempts, delay) {
  // Try to execute fn up to maxAttempts times
  // Wait delay ms between attempts
  // Return result if successful, throw last error if all attempts fail
}
```

---

### 2. async/await

**Explanation:**
**async/await** is syntactic sugar over Promises, making asynchronous code look and behave more like synchronous code.

**async functions**:
- Always return a Promise
- Allow use of `await` inside them
- Automatically wrap return values in `Promise.resolve()`

**await**:
- Pauses execution until the Promise settles
- Returns the fulfilled value or throws the rejected reason
- Can only be used inside async functions (or top-level in modules)

**Error handling**: Use try/catch blocks with async/await

**Exercise:**
```javascript
// 1. Convert this Promise chain to async/await
function getUserData(userId) {
  return fetchUser(userId)
    .then(user => fetchPosts(user.id))
    .then(posts => fetchComments(posts[0].id))
    .then(comments => {
      return { user, posts, comments };
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
}

// Your async/await version:
async function getUserDataAsync(userId) {
  // Your code here
}

// 2. Handle multiple independent async operations efficiently
async function loadDashboard(userId) {
  // Fetch user, posts, and notifications concurrently
  // They don't depend on each other
  // Return an object with all three
}

// 3. Implement async forEach
async function asyncForEach(array, callback) {
  // Execute callback for each element sequentially
  // Wait for each callback to complete before moving to next
}

// Test:
const urls = ['url1', 'url2', 'url3'];
await asyncForEach(urls, async (url) => {
  const data = await fetch(url);
  console.log(data);
});
```

---

### 3. Promise Chaining & Error Propagation

**Explanation:**
**Promise chaining**: Each `.then()` returns a new Promise, allowing sequential async operations.
```javascript
promise
  .then(result => transform(result))
  .then(transformed => save(transformed))
  .then(saved => notify(saved));
```

**Error propagation**: Errors bubble down the chain until caught. A single `.catch()` can handle errors from any previous step.
```javascript
promise
  .then(step1)
  .then(step2)
  .catch(handleError); // Catches errors from promise, step1, or step2
```

**Key points**:
- Always return values from `.then()` to pass them down the chain
- Errors skip `.then()` handlers and go to the next `.catch()`
- `.catch()` can recover from errors by returning a value
- Unhandled rejections can crash Node.js or trigger browser warnings

**Exercise:**
```javascript
// 1. Fix this broken promise chain
function processOrder(orderId) {
  fetchOrder(orderId)
    .then(order => {
      validateOrder(order);
      // Missing return!
    })
    .then(validOrder => {
      calculateTotal(validOrder);
    })
    .then(total => {
      console.log('Total:', total); // total is undefined!
    });
}

// 2. Implement proper error handling with recovery
async function robustFetch(url, retries = 3) {
  // Try to fetch from url
  // If it fails, try backup URL
  // If backup fails, return cached data
  // If no cached data, throw error
  // Log each attempt
}

// 3. Create a pipeline function
function pipeline(...fns) {
  // Return a function that takes an initial value
  // and passes it through all functions in sequence
  // Each function can return a value or a Promise
  // Example: pipeline(fn1, fn2, fn3)(initialValue)
}

// Test:
const process = pipeline(
  x => x + 1,
  x => Promise.resolve(x * 2),
  x => x - 3
);
process(5).then(console.log); // Should log 9: ((5+1)*2)-3
```

---

### 4. Race Conditions & Concurrency Problems

**Explanation:**
**Race conditions** occur when the outcome depends on the timing or order of uncontrollable events. In JavaScript, this commonly happens with:
- Multiple async operations modifying shared state
- User interactions triggering overlapping async operations
- Stale closures capturing outdated values

**Common problems**:
- **Stale data**: Using outdated values from closures
- **Duplicate requests**: Same operation triggered multiple times
- **Out-of-order responses**: Later request completes before earlier one
- **State inconsistency**: Concurrent updates to shared state

**Solutions**:
- Request cancellation/abortion
- Request deduplication
- Sequence numbers/timestamps
- Locks/semaphores
- Debouncing/throttling

**Exercise:**
```javascript
// 1. Identify and fix the race condition
let currentUser = null;

async function loadUser(userId) {
  const user = await fetchUser(userId);
  currentUser = user; // Problem: what if another loadUser() was called?
  displayUser(currentUser);
}

// User clicks rapidly between profiles
loadUser(1);
loadUser(2);
loadUser(3);
// Which user gets displayed?

// 2. Implement a request deduplicator
function createDeduplicator() {
  // Return a function that:
  // - Takes a key and a promise-returning function
  // - If the same key is requested while pending, return the same promise
  // - Once resolved/rejected, allow new requests for that key
}

const dedupe = createDeduplicator();
dedupe('user:1', () => fetchUser(1)); // Makes request
dedupe('user:1', () => fetchUser(1)); // Returns same promise, no new request

// 3. Implement a "latest only" wrapper
function latest(asyncFn) {
  // Return a wrapped version that:
  // - Only processes the result of the most recent call
  // - Ignores results from earlier calls that complete later
}

const searchLatest = latest(searchAPI);
searchLatest('a'); // Ignored if next call completes first
searchLatest('ab'); // Ignored if next call completes first
searchLatest('abc'); // Only this result is used

// 4. Fix this shopping cart race condition
let cart = [];

async function addToCart(item) {
  const currentCart = [...cart];
  await validateItem(item); // Async validation
  cart = [...currentCart, item]; // Problem: cart might have changed!
}
```

---

### 5. Parallelism vs Sequential Async Flows

**Explanation:**
**Sequential execution**: Operations run one after another. Use when operations depend on previous results.
```javascript
const a = await fetchA();
const b = await fetchB(a); // Depends on a
const c = await fetchC(b); // Depends on b
```

**Parallel execution**: Operations run simultaneously. Use when operations are independent.
```javascript
const [a, b, c] = await Promise.all([
  fetchA(),
  fetchB(),
  fetchC()
]);
```

**Controlled concurrency**: Limit number of simultaneous operations (e.g., max 3 concurrent requests).

**Trade-offs**:
- Parallel: Faster but uses more resources, harder to debug
- Sequential: Slower but more predictable, easier to reason about
- Controlled: Balance between speed and resource usage

**Exercise:**
```javascript
// 1. Optimize this code - which operations can be parallelized?
async function loadPage(userId) {
  const user = await fetchUser(userId);
  const posts = await fetchPosts(userId);
  const friends = await fetchFriends(userId);
  const notifications = await fetchNotifications(userId);
  const settings = await fetchSettings(userId);

  return { user, posts, friends, notifications, settings };
}

// 2. Implement Promise.all manually
function myPromiseAll(promises) {
  // Your code here
}

// 3. Implement controlled concurrency
async function mapWithConcurrency(items, asyncFn, concurrency) {
  // Process items with asyncFn
  // But only run 'concurrency' operations at a time
  // Return results in original order
}

// Test:
const urls = Array.from({ length: 100 }, (_, i) => `url${i}`);
const results = await mapWithConcurrency(urls, fetch, 5); // Max 5 concurrent

// 4. Implement a task queue
class TaskQueue {
  constructor(concurrency) {
    // Your code here
  }

  async add(asyncFn) {
    // Add task to queue
    // Execute when slot available
    // Return result
  }
}

const queue = new TaskQueue(3);
queue.add(() => fetchUser(1));
queue.add(() => fetchUser(2));
queue.add(() => fetchUser(3));
queue.add(() => fetchUser(4)); // Waits for a slot
```

---

### 6. Debouncing & Throttling (Conceptually)

**Explanation:**
**Debouncing**: Delays execution until after a period of inactivity. Useful for search inputs, window resize.
- Waits for user to stop typing before executing
- Cancels previous timer on each new event
- Only the last call executes

**Throttling**: Limits execution to once per time period. Useful for scroll handlers, mouse movement.
- Executes immediately, then blocks for a period
- Ensures function runs at most once per interval
- First or last call executes (depending on implementation)

**Use cases**:
- Debounce: Search autocomplete, form validation, save draft
- Throttle: Scroll events, mouse tracking, API rate limiting

**Exercise:**
```javascript
// 1. Implement debounce
function debounce(fn, delay) {
  // Return a debounced version of fn
  // Should wait 'delay' ms after last call before executing
  // Should pass correct arguments and context
}

// Test:
const debouncedSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 500);

debouncedSearch('a');
debouncedSearch('ab');
debouncedSearch('abc'); // Only this executes (after 500ms)

// 2. Implement throttle
function throttle(fn, interval) {
  // Return a throttled version of fn
  // Should execute at most once per 'interval' ms
  // First call executes immediately
}

// Test:
const throttledScroll = throttle(() => {
  console.log('Scroll handler');
}, 1000);

// Rapid calls
throttledScroll(); // Executes
throttledScroll(); // Ignored
throttledScroll(); // Ignored
// ... wait 1000ms ...
throttledScroll(); // Executes

// 3. Implement debounce with leading edge option
function debounceAdvanced(fn, delay, leading = false) {
  // If leading=true, execute immediately then wait
  // If leading=false, wait then execute (standard debounce)
}

// 4. Create a practical example
// Implement a search input handler that:
// - Debounces user input (300ms)
// - Shows loading state
// - Cancels previous requests if new search starts
// - Handles errors gracefully

class SearchHandler {
  constructor(searchFn, delay = 300) {
    // Your code here
  }

  handleInput(query) {
    // Your code here
  }
}
```

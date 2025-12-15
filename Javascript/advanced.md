# Advanced Concepts

### 1. Functional Programming Concepts

**Explanation:**
**Functional Programming (FP)** is a paradigm that treats computation as the evaluation of mathematical functions and avoids changing state and mutable data.

**Core principles**:
- **Pure functions**: No side effects, same input → same output
- **Immutability**: Data cannot be changed after creation
- **First-class functions**: Functions are values (can be passed, returned, assigned)
- **Higher-order functions**: Functions that take or return functions
- **Function composition**: Combining simple functions to build complex ones
- **Declarative style**: Describe what to do, not how to do it

**Benefits**: Predictable, testable, parallelizable, easier to reason about

**Common FP patterns**: map, filter, reduce, compose, pipe, curry

**Exercise:**
```javascript
// 1. Refactor this imperative code to functional style
function processUsers(users) {
  const result = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].age >= 18) {
      const user = {
        name: users[i].name.toUpperCase(),
        age: users[i].age
      };
      result.push(user);
    }
  }
  return result;
}

// Your functional version using map, filter, etc.

// 2. Implement common FP utilities
const map = (fn) => (array) => {
  // Your code here
};

const filter = (predicate) => (array) => {
  // Your code here
};

const reduce = (fn, initial) => (array) => {
  // Your code here
};

// 3. Use these to solve: Get total age of adult users
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 17 },
  { name: 'Charlie', age: 30 }
];

// Your solution using composed functions

// 4. Implement pipe and compose
const pipe = (...fns) => {
  // Execute functions left to right
};

const compose = (...fns) => {
  // Execute functions right to left
};

// Test:
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

pipe(addOne, double, square)(2); // ((2+1)*2)^2 = 36
compose(square, double, addOne)(2); // ((2+1)*2)^2 = 36
```

---

### 2. Currying & Composition

**Explanation:**
**Currying**: Transforming a function that takes multiple arguments into a sequence of functions that each take a single argument.
```javascript
// Normal function
const add = (a, b, c) => a + b + c;

// Curried version
const addCurried = a => b => c => a + b + c;
addCurried(1)(2)(3); // 6
```

**Benefits**:
- Partial application: Create specialized functions
- Better reusability and composition
- Delayed execution

**Composition**: Combining simple functions to create more complex ones.
```javascript
const composed = compose(fn3, fn2, fn1);
composed(x); // fn3(fn2(fn1(x)))
```

**Exercise:**
```javascript
// 1. Implement a curry function
function curry(fn) {
  // Return a curried version of fn
  // Should work for any number of arguments
  // Should execute when all arguments are provided
}

// Test:
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6
curriedAdd(1)(2, 3); // 6

// 2. Create practical curried functions
const multiply = curry((a, b) => a * b);
const double = multiply(2);
const triple = multiply(3);

const map = curry((fn, array) => array.map(fn));
const doubleAll = map(double);
doubleAll([1, 2, 3]); // [2, 4, 6]

// 3. Implement compose and pipe
const compose = (...fns) => {
  // Your code here
};

const pipe = (...fns) => {
  // Your code here
};

// 4. Build a data processing pipeline
// Given an array of users, create a pipeline that:
// - Filters adults (age >= 18)
// - Maps to full names (firstName + lastName)
// - Sorts alphabetically
// - Takes first 5

const users = [
  { firstName: 'John', lastName: 'Doe', age: 25 },
  { firstName: 'Jane', lastName: 'Smith', age: 17 },
  // ... more users
];

// Your solution using curry, compose/pipe
```

---

### 3. Generators & Iterators

**Explanation:**
**Iterators**: Objects that implement the iterator protocol (have a `next()` method returning `{value, done}`).

**Iterables**: Objects that implement the iterable protocol (have a `[Symbol.iterator]()` method that returns an iterator).

**Generators**: Special functions (declared with `function*`) that can pause execution and resume later using `yield`.
```javascript
function* generator() {
  yield 1;
  yield 2;
  yield 3;
}
```

**Benefits**:
- Lazy evaluation: Generate values on demand
- Memory efficient: Don't need to store entire sequence
- Infinite sequences: Can represent infinite data
- Stateful iteration: Maintain state between yields

**Use cases**: Pagination, infinite scrolling, data streaming, custom iteration logic

**Exercise:**
```javascript
// 1. Create a custom iterator
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    // Return an iterator object with next() method
    // Should iterate from 'from' to 'to'
  }
};

for (let num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}

// 2. Implement the same using a generator
function* rangeGenerator(from, to) {
  // Your code here
}

// 3. Create an infinite sequence generator
function* fibonacci() {
  // Generate infinite Fibonacci sequence
  // 0, 1, 1, 2, 3, 5, 8, 13, ...
}

const fib = fibonacci();
fib.next().value; // 0
fib.next().value; // 1
fib.next().value; // 1
fib.next().value; // 2

// 4. Implement generator-based async iteration
async function* fetchPages(url) {
  // Fetch paginated data
  // Yield each page
  // Stop when no more pages
  let page = 1;
  // Your code here
}

// Usage:
for await (const page of fetchPages('/api/users')) {
  console.log(page);
}

// 5. Create a generator that takes input
function* twoWayGenerator() {
  // Use yield to both send and receive values
  const a = yield 'First';
  const b = yield `Got ${a}`;
  yield `Got ${b}`;
}

const gen = twoWayGenerator();
gen.next();      // { value: 'First', done: false }
gen.next(10);    // { value: 'Got 10', done: false }
gen.next(20);    // { value: 'Got 20', done: false }

// 6. Implement a practical use case: batch processor
function* batchProcessor(items, batchSize) {
  // Yield items in batches of batchSize
}

for (const batch of batchProcessor([1,2,3,4,5,6,7], 3)) {
  console.log(batch); // [1,2,3], [4,5,6], [7]
}
```

---

### 4. Symbols, Maps, Sets, WeakMap, WeakSet

**Explanation:**
**Symbol**: Unique, immutable primitive value used as object property keys. Useful for private properties and avoiding name collisions.
```javascript
const sym = Symbol('description');
const obj = { [sym]: 'value' };
```

**Map**: Key-value pairs where keys can be any type (objects, functions, primitives). Maintains insertion order.
- Better than objects for frequent additions/deletions
- Has size property, iterable

**Set**: Collection of unique values. No duplicates allowed.
- Useful for deduplication, membership testing

**WeakMap**: Like Map but keys must be objects and are weakly held (can be garbage collected).
- No iteration, no size property
- Use for private data, caching

**WeakSet**: Like Set but values must be objects and are weakly held.
- Use for tracking object membership without preventing GC

**Exercise:**
```javascript
// 1. Use Symbols to create private properties
class BankAccount {
  constructor(balance) {
    // Use Symbol to make balance private
    // Implement deposit() and withdraw() methods
  }
}

const account = new BankAccount(1000);
account.deposit(500);
// account.balance should not be directly accessible

// 2. Implement a cache using Map
class Cache {
  constructor(maxSize) {
    // Your code here
    // Implement LRU (Least Recently Used) cache
  }

  get(key) {
    // Return value and mark as recently used
  }

  set(key, value) {
    // Add to cache, evict oldest if at maxSize
  }
}

// 3. Use Set for deduplication and operations
function uniqueValues(arr) {
  // Return array with duplicates removed
}

function intersection(set1, set2) {
  // Return new Set with values in both sets
}

function union(set1, set2) {
  // Return new Set with values from either set
}

function difference(set1, set2) {
  // Return new Set with values in set1 but not set2
}

// 4. Use WeakMap for private data
const privateData = new WeakMap();

class User {
  constructor(name, password) {
    // Store password in WeakMap
    // Make it inaccessible from outside
  }

  authenticate(password) {
    // Check password from WeakMap
  }
}

// 5. Use WeakSet to track DOM elements
class DOMTracker {
  constructor() {
    // Use WeakSet to track which elements have been processed
    // Elements can be garbage collected when removed from DOM
  }

  process(element) {
    // Process element if not already processed
    // Mark as processed
  }

  hasProcessed(element) {
    // Check if element was processed
  }
}

// 6. Explain the difference
const map = new Map();
const weakMap = new WeakMap();

let obj = { data: 'important' };
map.set(obj, 'value');
weakMap.set(obj, 'value');

obj = null; // What happens to the entries in map vs weakMap?
```

---

### 5. Event Emitters (Node side, but JS conceptually)

**Explanation:**
**Event Emitter** is a pattern for implementing pub/sub (publish/subscribe) communication. Objects can emit named events and listeners can subscribe to them.

**Core concepts**:
- **emit(event, ...args)**: Trigger an event with optional data
- **on(event, listener)**: Subscribe to an event
- **once(event, listener)**: Subscribe but auto-unsubscribe after first trigger
- **off(event, listener)**: Unsubscribe from an event
- **removeAllListeners(event)**: Remove all listeners for an event

**Use cases**: Custom events, decoupling components, plugin systems, reactive programming

**Exercise:**
```javascript
// 1. Implement a basic EventEmitter class
class EventEmitter {
  constructor() {
    // Your code here
  }

  on(event, listener) {
    // Subscribe to event
  }

  once(event, listener) {
    // Subscribe but auto-remove after first call
  }

  off(event, listener) {
    // Unsubscribe from event
  }

  emit(event, ...args) {
    // Trigger all listeners for event with args
  }

  removeAllListeners(event) {
    // Remove all listeners for event (or all if no event specified)
  }
}

// Test:
const emitter = new EventEmitter();
emitter.on('data', (data) => console.log('Received:', data));
emitter.emit('data', { value: 42 });

// 2. Add error handling
// - Emit 'error' events
// - If no error listeners, throw the error
// - Prevent listener errors from stopping other listeners

// 3. Implement a practical example: Observable
class Observable extends EventEmitter {
  constructor(initialValue) {
    super();
    // Your code here
  }

  get value() {
    // Return current value
  }

  set value(newValue) {
    // Update value and emit 'change' event
  }

  subscribe(listener) {
    // Subscribe to changes
    // Return unsubscribe function
  }
}

// Usage:
const counter = new Observable(0);
const unsubscribe = counter.subscribe((value) => {
  console.log('Counter:', value);
});
counter.value = 1; // Logs: Counter: 1
counter.value = 2; // Logs: Counter: 2
unsubscribe();
counter.value = 3; // Nothing logged

// 4. Create a custom event system for a game
class Game extends EventEmitter {
  constructor() {
    super();
    this.score = 0;
  }

  addPoints(points) {
    // Add points and emit 'scoreChange' event
    // Emit 'levelUp' event when score crosses multiples of 100
    // Emit 'gameOver' event when score reaches 1000
  }
}

// Test:
const game = new Game();
game.on('scoreChange', (score) => console.log('Score:', score));
game.on('levelUp', (level) => console.log('Level up!', level));
game.on('gameOver', () => console.log('Game over!'));
```

---

### 6. Memory Leaks & Debugging Memory Issues

**Explanation:**
**Memory leaks** occur when memory that's no longer needed is not released, causing the application to consume increasing amounts of memory over time.

**Common causes in JavaScript**:
1. **Forgotten timers/callbacks**: setInterval, setTimeout not cleared
2. **Event listeners**: Not removed when elements are removed
3. **Closures**: Holding references to large objects unnecessarily
4. **Global variables**: Accumulating data in global scope
5. **Detached DOM nodes**: Removed from DOM but still referenced
6. **Circular references**: Objects referencing each other (less common with modern GC)

**Detection**:
- Chrome DevTools Memory Profiler
- Heap snapshots
- Performance monitoring
- Memory timeline

**Prevention**:
- Clean up event listeners
- Clear timers
- Avoid global variables
- Use WeakMap/WeakSet for caches
- Be careful with closures

**Exercise:**
```javascript
// 1. Identify and fix memory leaks in this code

// Leak 1: Timer not cleared
class Timer {
  start() {
    this.interval = setInterval(() => {
      console.log('Tick');
    }, 1000);
  }

  // Missing cleanup!
}

// Leak 2: Event listener not removed
class Component {
  constructor(element) {
    this.element = element;
    this.handler = () => console.log('Clicked');
    this.element.addEventListener('click', this.handler);
  }

  destroy() {
    this.element.remove();
    // Missing cleanup!
  }
}

// Leak 3: Closure holding large object
function createHandler() {
  const largeData = new Array(1000000).fill('data');

  return function() {
    console.log('Handler called');
    // largeData is captured but never used!
  };
}

// Leak 4: Accumulating cache
const cache = {};

function fetchData(id) {
  if (cache[id]) return cache[id];

  const data = expensiveOperation(id);
  cache[id] = data; // Cache grows forever!
  return data;
}

// 2. Fix all leaks above

// 3. Implement a safe cache with automatic cleanup
class SafeCache {
  constructor(maxSize = 100, ttl = 60000) {
    // maxSize: maximum number of entries
    // ttl: time to live in milliseconds
    // Your code here
  }

  set(key, value) {
    // Add to cache with timestamp
    // Evict oldest if at maxSize
  }

  get(key) {
    // Return value if exists and not expired
    // Remove if expired
  }

  cleanup() {
    // Remove expired entries
  }
}

// 4. Create a memory-safe event system
class SafeEventEmitter {
  // Automatically clean up listeners when objects are garbage collected
  // Use WeakMap to store listeners
}

// 5. Debugging exercise
// Given this code, use Chrome DevTools to:
// - Take heap snapshots before and after operations
// - Identify which objects are not being garbage collected
// - Find the root cause of the leak

class DataManager {
  constructor() {
    this.data = [];
    this.listeners = [];
  }

  addData(item) {
    this.data.push(item);
    this.notifyListeners();
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  clear() {
    this.data = [];
    // What's missing?
  }
}

// Usage that causes leak:
for (let i = 0; i < 1000; i++) {
  const manager = new DataManager();
  manager.subscribe(() => console.log('Update'));
  manager.addData({ id: i, data: new Array(10000) });
  manager.clear();
  // manager goes out of scope but memory isn't freed
}
```

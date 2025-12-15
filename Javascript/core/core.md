# Core Language

## 1. Scope, Hoisting, TDZ

**Explanation:**

- **Scope** determines where variables are accessible. JavaScript has global scope, function scope, and block scope (ES6+).
- **Hoisting** is JavaScript's behavior of moving declarations to the top of their scope during compilation. Variables declared with `var` are hoisted and initialized with `undefined`. Function declarations are fully hoisted (both declaration and definition). `let` and `const` are hoisted but not initialized.
- **TDZ (Temporal Dead Zone)** is the period between entering a scope and the actual declaration of a `let`/`const` variable. Accessing the variable in the TDZ throws a ReferenceError.

**Exercise:**

```javascript
// Predict the output of this code and explain why:
console.log(a); // ?
console.log(b); // ?
console.log(c); // ?

var a = 1;
let b = 2;
const c = 3;

function test() {
  console.log(x); // ?
  var x = 10;

  if (true) {
    console.log(y); // ?
    let y = 20;
  }
}

test();
```

---

### 2. var vs let vs const

**Explanation:**

- **`var`**: Function-scoped (or globally scoped), hoisted and initialized with `undefined`, can be re-declared and updated, no TDZ.
- **`let`**: Block-scoped, hoisted but not initialized (TDZ applies), cannot be re-declared in the same scope, can be updated.
- **`const`**: Block-scoped, hoisted but not initialized (TDZ applies), cannot be re-declared or reassigned, must be initialized at declaration. Note: objects/arrays declared with `const` can have their properties/elements modified.

**Exercise:**

```javascript
// Fix the bugs in this code and explain what was wrong:
function processData() {
  const results = [];

  for (var i = 0; i < 3; i++) {
    setTimeout(() => {
      results.push(i);
    }, 100);
  }

  setTimeout(() => {
    console.log(results); // Expected: [0, 1, 2]
  }, 200);
}

// Also, explain why this works or doesn't work:
const user = { name: 'Alice' };
user.name = 'Bob'; // ?
user = { name: 'Charlie' }; // ?
```

---

### 3. Closures and Lexical Scope

**Explanation:**
**Lexical scope** means that a function's scope is determined by where it's written in the code, not where it's called. Inner functions have access to variables in their outer functions.

**Closures** occur when a function retains access to its lexical scope even after the outer function has finished executing. The inner function "closes over" the variables it needs, keeping them alive in memory.

**Exercise:**

```javascript
// Create a counter factory that:
// 1. Returns an object with increment, decrement, and getValue methods
// 2. The count should be private (not accessible directly)
// 3. Each counter instance should have its own independent count

function createCounter(initialValue = 0) {
  // Your code here
}

// Test:
const counter1 = createCounter(0);
const counter2 = createCounter(10);

counter1.increment();
counter1.increment();
console.log(counter1.getValue()); // Should be 2

counter2.decrement();
console.log(counter2.getValue()); // Should be 9
```

---

### 4. Prototypes & Inheritance

**Explanation:**
Every JavaScript object has an internal `[[Prototype]]` property (accessible via `__proto__` or `Object.getPrototypeOf()`). When you access a property on an object, JavaScript first looks on the object itself, then walks up the prototype chain until it finds the property or reaches `null`.

**Prototypal inheritance** allows objects to inherit properties and methods from other objects. Constructor functions have a `prototype` property that becomes the `[[Prototype]]` of instances created with `new`.

**Exercise:**

```javascript
// Implement a simple inheritance system:
// 1. Create an Animal constructor with a method speak()
// 2. Create a Dog constructor that inherits from Animal
// 3. Dog should have its own method wagTail()
// 4. Override speak() in Dog to return "Woof!"

// Your code here

// Test:
const dog = new Dog('Buddy');
console.log(dog.speak()); // "Woof!"
dog.wagTail(); // Should work
console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true
```

---

### 5. The Event Loop & Concurrency Model

**Explanation:**
JavaScript is single-threaded but can handle asynchronous operations through the **event loop**. The event loop continuously checks if the call stack is empty, and if so, takes the first task from the task queue and pushes it onto the stack.

**Components:**

- **Call Stack**: Executes synchronous code
- **Task Queue (Macrotask Queue)**: Holds callbacks from setTimeout, setInterval, I/O
- **Microtask Queue**: Holds Promise callbacks, process.nextTick (higher priority)

The event loop prioritizes microtasks over macrotasks. DOM operations themselves are synchronous — they execute immediately on the call stack, not in any queue. However, DOM-related events are different:

**DOM Events**:  Macrotask  -> click, scroll, keydown, load
**MutationObserver**:  Microtask  -> Observing DOM changes

**Exercise:**

```javascript
// Predict the exact order of console.log outputs:
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

setTimeout(() => {
  console.log('5');
  Promise.resolve().then(() => console.log('6'));
}, 0);

Promise.resolve().then(() => {
  console.log('7');
  setTimeout(() => console.log('8'), 0);
});

console.log('9');

// Write down your answer, then run the code to verify
```

---

### 6. Microtasks vs Macrotasks

**Explanation:**
**Macrotasks** (tasks): setTimeout, setInterval, setImmediate (Node.js), I/O operations, UI rendering. One macrotask is processed per event loop iteration.

**Microtasks** (jobs): Promise callbacks (.then, .catch, .finally), queueMicrotask(), MutationObserver, process.nextTick (Node.js). All microtasks are processed after the current task and before the next macrotask.

**Execution order**: Synchronous code → All microtasks → One macrotask → All microtasks → Next macrotask...

**Exercise:**

```javascript
// Create a function that demonstrates the difference:
// It should schedule both microtasks and macrotasks and log their execution order

function demonstrateTaskQueues() {
  console.log('Start');

  // Add your code here using:
  // - setTimeout (at least 2)
  // - Promise.resolve().then() (at least 2)
  // - queueMicrotask() (at least 1)

  console.log('End');
}

// Predict the output before running
demonstrateTaskQueues();
```

---

### 7. The Call Stack, Queue, Job Queue

**Explanation:**

- **Call Stack**: A LIFO (Last In, First Out) data structure that tracks function execution. When a function is called, it's pushed onto the stack; when it returns, it's popped off.
- **Task Queue (Callback Queue/Macrotask Queue)**: Holds callbacks from async operations like setTimeout, DOM events.
- **Job Queue (Microtask Queue)**: Holds Promise callbacks and other microtasks. Has higher priority than the task queue.

**Stack overflow** occurs when the call stack exceeds its limit (usually from infinite recursion).

**Exercise:**

```javascript
// 1. Write a recursive function that will cause a stack overflow
// 2. Rewrite it to avoid stack overflow using async/await or setTimeout
// 3. Explain why your solution works

// Part 1: Stack overflow version
function processArray(arr, index = 0) {
  // Your code here
}

// Part 2: Fixed version
function processArraySafe(arr, index = 0) {
  // Your code here
}

// Test with a large array
const largeArray = Array.from({ length: 100000 }, (_, i) => i);
```

---

### 8. this Binding Rules

**Explanation:**
The value of `this` depends on how a function is called:

1. **Default binding**: When a function is called standalone (not as a method, not with new, etc.). In non-strict mode, `this` is the global object; in strict mode, it's `undefined`
2. **Implicit binding**: When a function is called as a method of an object, this is the object before the dot.
3. **Explicit binding**: Using `.call()`, `.apply()`, or `.bind()` to set `this`
4. **new binding**: With `new`, `this` is the newly created object
5. **Arrow functions**: Arrow functions don't have their own this. They inherit this from the enclosing lexical scope (where they were defined).

**Priority**: new > explicit > implicit > default

**Exercise:**

```javascript
// Predict the value of 'this' in each case:

const obj = {
  name: 'Object',
  regular: function() {
    console.log(this.name);
  },
  arrow: () => {
    console.log(this.name);
  },
  nested: function() {
    const inner = () => {
      console.log(this.name);
    };
    inner();
  }
};

const name = 'Global';

obj.regular();           // ?
obj.arrow();             // ?
obj.nested();            // ?

const regular = obj.regular;
regular();               // ?

const bound = obj.regular.bind({ name: 'Bound' });
bound();                 // ?

// Fix this code so all buttons log their correct index:
for (var i = 0; i < 3; i++) {
  const button = document.createElement('button');
  button.onclick = function() {
    console.log('Button ' + i);
  };
}
```

---

### 9. Arrow Functions vs Function Declarations

**Explanation:**
**Function Declarations**:

- Hoisted completely (can be called before declaration)
- Have their own `this`, `arguments`, `super`, and `new.target`
- Can be used as constructors with `new`
- `this` is determined by how the function is called

**Arrow Functions**:

- Not hoisted (if assigned to a variable)
- No own `this` (inherits from lexical scope)
- No `arguments` object (use rest parameters instead)
- Cannot be used as constructors
- Cannot be used as generators
- More concise syntax

**Exercise:**

```javascript
// Refactor this code to use arrow functions where appropriate,
// and explain where you should NOT use arrow functions:

function Timer(duration) {
  this.duration = duration;
  this.elapsed = 0;

  this.start = function() {
    this.interval = setInterval(function() {
      this.elapsed++;
      console.log(this.elapsed);
      if (this.elapsed >= this.duration) {
        this.stop();
      }
    }, 1000);
  };

  this.stop = function() {
    clearInterval(this.interval);
    console.log('Timer stopped');
  };
}

// Also, explain why this doesn't work:
const calculator = {
  value: 0,
  add: (n) => {
    this.value += n;
    return this;
  }
};
```

---

### 10. Destructuring, Spread, Rest Operators

**Explanation:**
**Destructuring**: Extract values from arrays or properties from objects into distinct variables.

```javascript
const [a, b] = [1, 2];
const { name, age } = { name: 'Alice', age: 30 };
```

**Spread operator (`...`)**: Expands iterables into individual elements. Used in array/object literals and function calls.

```javascript
const arr2 = [...arr1];
const obj2 = { ...obj1 };
```

**Rest operator (`...`)**: Collects multiple elements into an array. Used in function parameters and destructuring.

```javascript
function sum(...numbers) { }
const [first, ...rest] = [1, 2, 3, 4];
```

**Exercise:**

```javascript
// Complete these tasks using destructuring, spread, and rest:

// 1. Write a function that swaps two variables using destructuring
function swap(a, b) {
  // Your code here
}

// 2. Write a function that merges multiple objects, with later objects overriding earlier ones
function mergeObjects(...objects) {
  // Your code here
}

// 3. Extract the first two elements and the rest into separate variables
const numbers = [1, 2, 3, 4, 5, 6];
// Your code here

// 4. Create a function that accepts any number of arguments and returns their sum,
//    but the first argument is a multiplier for the sum
function multipliedSum(multiplier, ...numbers) {
  // Your code here
}

// Test: multipliedSum(2, 1, 2, 3) should return 12 (2 * (1+2+3))

// 5. Deep clone this nested object using spread (note the limitation)
const original = {
  name: 'John',
  address: { city: 'NYC', zip: '10001' }
};
// Your code here - then modify the clone and see what happens to original
```

---

### 11. Pure Functions and Immutability

**Explanation:**
**Pure Functions**:

- Always return the same output for the same input
- Have no side effects (don't modify external state, no I/O, no mutations)
- Don't depend on external mutable state
- Benefits: Predictable, testable, cacheable, parallelizable

**Immutability**: Data that cannot be changed after creation. Instead of modifying, create new copies with changes.

- Use `const` for variables
- Avoid mutating methods (push, pop, splice) → use non-mutating alternatives (concat, slice, spread)
- For objects: use spread, Object.assign, or libraries like Immer

**Exercise:**

```javascript
// Identify which functions are pure and which are not. Fix the impure ones:

let globalCounter = 0;

function add(a, b) {
  return a + b;
}

function addToGlobal(n) {
  globalCounter += n;
  return globalCounter;
}

function getRandomNumber(max) {
  return Math.floor(Math.random() * max);
}

function getCurrentTime() {
  return new Date().toISOString();
}

function addToArray(arr, item) {
  arr.push(item);
  return arr;
}

function updateUser(user, newName) {
  user.name = newName;
  return user;
}

// Rewrite the impure functions to be pure:
// Your code here

// Create an immutable shopping cart system:
// - addItem(cart, item) - adds item to cart
// - removeItem(cart, itemId) - removes item from cart
// - updateQuantity(cart, itemId, quantity) - updates item quantity
// All functions should return a new cart without modifying the original
```

---

### 12. Error Handling (try/catch, error objects, rethrowing)

**Explanation:**
**try/catch**: Handles runtime errors gracefully without crashing the program.

```javascript
try {
  // Code that might throw
} catch (error) {
  // Handle error
} finally {
  // Always executes
}
```

**Error objects**: Built-in Error types include Error, TypeError, ReferenceError, SyntaxError, RangeError. Custom errors can extend Error.

**Rethrowing**: Catching an error, performing some action, then throwing it again (or a new error) for upstream handling.

**Best practices**:

- Catch specific errors when possible
- Don't catch errors you can't handle
- Always log errors
- Use custom error types for domain-specific errors

**Exercise:**

```javascript
// 1. Create a custom error class for validation errors
class ValidationError extends Error {
  // Your code here
}

// 2. Write a function that validates user input and throws appropriate errors
function validateUser(user) {
  // Should check:
  // - user exists
  // - user.email is valid format
  // - user.age is a number between 0 and 150
  // Throw ValidationError with descriptive messages
}

// 3. Write a wrapper function that calls validateUser and handles errors appropriately
function processUser(user) {
  // Your code here
  // - Catch ValidationError and log a user-friendly message
  // - Rethrow other errors
  // - Use finally to log that processing completed
}

// 4. Handle async errors
async function fetchUserData(userId) {
  // Fetch from an API (simulate with Promise)
  // Handle network errors, 404s, and parsing errors differently
}

// Test your code with various inputs
```

---

### 13. Deep vs Shallow Copy

**Explanation:**
**Shallow Copy**: Copies only the first level of properties. Nested objects/arrays are still referenced.

- Methods: `Object.assign()`, spread operator `{...obj}`, `Array.slice()`, `[...arr]`

**Deep Copy**: Recursively copies all levels, creating completely independent copies.

- Methods: `JSON.parse(JSON.stringify())` (limitations: loses functions, undefined, symbols, dates)
- Recursive custom function
- Libraries: Lodash's `_.cloneDeep()`, structuredClone() (modern browsers)

**Exercise:**

```javascript
// 1. Demonstrate the difference between shallow and deep copy
const original = {
  name: 'Alice',
  scores: [90, 85, 88],
  address: {
    city: 'NYC',
    zip: '10001'
  },
  greet: function() { console.log('Hi'); }
};

// Create a shallow copy and modify nested properties
// Create a deep copy using JSON methods - what gets lost?

// 2. Implement your own deep clone function
function deepClone(obj) {
  // Your code here
  // Handle: primitives, arrays, objects, null, Date, RegExp
  // Bonus: Handle circular references
}

// 3. Test with this circular reference object:
const circular = { name: 'Test' };
circular.self = circular;

// Can your function handle it?
```

---

### 14. Value vs Reference Types

**Explanation:**
**Value Types (Primitives)**: string, number, boolean, null, undefined, symbol, bigint

- Stored directly in the variable
- Copied by value (independent copies)
- Immutable

**Reference Types**: objects, arrays, functions

- Variable stores a reference (memory address) to the data
- Copied by reference (both variables point to same data)
- Mutable

**Implications**:

- Comparing primitives compares values
- Comparing objects compares references
- Passing primitives to functions creates copies
- Passing objects to functions passes references

**Exercise:**

```javascript
// Predict the output and explain why:

// Part 1: Primitives
let a = 10;
let b = a;
b = 20;
console.log(a, b); // ?

// Part 2: Objects
let obj1 = { value: 10 };
let obj2 = obj1;
obj2.value = 20;
console.log(obj1.value, obj2.value); // ?

// Part 3: Arrays
function modifyArray(arr) {
  arr.push(4);
  arr = [1, 2, 3, 4, 5];
  arr.push(6);
}

let myArray = [1, 2, 3];
modifyArray(myArray);
console.log(myArray); // ?

// Part 4: Comparison
console.log({} === {}); // ?
console.log([1, 2] === [1, 2]); // ?

const x = { a: 1 };
const y = x;
console.log(x === y); // ?

// Part 5: Write a function that safely modifies an object without affecting the original
function safeUpdate(obj, key, value) {
  // Your code here
}

const user = { name: 'Alice', age: 30 };
const updated = safeUpdate(user, 'age', 31);
console.log(user.age); // Should still be 30
console.log(updated.age); // Should be 31
```

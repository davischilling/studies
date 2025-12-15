// 3. Closures and Lexical Scope
console.log(">>>>>>>>>>>>>>>>>>>>>>>> 3. Closures and Lexical Scope");

// Create a counter factory that:
// 1. Returns an object with increment, decrement, and getValue methods
// 2. The count should be private (not accessible directly)
// 3. Each counter instance should have its own independent count

function createCounter(initialValue = 0) {
  let value = initialValue;
  return {
    increment: () => value += 1,
    decrement: () => value -= 1,
    getValue: () => value
  }
}

// Test:
const counter1 = createCounter(0);
const counter2 = createCounter(10);

counter1.increment();
counter1.increment();
console.log(`counter1: ${counter1.getValue()}`); // Should be 2

counter2.decrement();
console.log(`counter2: ${counter2.getValue()}`); // Should be 9

function CreateCounter(initialValue = 0) {
  this.value = initialValue;
  this.increment = () => this.value += 1,
  this.decrement = () => this.value -= 1,
  this.getValue = () => this.value
}

// Test:
const counter3 = new CreateCounter(0);
const counter4 = new CreateCounter(10);

counter3.increment();
counter3.increment();
console.log(`counter3: ${counter3.getValue()}`); // Should be 2

counter4.decrement();
console.log(`counter4: ${counter4.getValue()}`); // Should be 9

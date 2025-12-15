// 6. Microtasks vs Macrotasks
console.log(">>>>>>>>>>>>>>>>>>>>>>>> 6. Microtasks vs Macrotasks");

// Create a function that demonstrates the difference:
// It should schedule both microtasks and macrotasks and log their execution order

function demonstrateTaskQueues() {
  console.log('Start');

  // Add your code here using:
  // - setTimeout (at least 2)
  // - Promise.resolve().then() (at least 2)
  // - queueMicrotask() (at least 1)

  setTimeout(() => {
    console.log("1");
  }, 0)

  Promise.resolve().then(() => {
    console.log("2");
  })

  setTimeout(() => {
    console.log("3");
  }, 0)

  queueMicrotask(() => {
    console.log("4");
  })

  Promise.resolve().then(() => {
    console.log("5");
  })

  console.log('End');
}

// Predict the output before running
// Result: start, end, 2, 4, 5, 1, 3
demonstrateTaskQueues();
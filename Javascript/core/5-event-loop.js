// 5. The Event Loop & Concurrency Model
console.log(">>>>>>>>>>>>>>>>>>>>>>>> 5. The Event Loop & Concurrency Model");

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
// Result: 1, 4, 9, 3, 7, 2, 5, 6, 8

// event loop
  // - call stack -> execute sync code
  // - Queues:
    // - Microtask queue -> executed all after call stack
    // - Macrotask queue -> executed one per event loop

















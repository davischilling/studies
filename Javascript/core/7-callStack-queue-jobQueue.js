// 1. Write a recursive function that will cause a stack overflow
// 2. Rewrite it to avoid stack overflow using async/await or setTimeout
// 3. Explain why your solution works

// Part 1: Stack overflow version (Complexity O(n) stack frames)
// This fails because using recursion without any usage of microtasks and
// macrotasks, causes the call stack to be overload. Each call of the
// function adds itself to the callstack, without removing the previous one
// since each function needs the result of the next one before being removed
// from the call stack
function processArray(arr, index = 0) {
  // Your code here
    if (index >= arr.length) return;
    processArray(arr, index + 1);
}

// Part 2: Fixed version (Complexity O(1) stack frames)
// Key difference: Each call completes and returns before the next one starts.
// The stack never has more than 1 frame.
function processArraySafe1(arr, index = 0) {
  if (index >= arr.length) return;
  console.log(arr[index]);
  setTimeout(() => processArraySafe1(arr, index + 1), 0);
}

function processArraySafe2(arr, index = 0) {
  if (index >= arr.length) return;
  console.log(arr[index]);
  setImmediate(() => processArraySafe2(arr, index + 1));
}

function processArraySafe3(arr, index = 0) {
  if (index >= arr.length) return;
  console.log(arr[index]);
  queueMicrotask(() => processArraySafe3(arr, index + 1));
}

// Test with a large array
const largeArray = Array.from({ length: 100000 }, (_, i) => i);
// processArray(largeArray, 0) // Stack overflow version
// processArraySafe1(largeArray, 0)
// processArraySafe2(largeArray, 0)
processArraySafe3(largeArray, 0)

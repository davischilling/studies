// 2. var vs let vs const
console.log(">>>>>>>>>>>>>>>>>>>>>>>> 2. var vs let vs const");

// Fix the bugs in this code and explain what was wrong:
function processData() {
  const results = [];

  // for (var i = 0; i < 3; i++) {
  // var is not block scoped. Because of this
  // iterations end, scheduling with setTimeout 3 callbacks
  // but when the callbacks are executed, the value of i is 3
  // because iteration has already ended.
  // Expected log using var: [3, 3, 3]
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      results.push(i);
    }, 100);
  }

  setTimeout(() => {
    console.log(results); // Expected: [0, 1, 2]
  }, 200);
}

processData()

// Also, explain why this works or doesn't work:
const user = { name: 'Alice' }; // This works because it's first assigned
user.name = 'Bob'; // This also works because objects can be reassgined like this
// user = { name: 'Charlie' }; // This won't work because it's trying to entirely reassign a const variable
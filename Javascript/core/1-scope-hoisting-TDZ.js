// 1. Scope, Hoisting, TDZ
console.log(">>>>>>>>>>>>>>>>>>>>>>>> 1. Scope, Hoisting, TDZ");

// Predict the output of this code and explain why:
console.log(`a: ${a}`); // undefined
// console.log(`b: ${b}`); // ReferenceError
// console.log(`c: ${c}`); // ReferenceError

var a = 1;
let b = 2;
const c = 3;

// global scope

function test() { // function scope
  console.log(`x: ${x}`); // undefined
  var x = 10;

  if (true) {
    // block scope
    // console.log(`y: ${y}`); // ReferenceError
    let y = 20;
  }
}

test();
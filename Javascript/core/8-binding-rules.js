// 1. Default binding

function showThis() {
  console.log(this);
}

// Non-strict mode
showThis();  // → global object (window in browser, global in Node)

// Strict mode
"use strict";
function showThisStrict() {
  console.log(this);
}
showThisStrict();  // → undefined

// 2. Implicit binding

const user = {
  name: "Alice",
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

user.greet();  // "Hello, I'm Alice"
               // this = user (object before the dot)

// Common pitfall - losing implicit binding:
const user2 = {
  name: "Alice",
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

const greetFn = user2.greet;  // Extracting the method
greetFn();  // "Hello, I'm undefined" 
            // Lost implicit binding! Falls back to default binding

// Nested objects - only immediate parent matters: 
const company = {
  name: "TechCorp",
  department: {
    name: "Engineering",
    getName() {
      return this.name;
    }
  }
};

company.department.getName();  // "Engineering" (not "TechCorp")
                               // this = department (immediate object)

// 3. Explicit binding

// Using .call(), .apply(), or .bind() to explicitly set this.

// .call(thisArg, arg1, arg2, ...)
function introduce(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person = { name: "Bob" };

introduce.call(person, "Hello", "!");  // "Hello, I'm Bob!"
//              ↑ this    ↑ args passed individually

// .apply(thisArg, [argsArray])
introduce.apply(person, ["Hi", "?"]);  // "Hi, I'm Bob?"
//               ↑ this   ↑ args as array

// .bind(thisArg) - returns a new function
const boundIntroduce = introduce.bind(person);
boundIntroduce("Hey", ".");  // "Hey, I'm Bob."

// Useful for callbacks
const user3 = {
  name: "Carol",
  greet() {
    console.log(`Hi, ${this.name}`);
  }
};

// You extract the function reference
setTimeout(user3.greet, 100);              // "Hi, undefined" ❌
//         ^^^^^^^^^^
//         This evaluates to just the function itself
// It's equivalent to:
const extractedFn = user.greet;  // Just the function, no object attached
setTimeout(extractedFn, 100);

// bind() - creates new function with fixed this
setTimeout(user3.greet.bind(user3), 100);   // "Hi, Carol" ✅

// Arrow wrapper - preserves context at definition
setTimeout(() => user.greet(), 100);  // ✅
//                ^^^^^^^^^^^
//                Called as method → implicit binding works!

// Priority: new > explicit > implicit > default

function identify() {
  console.log(this.name);
}

const obj1 = { name: "obj1", identify };
const obj2 = { name: "obj2" };

// Implicit binding
obj1.identify();  // "obj1"

// Explicit beats implicit
obj1.identify.call(obj2);  // "obj2"

// new beats explicit
const boundFn = identify.bind(obj1);
boundFn();  // "obj1"

function Person(name) {
  this.name = name;
}
const boundPerson = Person.bind(obj1);
const person2 = new boundPerson("NewPerson");
console.log(person2.name);  // "NewPer2son" (new won!)
console.log(obj1.name);    // "obj1" (unchanged)

// Exercise:
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

obj.regular();           // Object
obj.arrow();             // undefined
obj.nested();            // Object

const regular = obj.regular;
regular();               // undefined

const bound = obj.regular.bind({ name: 'Bound' });
bound();                 // Bound

// Fix this code so all buttons log their correct index:
const buttons = [];
for (var i = 0; i < 3; i++) {
  const button = {};  // Simple object instead of DOM element
  button.onclick = function() {
    console.log('Button ' + i);
  };
  buttons.push(button);
}

// Simulate clicks AFTER loop finishes
buttons[0].onclick();  // "Button 3" ❌
buttons[1].onclick();  // "Button 3" ❌
buttons[2].onclick();  // "Button 3" ❌

// ----------------------------------------------------------
// Fixed version
const buttons2 = [];
for (let i = 0; i < 3; i++) {
  const button = {};  // Simple object instead of DOM element
  button.onclick = () => {
    console.log('Button ' + i);
  };
  buttons2.push(button);
}

// Simulate clicks AFTER loop finishes
buttons2[0].onclick();  // "Button 0" ✅
buttons2[1].onclick();  // "Button 1" ✅
buttons2[2].onclick();  // "Button 2" ✅
// 4. Prototypes & Inheritance
console.log(">>>>>>>>>>>>>>>>>>>>>>>> 4. Prototypes & Inheritance");

let name = "davi"
console.log(name.__proto__)
console.log(Object.getPrototypeOf(name))

// Implement a simple inheritance system:
// 1. Create an Animal constructor with a method speak()
// 2. Create a Dog constructor that inherits from Animal
// 3. Dog should have its own method wagTail()
// 4. Override speak() in Dog to return "Woof!"

// everything in javascript is an object
// That's a constructor of a function object
function Animal(name) {
  this.name = name;
}

// That's how we add a method to a function object without an instance
// Trying to add a method without prototype throws TypeError
Animal.prototype.speak = function() {
  return `${this.name} makes a sound`;
}

function Dog(name) {
  Animal.call(this, name); // applies inheritance (only the constructor)
}

Dog.prototype = Object.create(Animal.prototype); // inherite the methods
Dog.prototype.constructor = Dog; // fixes the constructor reference pointing it to Dog

Dog.prototype.speak = function() { // overrides speak method
  return "Woof!";
}

Dog.prototype.wagTail = function() { // add wagTail method
  return `${this.name} is wagging tail!`;
}

// Test:
const dog = new Dog('Buddy');
console.log(dog.speak()); // "Woof!"
console.log(dog.wagTail());
; // Should work
console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true

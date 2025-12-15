// Complete these tasks using destructuring, spread, and rest:

// 1. Write a function that swaps two variables using destructuring
function swap(a, b) {
  [a, b] = [b, a];
  return [a, b];
}

// Test
let x = 1, y = 2;
[x, y] = swap(x, y);
console.log(x, y);  // 2, 1

// 2. Write a function that merges multiple objects, with later objects overriding earlier ones
function mergeObjects(...objects) {
  // Your code here
  return objects.reduce((previous, current) => ({ ...previous, ...current }), {})

}
console.log(mergeObjects({name: "Davi"}, { age: 36 }, { name: "Carolina", age: 30 }));


// 3. Extract the first two elements and the rest into separate variables
const numbers = [1, 2, 3, 4, 5, 6];
// Your code here
const [first, second, ...rest] = numbers;
console.log(first, second,rest);


// 4. Create a function that accepts any number of arguments and returns their sum,
//    but the first argument is a multiplier for the sum
function multipliedSum(multiplier, ...numbers) {
  // Your code here
  return numbers.reduce((previous, current) => ((previous + current)), 0) * multiplier
}
// Test: multipliedSum(2, 1, 2, 3) should return 12 (2 * (1+2+3))
console.log(multipliedSum(2, 1, 2, 3));

// 5. Deep clone this nested object using spread (note the limitation)
const original = {
  name: 'John',
  address: { city: 'NYC', zip: '10001' }
};
// Your code here - then modify the clone and see what happens to original
const copy = structuredClone(original)
copy.name = "Davi"
console.log(copy);
console.log(original);


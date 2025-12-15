// Refactor this code to use arrow functions where appropriate,
// and explain where you should NOT use arrow functions:

function Timer(duration) {
  this.duration = duration;
  this.elapsed = 0;

  this.start = function() {
    this.interval = setInterval(() => {
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

const timer = new Timer(5);
timer.start();

// Also, explain why this doesn't work:
// doesn't work because this has access only outside calculator object
const calculator = {
  value: 0,
//   add: (n) => {
  add: function(n) {
    this.value += n;
    return this;
  }
};
console.log(calculator.add(5));

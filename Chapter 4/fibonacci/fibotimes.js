
var math = require('./math');
var util = require('util');

for (var num = 1; num < 8000; num++) {
    // util.log('Fibonacci for '+ num +' = '+ math.fibonacci(num));
    util.log('Fibonacci for '+ num +' = '+ math.fibonacciLoop(num));
}
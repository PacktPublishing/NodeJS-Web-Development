
var fibonacci = exports.fibonacci = function(n) {
    if (n === 1)
        return 1;
    else if (n === 2)
        return 1;
    else
        return fibonacci(n-1) + fibonacci(n-2);
};

var fibonacciLoop = exports.fibonacciLoop = function(n) {
    var fibos = [];
    fibos[0] = 0;
    fibos[1] = 1;
    fibos[2] = 1;
    for (var i = 3; i <= n; i++) {
        fibos[i] = fibos[i-2] + fibos[i-1];
    }
    return fibos[n];
};

var fibonacciAsync = exports.fibonacciAsync = function(n, done) {
    if (n === 0)
        done(undefined, 0);
    else if (n === 1 || n === 2)
        done(undefined, 1);
    else {
        setImmediate(() => {
            fibonacciAsync(n-1, (err, val1) => {
                if (err) done(err);
                else setImmediate(() => {
                    fibonacciAsync(n-2, (err, val2) => {
                        if (err) done(err);
                        else done(undefined, val1+val2);
                    });
                });
            });
        });
    }
};

exports.fibonacciPromise = function(n) {
    return new Promise((resolve, reject) => {
        fibonacciAsync(n, (err, val) => {
            if (err) reject(err);
            else resolve(val);
        });
    });
};

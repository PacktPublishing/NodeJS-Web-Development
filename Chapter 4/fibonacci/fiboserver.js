var math  = require('./math');
var express = require('express');
var logger = require('morgan');
var app = express();
app.use(logger('dev'));
app.get('/fibonacci/:n', (req, res, next) => {
    math.fibonacciAsync(Math.floor(req.params.n), (err, val) => {
        if (err) next('FIBO SERVER ERROR ' + err);
        else {
            res.send({
                n: req.params.n,
                result: val
            });
        }
    });
});
app.listen(process.env.SERVERPORT);
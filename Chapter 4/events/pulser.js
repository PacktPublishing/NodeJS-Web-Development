var events = require('events');
var util   = require('util');

// Define the Pulser object
function Pulser() {
    events.EventEmitter.call(this);
}
util.inherits(Pulser, events.EventEmitter);

Pulser.prototype.start = function() {
    var self = this;
    setInterval(() => {
        util.log('>>>> pulse');
        self.emit('pulse');
        util.log('<<<< pulse');
    }, 1000);
};

// Instantiate a Pulser object
var pulser = new Pulser();
// Handler function
pulser.on('pulse', () => {
    util.log('pulse received');
});
// Start it pulsing
pulser.start();

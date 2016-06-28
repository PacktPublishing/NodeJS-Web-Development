'use strict';

const assert = require('chai').assert;

const model = require(process.env.MODEL_TO_TEST);

describe("Model Test", function() {
    
    beforeEach(function() {
        return model.keylist()
        .then(keyz => {
            var todel = keyz.map(key => model.destroy(key)); 
            return Promise.all(todel);
        })
        .then(() => {
            return Promise.all([
                model.create("n1", "Note 1", "Note 1"),
                model.create("n2", "Note 2", "Note 2"),
                model.create("n3", "Note 3", "Note 3")
            ]);
        });
    });
    
    describe("check keylist", function() {
        it("should have three entries", function() {
            return model.keylist()
            .then(keyz => {
                assert.equal(3, keyz.length, "length 3");
            });
        });
        it("should have keys n1 n2 n3", function() {
            return model.keylist()
            .then(keyz => {
                keyz.forEach(key => {
                    assert.match(key, /n[123]/, "correct key");
                });
            });
        });
        it("should have titles Node #", function() {
            return model.keylist()
            .then(keyz => {
                var keyPromises = keyz.map(key => model.read(key));
                return Promise.all(keyPromises);
            })
            .then(notez => {
                notez.forEach(note => {
                    assert.match(note.title, /Note [123]/, "correct title");
                });
            });
        });
    });
    
    describe("read note", function() {
        it("should have proper note", function() {
            return model.read("n1")
            .then(note => {
                assert.equal(note.key, "n1");
                assert.equal(note.title, "Note 1");
                assert.equal(note.body, "Note 1");
            });
        });
        
        it("Unknown note should fail", function() {
            return model.read("badkey12")
            .then(note => {
                throw new Error("should not get here");
            })
            .catch(err => {
                // this is expected, so do not indicate error
            });
        })
    });
    
    describe("change note", function() {
        it("after a successful model.update", function() {
            return model.update("n1", "Note 1 title changed", "Note 1 body changed")
            .then(newnote => {
                return model.read("n1");
            })
            .then(newnote => {
                assert.equal(newnote.key, "n1");
                assert.equal(newnote.title, "Note 1 title changed");
                assert.equal(newnote.body, "Note 1 body changed");    
            });
        })
    });
    
    describe("destroy note", function() {
        it("should remove note", function() {
            return model.destroy("n1")
            .then(() => {
                return model.keylist()
                .then(keyz => {
                    assert.equal(2, keyz.length, "length 2");
                });
            })
        });
        it("should fail to remove unknown note", function() {
            return model.destroy("badkey12")
            .then(() => {
                throw new Error("should not get here");
            })
            .catch(err => {
                // this is expected, so do not indicate error
            });
        })
    });
});

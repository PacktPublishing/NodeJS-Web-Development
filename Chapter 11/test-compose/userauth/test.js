'use strict';

const assert  = require('chai').assert;
const restify = require('restify');
const url     = require('url');

var usersClient;

describe("Users Test", function() {
    
    before(function() {
        usersClient = restify.createJsonClient({
          url: url.format({
            protocol: 'http',
            hostname: process.env.HOST_USERS_TEST,
            port: process.env.PORT
          }),
          version: '*'
        });
        usersClient.basicAuth('them', 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF');
    });
    
    beforeEach(function() {
        return new Promise((resolve, reject) => {
            usersClient.post('/find-or-create', {
                username: "me", password: "w0rd", provider: "local",
                familyName: "Einarrsdottir", givenName: "Ashildr", middleName: "",
                emails: [], photos: []
            },
            (err, req, res, obj) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
    
    afterEach(function() {
        return new Promise((resolve, reject) => {
            usersClient.del('/destroy/me', 
            (err, req, res, obj) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
    
    describe("List user", function() {
        it("list created users", function() {
            return new Promise((resolve, reject) => {
                usersClient.get('/list', 
                (err, req, res, obj) => {
                    if (err) reject(err);
                    else if (obj.length <= 0) reject(new Error("no users found"));
                    else resolve();
                });
            });
        });
    });
    
    describe("find user", function() {
        it("find created users", function() {
            return new Promise((resolve, reject) => {     
                usersClient.get('/find/me', 
                (err, req, res, obj) => {
                    if (err) reject(err);
                    else if (!obj) reject(new Error("me should exist"));
                    else resolve();
                });
            });
        });
        it("fail to find non-existent users", function() {
            return new Promise((resolve, reject) => {     
                usersClient.get('/find/nonExistentUser', 
                (err, req, res, obj) => {
                    if (err) resolve();
                    else if (!obj) resolve();
                    else reject(new Error("nonExistentUser should not exist"));
                });
            });
        });
    });
    
    describe("delete user", function() {
        it("delete nonexistent users", function() {
            return new Promise((resolve, reject) => {
                usersClient.del('/destroy/nonExistentUser', 
                (err, req, res, obj) => {
                    if (err) resolve();
                    else reject(new Error("Should have thrown error"));
                });
            });
        });
    });
});
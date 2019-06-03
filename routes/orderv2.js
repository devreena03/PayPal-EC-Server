var express = require('express');
var request = require('request');
var initialize = require("./config");

var router = express.Router();
var sanboxUrl = 'https://api.sandbox.paypal.com';

router.post('/create/', function(req, res) {
    console.log(req.body);
    var options = {
        uri: sanboxUrl + '/v2/checkout/orders',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body: req.body,
        json: true
            
    };
    initialize().then(function(access_token){
        options.headers.Authorization = 'Bearer '+access_token;
        request(options, function (err, response) {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            console.log(response.body);
            res.json(response.body);
        });
    }, function(err){
        console.log(err);
    });
});

//coming from web payment sdk
router.post('/capture/', function(req, res) {
    var options = {
        uri: sanboxUrl + '/v2/checkout/orders/'+req.body.id+'/capture',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          }          
    };
    initialize().then(function(access_token){
        options.headers.Authorization = 'Bearer '+access_token;
        request(options, function (err, response) {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
           // console.log(response.body);
            res.json({
                "status" : "success"
            });
        });
    });
});

//coming from ios
router.get('/success/', function(req, res) {
    console.log(req.query);
    var options = {
        uri: sanboxUrl + '/v2/checkout/orders/'+req.query.token+'/capture',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          }          
    };
    initialize().then(function(access_token){
        options.headers.Authorization = 'Bearer '+access_token;
        request(options, function (err, response) {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            if(response.statusCode == 200 || response.statusCode == 201) {
                res.writeHead(302,{'Location':("com.reena.orderv2://success?token="+req.query.token)});       
            } else {
                console.log(response.statusCode);
                res.writeHead(302,{'Location':("com.reena.orderv2://error?token="+req.query.token)});
            }      
            res.end();
        });
    });
});

router.get('/cancel/', function(req, res) {
    console.log(req.query);
    res.writeHead(302,{'Location':("com.reena.orderv2://cancel?token="+req.query.token)}); 
    res.end();
});


module.exports = router;
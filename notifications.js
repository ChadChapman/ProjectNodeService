const express = require('express');
const bodyParser = require("body-parser");
let db = require('../utilities/utils').db;
var router = express.Router();
router.use(bodyParser.json());

var request = require('request');

var fullBody = new Object();
var key1 = "to";
var key2 = "collapse_key";
var value2 = "type_a";
var key3 = "notification";
var value3 = {
    body : "You have new message(s)",
    title: "Rabbit Chat"
};
fullBody[key1] = "//AIzaSyBBNEl1Ke7B0ondnN7CIct7ByJ0Ppo5cjQ ";
fullBody[key2] = value2;
fullBody[key3] = value3;

console.log(process.env);
var options = {
    url: 'https://fcm.googleapis.com/fcm/send',
    method: 'POST',
    body: JSON.stringify(fullBody),
    headers: {
      'Authorization' : 'key=AAAA0rKFNeY:APA91bHgUlbG7Cr4_rN1vidGntH98Cg1xhxTRaPhG-jPTZEKSa0wCQrWS8mKq7Me3jIOktQQJZVrWi2wRWWe6LhF7SMSGlUfAzUZc4k9S_2PfgIO1DcjeQIQdOWSEbMB0yi67DvfSiwH',
      'Content-Type' : 'application/json',
    }
  };

  //test message contents
request(options, function (error, response, body) {
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode); 
    console.log('body:', body)
});



module.exports = router;

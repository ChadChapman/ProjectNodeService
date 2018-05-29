let db = require('../utilities/utils').db;
var request = require('request');
function push_notification(tokens, msg, thesender, thetag) {
    let forwardedMsg = msg;
    let sender = thesender;
    let tag = thetag;
    for (var i in tokens) {
        if (tokens[i].firebase_token != null) {
            handleSingleToken(tokens[i].firebase_token, forwardedMsg, sender, tag);
        }
    }
}

function handleSingleToken(token, message, sender, thetag) {
    let fullBody = new Object();
    let key1 = "to";
    let key2 = "collapse_key";
    let value2 = "type_a";
    let key3 = "notification";
    let value3 = {
        body : message,
        title: sender,
        icon : "ic_chat",
        tag : thetag,
        sound: "default"
    };

    // Passing the argument token here
    fullBody[key1] = token;
    fullBody[key2] = value2;
    fullBody[key3] = value3;
    
    // The options of POST request 
    let options = {
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        body: JSON.stringify(fullBody),
        headers: {
        // 'Authorization' : process.env.FIREBASE_SERVER_KEY,
        'Content-Type' : 'application/json',
        }
    };
    request(options, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body)
    });
}

module.exports = {push_notification, handleSingleToken};
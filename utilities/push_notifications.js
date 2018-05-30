let db = require('../utilities/utils').db;
var request = require('request');


function push_notification(paramrows, parammsg, paramsender, paramtag, paramchatid) {
    let notificationMsg = parammsg;
    let msgSender = paramsender;
    let notificationTag = paramtag;s
    let msgChatid = paramchatid;
    for (var row in paramrows) {
        if (rows[row].firebase_token != null) {
            handleNotificationEachToken(rows[row].firebase_token, notificationMsg, msgSender, notificationTag, msgChatid);
        }
    }
}

function handleNotificationEachToken(paramtoken, parammsg, paramsender, paramtag, paramchatid) {
    let fullBody = new Object();
    let key1 = "to";
    let key2 = "collapse_key";
    let value2 = "type_a";
    let key3 = "notification";
    let value3 = {
        click_action : "OPEN_ACTIVITY",
        body : parammsg,
        title: paramsender,
        icon : "ic_chat",
        tag : paramtag,
    //    sound: "default"
    };
    let key4 = "data";
    let value4 = {
        chatid : paramchatid,
        chatname: paramtag
    };

    // Passing the argument token here
    fullBody[key1] = token;
    fullBody[key2] = value2;
    fullBody[key3] = value3;
    fullBody[key4] = value4;
    
    // The options of POST request 
    let options = {
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        body: JSON.stringify(fullBody),
        headers: {
        'Authorization' : 'key=AAAAgfCdyhA:APA91bF5obqe-ouwa0UYDIpSWKUtBgwvxnShJ422hWfoeKRjzjak6Ki7FP9FWrM73Pkcc4KNzdH4KrDKu43rWeqqHsBfKJoCxIGmPBTwL0-9zRyBC17FjqWJbs5W3numcsm-XxLF4FuM',
        'Content-Type' : 'application/json',
        }
    };
    //function done, async info here
    request(options, function (error, response, body) {
        console.log('error:', error); 
        console.log('statusCode:', response && response.statusCode); 
        console.log('body:', body)
    });
}


module.exports = {push_notification, handleNotificationEachToken};

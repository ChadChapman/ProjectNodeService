

//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());

//Create connection to Heroku Database
let db = require('../utilities/utils').db;
let utils = require('../utilities/utils');

var router = express.Router();

/**
 * Create a brand new chat.  The new chat will have no members associated with it at first.
 * This post returns the chatid and the front-end code must catch that id in order to add
 * ChatMembers to the chat.
 */
router.post("/newChat", (req, res) => {
    
    let chatname = req.body['chatname'];
    if (chatname) {
        db.one(`INSERT INTO Chats(Name) VALUES($1) RETURNING ChatID`, [chatname])
        .then((row) => {
            let chatid = row['chatid'];
            
            res.send({
                success: true,
                message: chatid 
            })
        })
        .catch((err) => {
            res.send({
                success: false,
                error: err
            })
        });
    } else {
        res.send({
            success: false,
            error: "Missing Chat.Name"
        })
    }
});

/**
 * Used to create all chatMembers for a newly created chat.  
 * Send in a chatid and a JSON Array of members who are included in the new chat
 * A new ChatMember will be inserted for each one.
 * Similar to /addChat but tries to eliminate an ep call for every member added
 */
router.post("/addNewChatMembers", (req, res) => {
    //take in a string, tokenize it to an array:

    let chatid = req.body['chatid'];
    //not sure if javascript will modify the above one or not, better make a second
    let idStringToSplit= req.body['chatidtosplit'];
    var usernamesArr = idStringToSplit.split("+");
    console.log("number of users in chat = " + usernamesArr.length)
    var usernamesNotFoundArr = new Array(1);
    var errorOccured = true;
    for (var i = 0; i < usernamesArr.length; i++) {
        //get the memberid out of it first
        var addMemberUsername = usernamesArr[i];
        console.log("add this username = " + addMemberUsername);
        //var addMemberID = getMemberIDFromUsername(addMemberUsername);
        // getMemberID(function(addMemberID){
        //     console.log("add this memberID = " + addMemberID);
        // });
        getMemberID(getMemberIDFromUsernameCallback);
        
        //if (addMemberID > 0) {
        //errorOccured = (errorOccured && utils.addMemberID(chatid,addMemberID));
        //} else {
          //  usernamesNotFoundArr.push(addMemberUsername);
        //}
    }
    res.send({
                success: errorOccured,
                error: "whelp something borked on the insert new members part",
                notfound: usernamesNotFoundArr.toString()
            })
        })

        getMemberID(function(addMemberID){
            console.log("add this memberID = " + addMemberID);
        });

        function getMemberIDFromUsernameCallback() {
            console.log(addMemberUsername);
            paramUsername = addMemberUsername;
            memberID = -8;
            query = `SELECT memberid
                    FROM members
                    WHERE username = $1`
            db.one(query, [paramUsername])
            .then((data) => {
              //return noErrorsOccured;
              memberID = data.memberid;
              //return memberID;
              //id = data.body['memberid'];
              //console.log(id);
              //console.log("memberid fetched from username = " + data.memberid);
              console.log("id being returned = " + memberID);
              })   
            .catch((err) => {
              return -99;
              console.log(err.toString());
              console.log("error occured getting memberid from the username");
              
              });
            return memberID;
          }



          /**
 * Used to create chatMembers.  Send in a chatid and a memberid(could be current user or one of 
 * thier contacts) and ChatMember will be inserted.
 */
router.post("/addChat", (req, res) => {
    let chatid = req.body['chatid'];
    let memberid = req.body['memberid'];

    if (chatid && memberid) {
        db.none(`INSERT INTO ChatMembers(ChatID, MemberID) VALUES($1, $2)`, [chatid, memberid])
        .then(() => {
            res.send({
                success: true
            })
        })
        .catch((err) => {
            res.send({
                success: false,
                error: err
            })
        });
    } else {
        res.send({
            success: false,
            error: "Missing chatid or memberid"
        })
    }
})

/**
 * This can be used to retrieve the chatids of chats between memberA(currentUser) and memberB(some
 * contact they have queried).  With the ids you can use the messages/getMessages to retrieve the
 * messages associated with those chats.
 */
router.post("/getChatsByContact", (req, res) => {
    let userA = req.body['ida'];
    let userB = req.body['idb'];
    let chatNumber = req.body['chatnumber'];
    if (userA && userB && chatNumber) {
        query = `SELECT C.ChatID FROM
        (SELECT CM.ChatID FROM ChatMembers AS CM 
            INNER JOIN ChatMembers AS CM1
            ON CM.ChatID = CM1.ChatID AND CM.MemberID = $1 AND CM1.MemberID = $2) AS C
        INNER JOIN
        (SELECT M.ChatID, M.Message, M.TimeStamp FROM Messages AS M
        INNER JOIN
        (SELECT M1.ChatID, MAX(M1.TimeStamp) AS TS
        FROM Messages AS M1 GROUP BY M1.ChatID) AS M2
        ON M.ChatID = M2.ChatID AND M.TimeStamp = M2.TS) AS M3
        ON C.ChatID = M3.ChatID
        ORDER BY M3.TimeStamp DESC
        LIMIT $3`

        db.manyOrNone(query, [userA, userB, chatNumber])
        .then((data) => {
            res.send({
                success: true,
                data: data
            })
        })
        .catch((err) => {
            res.send({
                success: false,
                error: err
            })
        });
    } else {
        res.send({ 
            success: false,
            error: "Missing ida or idb or chatnumber"
        })
    }
})

/**
 * This should list out all recent messages with any opened chats.
 */
router.post("/getRecentChat", (req, res) => {
    let userMemberID = req.body['memberid'];
    let query = `SELECT Messages.message, Messages.chatid,messages.timestamp
    from 
    (SELECT Distinct messages.chatid, MAX(messages.timestamp) AS signin
    FROM messages
    GROUP BY messages.chatid
    Order by signin desc) as newChat inner join messages 
    on newChat.chatid=messages.chatid and messages.timestamp = signin
    inner join 
    (SELECT chatmembers.chatid
    from chatmembers
    where chatmembers.memberid = $1) as open on
    messages.chatid = open.chatid
    order by signin desc`
    db.manyOrNone(query,userMemberID)
    .then((data) => {
        res.send({
            success: true,
            contacts: data
        
        });
    }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
    });
});







// /**
//  * Send in a memberid and the number of chats you want and this will return that number of chats, ordered
//  * by most recent posts.  With this list of ids you can then use messages/getmessages to retrieve 
//  * the messages posted on any particular chat. 
//  */
// router.post("/getRecentChats", (req, res) => {
//     let memberid = req.body['memberid'];
//     let chatnumber = req.body['chatnumber'];
//     if (memberid && chatnumber) {
//         query = `SELECT C.ChatID FROM
//         (SELECT ChatID FROM ChatMembers WHERE ChatMembers.MemberID = $1) AS C
//         INNER JOIN
//         (SELECT M.ChatID, M.Message, M.TimeStamp FROM Messages AS M
//         INNER JOIN
//         (SELECT M1.ChatID, MAX(M1.TimeStamp) AS TS
//         FROM Messages AS M1 GROUP BY M1.ChatID) AS M2
//         ON M.ChatID = M2.ChatID AND M.TimeStamp = M2.TS) AS M3
//         ON C.ChatID = M3.ChatID
//         ORDER BY M3.TimeStamp DESC
//         LIMIT $2`

//         db.manyOrNone(query, [memberid, chatnumber])
//         .then((data) => {
//             res.send({
//                 success: true,
//                 chatids: data
//             })
//         })
//         .catch((err) => {
//             res.send({
//                 success: false,
//                 error: err
//             })
//         });
//     } else {
//         res.send({
//             success: false,
//             error: "Missing memberid or chatnumber"
//         })
//     }
// });


module.exports = router;




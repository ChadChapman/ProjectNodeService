

//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

var router = express.Router();

/**
 * Create a brand new chat.  The new chat will have no members associated with it at first.
 * This post returns the chatid and the front-end code must catch that id in order to add
 * ChatMembers to the chat.
 */
router.post("/newChat", (req, res) => {
    // let memberid = req.body['memberid'];
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
            error: "Missing Chat.Name or MemberID"
        })
    }
});

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
 * Send in a memberid and the number of chats you want and this will return that number of chats, ordered
 * by most recent posts.  With this list of ids you can then use messages/getmessages to retrieve 
 * the messages posted on any particular chat. 
 */
router.post("/getRecentChats", (req, res) => {
    let memberid = req.body['memberid'];
    let chatnumber = req.body['chatnumber'];
    if (memberid && chatnumber) {
        query = `SELECT C.ChatID FROM
        (SELECT ChatID FROM ChatMembers WHERE ChatMembers.MemberID = $1) AS C
        INNER JOIN
        (SELECT M.ChatID, M.Message, M.TimeStamp FROM Messages AS M
        INNER JOIN
        (SELECT M1.ChatID, MAX(M1.TimeStamp) AS TS
        FROM Messages AS M1 GROUP BY M1.ChatID) AS M2
        ON M.ChatID = M2.ChatID AND M.TimeStamp = M2.TS) AS M3
        ON C.ChatID = M3.ChatID
        ORDER BY M3.TimeStamp DESC
        LIMIT $2`

        db.manyOrNone(query, [memberid, chatnumber])
        .then((data) => {
            res.send({
                success: true,
                chatids: data
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
            error: "Missing memberid or chatnumber"
        })
    }
});


module.exports = router;




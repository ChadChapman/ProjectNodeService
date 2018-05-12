//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

//Create a connection to Heroku Database
let db = require('../utilities/utils').db;

var router = express.Router();

router.post('/sendMessages', (req, res) => {
    let username = req.body['username'];
    let message = req.body['message'];
    let chatId = req.body['chatId'];

    if(!username || !message || !chatId){
        res.send({
            success: false,
            error: "Username, message, or chatId not supplied!"

        })
        return;
    }
    let insert = "INSERT INTO Messages(ChatId, Message, MemberId) SELECT $1, $2, MemberId FROM Members WHERE Username = $3"

    db.none(insert, [chatId, message, username])
    .then(() => {
        res.send({
            success: true
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err,
        });
    });

});

router.get("/getMessages", (req, res) => {
    let chatId = req.query['chatId'];
    let after = req.query['after'];

    let query = `SELECT Members.Username, Messages.Message, 
                 to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD HH24:MI:SS.US' ) AS Timestamp
                 FROM Messages
                 INNER JOIN Members ON Messages.MemberId=Members.MemberId
                 WHERE ChatId=$2 AND
                 Timestamp  AT TIME ZONE 'PDT' > $1
                 ORDER BY Timestamp ASC`
    db.manyOrNone(query, [after, chatId])
    .then((rows) => {
        res.send({
            messages: rows
        })
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        })
    });
});

/**
 * retrieve all the messages / chats (chats for now) associated with the memberid in request object.
 * orders by primary key instead of timestamp, because it is easier, more reliable and I'm lazy
 * 
 * it is chats apparently and still a timestamp i guess
 */
router.post("/contactChats", (req, res) => {
    let chatId = req.query['chatId'];
    let after = req.query['after'];

    let query = `SELECT Members.Username, Messages.Message,
                 to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD HH24:MI:SS.US' ) AS Timestamp
                 FROM Messages
                 INNER JOIN Members ON Messages.MemberId=Members.MemberId
                 WHERE ChatId=$2 AND
                 Timestamp  AT TIME ZONE 'PDT' > $1
                 ORDER BY Timestamp ASC`
    db.manyOrNone(query, [after, chatId])
    .then((rows) => {
        res.send({
            success: true,
            messages: rows
        })
    }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
    });
});


module.exports = router;
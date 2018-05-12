

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


module.exports = router;




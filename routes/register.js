//Test
//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());
//We use this create the SHA256 hash
const crypto = require("crypto");

//values for emails
const sender = "chatrabbit2@gmail.com";
const verifyMessage = "Verify your account with RabbitChat!!";

//Create connection to Heroku Database
let db = require('../utilities/utils').db;
let getHash = require('../utilities/utils').getHash;
let sendEmail = require('../utilities/utils').sendEmail;
var router = express.Router();

router.post('/', (req, res) => {
    res.type("application/json");
    //Retrieve data from query params
    var first = req.body['first'];
    var last = req.body['last'];
    var username = req.body['username'];
    var email = req.body['email'];
    var password = req.body['password'];
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(first && last && username && email && password) {
        //We're storing salted hashes to make our application more secure
        //If you're interested as to what that is, and why we should use it
        //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
        let salt = crypto.randomBytes(32).toString("hex");
        let salted_hash = getHash(password, salt);
        //Use .none() since no result gets returned from an INSERT in SQL
        //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
        //If you want to read more: https://stackoverflow.com/a/8265319
        let params = [first, last, username, email, salted_hash, salt];
        db.none("INSERT INTO MEMBERS(FirstName, LastName, Username, Email,Password, Salt) VALUES ($1, $2, $3, $4, $5, $6)", params)
        .then(() => {
            //Generate a verfication code
            var verificationCode = Math.floor(Math.random() * 9999);
            //We successfully added the user, let the user know
            res.send({
                success: true,
                message: verificationCode
            });
            let email = req.body['email'];
            sendEmail(sender, email, verifyMessage, "Your verifcation code is " + verificationCode);
        }).catch((err) => {
            //log the error
            console.log(err);
            //If we get an error, it most likely means the account already exists
            //Therefore, let the requester know they tried to create an account that already exists
            res.send({
                success: false,
                error: err
            });
        });
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required user information"
        });
    }
});

router.post('/saveVerificationCode', (req, res) => {
    let memberid = req.body['memberid'];
    let code = req.body['message'];
    if (memberid && code) {
        query = `UPDATE Members
                 SET Verification = $2
                 WHERE MemberID = $1`
        db.none(query, [memberid, code])
        .then((row) => {
            res.send({
                success: true
            })
        })
        .catch((err) => {
            res.send({
                success: false,
                error: err
            })
        })
                 
    }
})

module.exports = router;
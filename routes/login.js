//Test
const express = require('express');
const app = express();

const FormData = require("form-data");

const bodyParser = require("body-parser");

app.use(bodyParser.json());

const crypto = require("crypto");

let db = require("../utilities/utils").db;
let getHash = require("../utilities/utils").getHash;
let sendEmail = require('../utilities/utils').sendEmail;

//values for emails
const sender = "chatrabbit2@gmail.com";
const verifyMessage = "Reverify your account with RabbitChat!!";

var router = express.Router();

router.post("/", (req, res) => {
    let user = req.body['username'];
    let theirPw = req.body['password'];
    if(user && theirPw) {
        db.one("SELECT MemberID, Password, Salt, Verification FROM MEMBERS WHERE Username = $1", [user])
        .then(row => {
            let salt = row['salt'];
            //retrieve our copy of the password
            let ourSaltedHash = row['password']
            //combine their password with our salt, then hash
            let theirSaltedHash = getHash(theirPw, salt);
            //Did their salted hash match our salted hash?
            let wasCorrectPassword = ourSaltedHash === theirSaltedHash
            //Send correct pass or no
            //Retrieve verification code
            let verification = row['verification'];
            console.log(verification);
           var userMemberID;
            if(wasCorrectPassword) {
                userMemberID = row['memberid'];
            }
            res.send({
                success: wasCorrectPassword,
                message: userMemberID,
                code: verification
              
            });
        })
        //More than one row should not be found since we have a constraint
        .catch((err) => {
            res.send({
                success: false,
                message: err
            });
        });
    } else {
        res.send({
            success: false,
            message: "Missing credentials"
        });
    }
});

router.post("/sendEmail", (req, res) => {
    let memberid = req.body['memberid'];
    if (memberid) {
        var query = `SELECT Email, Verification FROM Members WHERE MemberID = $1`
        db.one(query, [memberid])
        .then((row) => {
            console.log(row['email']);
            sendEmail(sender, row['email'], verifyMessage, "Your verifcation code is " + row['verification']);
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
            error: "Missing memberid"
        })
    }
});

router.post("/verify", (req, res) => {
    let memberid = req.body['memberid'];
    if (memberid) {
        query = `UPDATE Members SET Verification = 1 WHERE MemberID = $1`
        db.none(query, [memberid])
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
    }
});

router.post("/changePassword", (req, res) => {
    let username = req.body['username'];
    let password = req.body['password'];

    if (username && password) {

        var verificationCode = Math.floor(Math.random() * 9999);
        let salt = crypto.randomBytes(32).toString("hex");
        let salted_hash = getHash(password, salt);
        let params = [username, salted_hash, salt, verificationCode];
        var query = `UPDATE Members SET Password = $2,
                                        SALT = $3,
                                        Verification = $4
                        WHERE Username = $1 RETURNING Email`
        db.one(query, params)
        .then((row) => {
            res.send({
                success: true
            })
            console.log(verificationCode);
            let email = row['email'];
            console.log(email);
            sendEmail(sender, email, verifyMessage, "Your verifcation code is " + verificationCode);
        }).catch((err) => {
            res.send({
                success: false,
                error: err
            })
        });
    } else {
        res.send({
            success: false,
            error: "Missing username or password"
        })
    }
});



module.exports = router;
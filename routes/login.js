//Test
const express = require('express');
const app = express();

const FormData = require("form-data");

const bodyParser = require("body-parser");

app.use(bodyParser.json());

let db = require("../utilities/utils").db;
let getHash = require("../utilities/utils").getHash;

var router = express.Router();

router.post("/", (req, res) => {
    let user = req.body['username'];
    let theirPw = req.body['password'];
    if(user && theirPw) {
        db.one("SELECT Password, Salt FROM MEMBERS WHERE Username = $1", [user])
        .then(row => {
            let salt = row['salt'];
            //retrieve our copy of the password
            let ourSaltedHash = row['password']
            //combine their password with our salt, then hash
            let theirSaltedHash = getHash(theirPw, salt);
            //Did their salted hash match our salted hash?
            let wasCorrectPassword = ourSaltedHash === theirSaltedHash
            //Send correct pass or no
            res.send({
                success: wasCorrectPassword
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

module.exports = router;
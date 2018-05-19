//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

const FormData = require("form-data");

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());

//Create connection to Heroku Database
let db = require('../utilities/utils').db;
var router = express.Router();

router.post('/', (req, res) => {
    let MemberID = req.body['ID'];
    if(MemberID) {
        //Using the 'one' method means that only one row should be returned
        db.one('SELECT FirstName,LastName,Email,Username FROM Members WHERE MemberID=$1', [MemberID])
        //If successful, run function passed into .then()
        .then(row => {
            res.send({
                success: true,
                username: row['username'],
                firstname: row['firstname'],
                lastname: row['lastname'],
                email: row['email']
            });
        })
        //More than one row shouldn't be found, since table has constraint on it
        .catch((err) => {
            //If anything happened, it wasn't successful
            res.send({
                success: false,
                message: err
            });
        });
    } else {
        res.send({
            success: false,
            message: 'missing credentials'
        });
    }
});

module.exports = router;

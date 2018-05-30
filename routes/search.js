//express is the framework we're going to use to handle requests
const express = require('express');

const bodyParser = require("body-parser");
const FormData = require("form-data");

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

var router = express.Router();
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.post('/', (req, res) => {
    let username = req.body['username'];
    let email = req.body['email'];
    let firstName = req.body['firstname'];
    let lastName = req.body['lastname'];

    if (username)  {
        db.one('SELECT * FROM Members WHERE Username=$1', [username])
        .then((data) => {
            res.send({
                success: true,
                firstname: data.firstname,
                lastname: data.lastname,
                memberid: data.memberid
            });
        }).catch((err) => {
            res.send({
                message: 'error when searching for username',
                success: false
            });
        });
    } else if (email) {
        db.one('SELECT * FROM Members WHERE Email=$1', [email])
        .then((data) => {
            res.send({
                success: true,
                firstname: data.firstname,
                lastname: data.lastname,
                memberid: data.memberid
            });
        }).catch((err) => {
            res.send({
                message: 'error when searching for email',
                success: false
            });
        });
    } else if (firstName && lastName) {
        db.one('SELECT * FROM Members WHERE Firstname=$1 AND Lastname=$2', [firstName, lastName])
        .then((data) => {
            res.send({
                success: true,
                firstname: data.firstname,
                lastname: data.lastname,
                memberid: data.memberid
            });
        }).catch((err) => {
            res.send({
                message: 'error when searching for first and last name',
                success: false
            });
        });
    } else {
        res.send({
            success: false,
            message: 'missing search information'
        });
    }
});

module.exports = router;
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



router.get('/savedLoc', (req, res) => {
    let memberid = req.query['memberid'];
    let long = req.query['long'];
    let lat = req.query['lat'];
    let city = req.query['city'];

    if(memberid&&long&&lat&&city) {
        db.manyOrNone('SELECT * FROM Locations WHERE MemberID=$1 and Long = $2 and Lat = $3 and Nickname = $4', [memberid,long,lat,city])
        //If successful, run function passed into .then()
        .then(row => {
            res.send({
                success: true
            });
        })
        .catch((err) => {
            //If anything happened, it wasn't successful
            res.send({
                success: false
            });
        });
    } else {
        res.send({
            success: false,
            message: 'missing credentials',
            memberid: memberid,
            long: long,
            lat: lat,
            city: city

        });
    }
});


router.post('/addLoc', (req, res) => {
    let memberid = req.body['memberid'];
    let long = req.body['long'];
    let lat = req.body['lat'];
    let city = req.body['city'];

    if(memberid&&long&&lat&&city) {

        db.none('INSERT INTO Locations(MemberID, Nickname, Lat,Long) VALUES ($1,$2,$3,$4)', [memberid,city,lat,long])
        //If successful, run function passed into .then()
        .then(row => {
            res.send({
                success: true,
            });
        })
        //More than one row shouldn't be found, since table has constraint on it
        .catch((err) => {
            //If anything happened, it wasn't successful
            res.send({
                success: false,
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

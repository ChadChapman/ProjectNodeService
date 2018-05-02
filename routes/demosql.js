//Test
//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

// //pg-promise is a postgres library that uses javascript promises
// const pgp = require('pg-promise')();
// //We have to set ssl usage to true for Heroku to accept our connection
// pgp.pg.defaults.ssl = true;
//Create connection to Heroku Database
// let db;
// //Uncomment next line and change the string to your DATABASE_URL
// db = pgp('postgres://nhalvucsuqwpfk:7cc02a001a0dec4a123302faabb938c9530ec5642eb9378092a7ba91802ae1d8@ec2-54-221-192-231.compute-1.amazonaws.com:5432/dv4igi32q700c');

// if(!db) {
//     console.log("SHAME! Follow the intructions and set your DATABASE_URL correctly");
//     process.exit(1);
// }

var router = express.Router();

router.post("/", (req, res) => {
    var name = req.body['name'];
    if (name) {
        let params = [name];
        db.none("INSERT INTO DEMO(Text) VALUES ($1)", params)
        .then(() => {
            //We successfully addevd the name, let the user know
            res.send({
                success: true
            });
        }).catch((err) => {
        //log the error
        console.log(err);
        res.send({
            success: false,
            error: err
            });
        });
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required information"
        });
    }
});

router.get("/", (req, res) => {
    db.manyOrNone('SELECT Text FROM Demo')
    //If successful, run function passed into .then()
    .then((data) => {
        res.send({
            success: true,
            names: data
        });
    }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
    });
});
module.exports = router;

//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

const FormData = require("form-data");

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());
//We use this create the SHA256 hash
const crypto = require("crypto");
// //pg-promise is a postgres library that uses javascript promises
// const pgp = require('pg-promise')();
// //We have to set ssl usage to true for Heroku to accept our connection
// pgp.pg.defaults.ssl = true;

// //Create connection to Heroku Database
// let db;
// //Uncomment next line and change the string to your DATABASE_URL
// db = pgp('postgres://nhalvucsuqwpfk:7cc02a001a0dec4a123302faabb938c9530ec5642eb9378092a7ba91802ae1d8@ec2-54-221-192-231.compute-1.amazonaws.com:5432/dv4igi32q700c');

// if(!db) {
//    console.log("SHAME! Follow the intructions and set your DATABASE_URL correctly");
//    process.exit(1);
// }

var login = require('./routes/login.js');
app.use('/login', login);

var reg = require('./routes/register.js');
app.use('/register', reg);

var hello = require('./routes/hello.js');
app.use('/hello', hello);

var params = require('./routes/params.js');
app.use('/params', params);

var waiting = require('./routes/waiting.js');
app.use('/wait', waiting);

var demosql = require('./routes/demosql.js');
app.use('/demosql', demosql);

var contacts = require('./routes/contacts.js');
app.use('/contacts', contacts);

var chat = require('./routes/chat.js');
app.use('/chat', chat);

var getinfo = require('./routes/getinfo.js');
app.use('/getinfo', getinfo);



/*
 * Return HTML for the / end point. 
 * This is a nice location to document your web service API
 * Create a web page in HTML/CSS and have this end point return it. 
 * Look up the node module 'fs' ex: require('fs');
 */
app.get("/", (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    for (i = 1; i < 7; i++) {
        //write a response to the client
        res.write('<h' + i + ' style="color:blue">Hello World!</h' + i + '>'); 
    }
    res.end(); //end the response
});

/* 
* Heroku will assign a port you can use via the 'PORT' environment variable
* To accesss an environment variable, use process.env.<ENV>
* If there isn't an environment variable, process.env.PORT will be null (or undefined)
* If a value is 'falsy', i.e. null or undefined, javascript will evaluate the rest of the 'or'
* In this case, we assign the port to be 5000 if the PORT variable isn't set
* You can consider 'let port = process.env.PORT || 5000' to be equivalent to:
* let port; = process.env.PORT;
* if(port == null) {port = 5000} 
*/ 
app.listen(process.env.PORT || 5000, () => {
    console.log("Server up and running on port: " + (process.env.PORT || 5000));
});
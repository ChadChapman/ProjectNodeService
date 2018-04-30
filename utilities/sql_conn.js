const pgp = require('pg-promise')();
//We have to set ssl usage to true for Heroku to accept our connection
pgp.pg.defaults.ssl = true;
//Create connection to Heroku Database
const db = pgp('postgres://nhalvucsuqwpfk:7cc02a001a0dec4a123302faabb938c9530ec5642eb9378092a7ba91802ae1d8@ec2-54-221-192-231.compute-1.amazonaws.com:5432/dv4igi32q700c');
if(!db) {
    console.log("SHAME! Follow the intructions and set your DATABASE_URL correctly");
    process.exit(1);
}
module.exports = db;
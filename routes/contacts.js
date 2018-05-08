//Test
/*
we will want to:
    return all verified contacts
    return contacts who we connected with who have recently verified the contact connection
    return contacts who have requested a contact connection
    send a new contact request
    cancel a contact request
    return all current unverified contact requests we sent
    ???
*/
//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());

//Create connection to Heroku Database
let db = require('../utilities/utils').db;
/*
    //pg-promise is a postgres library that uses javascript promises
    const pgp = require('pg-promise')();
    //We have to set ssl usage to true for Heroku to accept our connection
    pgp.pg.defaults.ssl = true;
    Create connection to Heroku Database
    let db;
    //Uncomment next line and change the string to your DATABASE_URL
    db = pgp('postgres://nhalvucsuqwpfk:7cc02a001a0dec4a123302faabb938c9530ec5642eb9378092a7ba91802ae1d8@ec2-54-221-192-231.compute-1.amazonaws.com:5432/dv4igi32q700c');

    if(!db) {
        console.log("SHAME! Follow the intructions and set your DATABASE_URL correctly");
        process.exit(1);
    }
*/
var router = express.Router();

/*
    This will serve as the "base" get function, will return all contacts associated with this user's
    memberID.
*/
router.post("/", (req, res) => {
    let userMemberID = req.body['my_MemberID'];
    db.manyOrNone('SELECT Username FROM Contacts, Members M WHERE MemberID_A = $1 AND MemberID_B = M.MemberID', [userMemberID]) //refactor to make just verified contacts?
   // db.manyOrNone('SELECT MemberId_B FROM Contacts WHERE MemberID_A = $1', [userMemberID])
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

router.post("/update", (req, res) => {
    let userMemberID = req.body['my_MemberID'];
    db.manyOrNone('SELECT Username FROM Contacts, Members M WHERE MemberID_A = $1 AND MemberID_B = M.MemberID', [userMemberID]) //refactor to make just verified contacts?
   // db.manyOrNone('SELECT MemberId_B FROM Contacts WHERE MemberID_A = $1', [userMemberID])
    //If successful, run function passed into .then()
    .then((data) => {
        if (data < 1) {
            res.send({
                success: true,
                updates: false,    
            })
        } else {
        res.send({
            success: true,
            updates: false,
           // Username, FName, LName, created_at, last_modified, verified, " +
           //             "image_link, display_color 
            });
        }
    }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
    });
});




/*
    This should request a connection for a contact, so perhaps from the list of members we can select a member
    then submit a request to that member to become contacts with them.
    this will require: get the memberID of the member to send request to
        ?send an email to that member to request adding them as a contact?
        writing to Contacts table => this memberID, other memberID, verified=no, 
        timestamp of creation=now, timestamp of last modified=now, 
    
<<<<<<< HEAD
*/

/*
    Initiate a request to another member to become Contacts with each other
    @param1 - MemberID of user initiating the request
    @param2 - MemberId of user receiving the Contacts request

*/
router.post("/request", (req, res) => {
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

// */
// router.post("/", (req, res) => {
//     var name = req.body['name'];
//     if (name) {
//         let params = [name];
//         db.none("INSERT INTO DEMO(Text) VALUES ($1)", params)
//         .then(() => {
//             //We successfully addevd the name, let the user know
//             res.send({
//                 success: true
//             });
//         }).catch((err) => {
//         //log the error
//         console.log(err);
//         res.send({
//             success: false,
//             error: err
//             });
//         });
//     } else {
//         res.send({
//             success: false,
//             input: req.body,
//             error: "Missing required information"
//         });
//     }
// });


/*
    similar to comment in header, the get function will likely need to have mutiple additional end points
    to start:
        all verified contacts associated with this member
            from Contacts all records where memberID = this user's memberID and verified=true,
            then get memberID of all matching records, then return username, ?first and/or last name? of 
            matched users
            further on: status indicator if that contact is active/available right nows
    to add:
        return contacts who we connected with who have recently verified the contact connection
        return contacts who have requested a contact connection
        send a new contact request
        cancel a contact request
        return all current unverified contact requests we sent
        ???

*/

/*
    This will serve as the "base" get function, will return all >>!verified!<< contacts associated with this user's
    memberID.
<<<<<<< HEAD

router.get("/", (req, res) => {
    var userMemberID = req.body['my_MemberID'];
    db.manyOrNone('SELECT MemberID_B FROM Contacts WHERE MemberID_A = userMemberID') //refactor to make just verified contacts?
=======
*/

/*
router.post("/", (req, res) => {
    let userMemberID = req.body['my_MemberID'];
    db.manyOrNone('SELECT Username FROM Contacts, Members M WHERE MemberID_A = $1 AND MemberID_B = M.MemberID', [userMemberID]) //refactor to make just verified contacts?
   // db.manyOrNone('SELECT MemberId_B FROM Contacts WHERE MemberID_A = $1', [userMemberID])

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
<<<<<<< HEAD

router.post("/creatContact", (req, res) => {
    let ida = req.body['ida'];
    let idb = req.body['idb'];
    db.manyOrNone('INSERT INTO Contacts(MemberId_A, MemberID_B) VALUES($1, $2)', ida, idb) //refactor to make just verified contacts?
   // db.manyOrNone('INSERT INTO Contacts(MemberId_A, MemberID_B) VALUES()
    .then(() => {
        res.send({
            success: true,
        });
    }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
    });
});
=======
*/
//>>>>>>> 3945bbbc0679d8072b3cc88be2ec678261acf8dd
module.exports = router;

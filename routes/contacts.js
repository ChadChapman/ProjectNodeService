/*
    This file should handle all CRUD functions for the db table Contacts.
    A breakdown of the actions performed is provided before the methods are declared.
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
var router = express.Router();


/*
we will want to:
    return all verified contacts - done
    return contacts who we connected with who have recently verified the contact connection - //TODO - a bit tricky
    return contacts who have requested a contact connection but not yet verified - done
    send a new contact request - done
    cancel a contact request - done, deletes the contact request, client side should check for verified/non, etc
    return all current unverified contact requests we sent - done
    update a contact row to reflect some change, most likely that it was recently verified  //TODO
    decline a contacts request sent to you - done
    ??? - what else
*/


/*
    This will serve as the "base" get function, will return all verified contacts associated with this user's
    memberID.  can be converted to just '/' if we think that's better
*/
router.post("/verified", (req, res) => {
    let userMemberID = req.body['memberid'];
    let query = `SELECT DISTINCT members.username
                , members.email, members.memberid
                , members.firstname, members.lastname
                FROM contacts
                INNER JOIN members 
                    ON contacts.memberid_a = members.memberid OR
                        contacts.memberid_b = members.memberid
                WHERE verified = $2`
     
    db.manyOrNone(query, [userMemberID, 1])
    .then((data) => {
        res.send({
            success: true,
            contacts: data
        
        });
    }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
    });
});

/*
    sent requests are all the contacts we have initiated in adding
    eg: we sent them a request to connect
    the member who initiates the contacts connection is recorded as memberid_a
*/
router.post("/sentRequest", (req, res) => {
    let userMemberID = req.body['memberid'];
    let query = `SELECT DISTINCT ON (members.username) members.username
                , members.email, members.memberid
                , members.firstname, members.lastname
                , contacts.verified
                FROM contacts
                INNER JOIN members 
                    ON contacts.memberid_a = members.memberid
                ORDER BY members.username`
     
    db.manyOrNone(query, [userMemberID, 1])
    .then((data) => {
        res.send({
            success: true,
            contacts: data
        
        });
    }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
    });
});

/*
   returns the recieved requests, which are all the contacts we have NOT initiated in adding
    eg: we received a request from them to connect
    the member who initiates the contacts connection is recorded as memberid_b
*/
router.post("/recievedRequest", (req, res) => {
    let userMemberID = req.body['memberid'];
    let query = `SELECT DISTINCT ON (members.username) members.username
                , members.email, members.memberid
                , members.firstname, members.lastname
                , contacts.verified
                FROM contacts
                INNER JOIN members 
                    ON contacts.memberid_b = members.memberid
                ORDER BY members.username`
                
     
    db.manyOrNone(query, [userMemberID, 1])
    .then((data) => {
        res.send({
            success: true,
            contacts: data
        
        });
    }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
    });
});

/*
    seems to work so far in postman, creates new contacts records with two params
*/
router.post("/createContact", (req, res) => {
    let ida = req.body['ida'];
    let idb = req.body['idb'];
    db.manyOrNone('INSERT INTO Contacts(MemberId_A, MemberID_B) VALUES($1, $2)', [ida, idb])
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

/*
    Removes a row from Contacts table, permanently.  
    Uses params of both memberID fields to specify which row is deleted.
    In the future we may want to modify or extend this to delete unverified contacts, etc.
    However, my current thought is we can do all of that on the device / front -end then
    simply send a request here to delete after choice has been made on which row is
    being removed.  
    Alternatively, we could simply have contacts contain a "deleted" column so a row can be recovered
    but I'm not sure this is needed or is ever expected by a user.
*/
router.post("/deleteContact", (req, res) => {
    let ida = req.body['ida'];
    let idb = req.body['idb'];
    let query = `DELETE FROM contacts
                WHERE memberid_a = $1 AND memberid_b = $2`
    db.manyOrNone(query, [ida, idb])
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

/*
    Declines a contacts request the current user has recieved.
    This could be handled with a delete instead and maybe in the future that is a better way?
    For now, it is a separate end point but we cna always change that, I thought there
    may be some use of retaining these records for something in the future.
    The declined request is represented in the column "verified" with a sentient value
    of "-9".  I chose that value so there is no accidental confusion on a quick glance to a 
    "1" vs a "-1" yet it is still a small value.  It may make sense to again retain this info as
    a boolean column but for not I think it is ok with just an updated value in verified.
*/
router.post("/declineRequest", (req, res) => {
    let ida = req.body['ida'];
    let idb = req.body['idb'];
    let query = `UPDATE contacts
                SET verified = -9
                WHERE memberid_a = $1 AND memberid_b = $2`
    db.manyOrNone(query, [ida, idb])
    .then((data) => {
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

/*
    Approves a recieved request to make a contacts connection.
    Very similar to the end point for declining a contacts request, this 
    simply changes the value in the "verified" column to 1 to indicate 
    the user has accepted the request.
*/
router.post("/acceptRequest", (req, res) => {
    let ida = req.body['ida'];
    let idb = req.body['idb'];
    let query = `UPDATE contacts
                SET verified = 1
                WHERE memberid_a = $1 AND memberid_b = $2`
    db.manyOrNone(query, [ida, idb])
    .then((data) => {
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

/*
    does not work yet, is on my todo list
*/
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

// beyond here be dragons, just commented out previously used methods,
// should all be deleted after all end points are working correctly
/*
    This should request a connection for a contact, so perhaps from the list
    of members we can select a member
    then submit a request to that member to become contacts with them.
    this will require: get the memberID of the member to send request to
        ?send an email to that member to request adding them as a contact?
        writing to Contacts table => this memberID, other memberID, verified=no, 
        timestamp of creation=now, timestamp of last modified=now, 
    
*/

// /*
//     //I think this is same function as the /create end point above, commenting it out for now
//     Initiate a request to another member to become Contacts with each other
//     @param1 - MemberID of user initiating the request
//     @param2 - MemberId of user receiving the Contacts request

// */
// router.post("/request", (req, res) => {
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
router.get("/", (req, res) => {
    var userMemberID = req.body['my_MemberID'];
    db.manyOrNone('SELECT MemberID_B FROM Contacts WHERE MemberID_A = userMemberID') //refactor to make just verified contacts?

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
*/


module.exports = router;

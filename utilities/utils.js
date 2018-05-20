//Test
//Get the connection to Heroku Database
let db = require('./sql_conn.js');
var nodemailer = require('nodemailer');


//We use this create the SHA256 hash
const crypto = require("crypto");
const FormData = require("form-data");
function sendEmail(from, to, subject, message) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'chatrabbit2@gmail.com',
          pass: 'rabbitchat450!'
        }
      });
      
      var mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: message
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

/**
* Method to get a salted hash.
* We put this in its own method to keep consistency
* @param {string} pw the password to hash
* @param {string} salt the salt to use when hashing
*/
function getHash(pw, salt) {
    return crypto.createHash("sha256").update(pw + salt).digest("hex");
}

function insertChatMember(paramChatID, paramMemberID) {
  //use logical and so if an error occurs, the 'false' will stick
  var noErrorsOccured = true;
  query = `INSERT INTO chatmembers
          (ChatID, MemberID)
          VALUES ($1, $2)`
  db.none(query, [paramChatID, paramMemberID])
  .then(() => {
    //return noErrorsOccured;
    console.log("record inserted++ CHATID, MEMBERID" + paramChatID + " " + paramMemberID);
    })   
  .catch((err) => {
    noErrorsOccured = false;
    });
    
  return noErrorsOccured;
}

function getMemberIDFromUsername(paramUsername) {
  var memberID = -1;
  query = `SELECT memberid
          FROM members
          WHERE username = $1`
  db.none(query, [paramUsername])
  .then((data) => {
    //return noErrorsOccured;
    memberID = data;
    console.log("memberid fetched from username = " + memberID);
    })   
  .catch((err) => {
    memberID = -99;
    console.log("error occured getting memberid from the username in utils");
    });
  return memberID;
}

module.exports = {
    db, getHash, sendEmail, insertChatMember, getMemberIDFromUsername
};


const express = require('express');
const bodyParser = require("body-parser");
let db = require('../utilities/utils').db;
var router = express.Router();
router.use(bodyParser.json());

/*
*   Updates the Firebase InstanceID Token received by the user when they fire up the app where it was previously dead.
*/
router.post('/', (req, res) => {
    
    let memberid = req.body['mymemberid'];
    console.log("memberid => " + memberid);
    let iidtoken = req.body['token'];
    console.log("token => " + iidtoken);
    
    db.none("UPDATE members SET fb_iidtoken = $1 WHERE memberid = $2", [iidtoken, memberid])
    .then(()=>{
        res.send({
            success: true,
            message : "new iidtoken saved in db"
        });
    })
    .catch(err => {
        res.send({
            success: false,
            message : "iidtoken NOT updated in db"
        });
    });
});

module.exports = router;
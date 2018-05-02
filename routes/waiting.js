//Test
//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
var router = express.Router();
/*
* Hello world functions below...
*/
router.get("/wait", (req, res) => {
    res.send({
        message: "Hello, you are waiting on a GET request"
    });
});
router.post("/wait", (req, res) => {
    res.send({
        message: "Hello, you waiting on a POST request"
    });
});
module.exports = router;
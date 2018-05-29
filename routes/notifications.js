const express = require('express');
const bodyParser = require("body-parser");
let db = require('../utilities/utils').db;
var router = express.Router();
router.use(bodyParser.json());
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    //get
    res.send('this is a register function');
});

module.exports = router;
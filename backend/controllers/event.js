const eventRouter = require('express').Router()

var config = require('../utils/config.js');
var mysql = require('mysql');
config.AWS_CONFIG.connectionLimit = 10;
const AWS_CONNECTION = mysql.createPool(config.AWS_CONFIG);
helpers = require('../tools/helpers')


eventRouter.get('/', (req, res) => {
    
})



module.exports = eventRouter
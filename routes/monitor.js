var express = require('express');
var router = express.Router();
var dbcon = require("../database/connection");
var Sequelize = require("sequelize");
var Event = require("../models/index").Event;
var User = require("../models/index").User;

/* GET events listing. */
router.get('/', function(req, res, next) {
  Event.findAll({ include: [ User ] }).then((events) => 
    res.render("event/index", {
      events: events
    })
  )
});

module.exports = router;

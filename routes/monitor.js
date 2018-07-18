var express = require('express');
var router = express.Router();
var dbcon = require("../database/connection");
var Sequelize = require("sequelize");
var Event = require("../models/event")(dbcon, Sequelize);

/* GET events listing. */
router.get('/', function(req, res, next) {
  Event.findAll().then((events) => 
    res.render("event/index", {
      events: events
    })
  )
});

module.exports = router;

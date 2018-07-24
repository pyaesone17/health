var express = require("express");
var router = express.Router();
var dbcon = require("../database/connection");
var Sequelize = require("sequelize");
var User = require("../models/user")(dbcon, Sequelize);
var Event = require("../models/event")(dbcon, Sequelize);
var Record = require("../models/index").records
var reportData = require("../services/reportData");
var moment = require("moment");
var parseString = require("xml2js").parseString;
var fs = require("fs");
var multer = require("multer");
var upload = multer({ dest: 'uploads/' })

/* GET users listing. */
router.get("/", function(req, res, next) {
    User.findAll().then(users =>
        res.render("user/index", {
            users: users,
            user: req.user
        })
    );
});

/* CREATE users listing. */
router.get("/create", function(req, res, next) {
    res.render("user/create")
});

/* CREATE records listing. */
router.post("/create", function(req, res, next) {
    User.create({ 
        type: 'user',
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email : req.body.email,
        password: req.body.password
    }).then(() =>
        res.redirect('/backend/users')
    );
});

/* CREATE VIEW users listing. */
router.get("/:id/create-record", function(req, res, next) {
    res.render("user/create-record")
});

/* CREATE records listing. */
router.post("/:id/create-record", function(req, res, next) {
    Record.create({ 
        user_id: req.params.id,
        unit: 'count',
        value: req.body.steps,
        creationDate: moment(req.body.creationDate).format("YYYY-MM-DD HH:mm:ss")
    }).then(() =>
        res.redirect('/backend/users')
    );
});

/* CREATE records listing. */
router.get("/:id/export-zip", function(req, res, next) {
    res.render("user/export-zip")
});


/* CREATE records listing. */
router.post("/:id/export-zip",upload.single('file'), function(req, res, next) {
    fs.readFile(req.file.path, { encoding: "utf-8" }, function(err, data) {
        parseString(data, function(err, result) {
            let data = [];
    
            result.HealthData.Record.forEach(function(record) {
                $ = record.$;
                console.log($);
                $.creationDate = moment(
                    $.creationDate,
                    "YYYY-MM-DD HH:mm:ss Z"
                ).format("YYYY-MM-DD HH:mm:ss");
                $.startDate = moment($.startDate, "YYYY-MM-DD HH:mm:ss Z").format(
                    "YYYY-MM-DD HH:mm:ss"
                );
                $.endDate = moment($.endDate, "YYYY-MM-DD HH:mm:ss Z").format(
                    "YYYY-MM-DD HH:mm:ss"
                );
                $.user_id = 1;
                try{
                    Record.create($)
                } catch(e){

                }
            });

            res.redirect('/backend/users')
        });
    });
});


/* GET users details. */
router.get("/:id", function(req, res, next) {
    reportData(req.params.id).then(function(d) {
        jsonData = d[0].map(d => d.toJSON());
        totalWalk = 0;
        jsonData.forEach(d => {
            totalWalk += d.total;
        });

        walkMonthly = d[1].map(data => data.toJSON());
        walkMonthlyKey = d[1].map(data =>
            moment(data.toJSON().creationDate).format("DD")
        );
        
        walkMonthlyValue = d[1].map(data => data.toJSON().total);
        if (walkMonthlyValue.length !== 0) {
          totalMonthlyWalk = walkMonthlyValue.reduce((a,b) => a+b);
        } else {
          totalMonthlyWalk = 0
        }

        prevWalkMonthly = d[2].map(data => data.toJSON());
        prevWalkMonthlyKey = d[2].map(data =>
            moment(data.toJSON().creationDate).format("DD")
        );
        prevWalkMonthlyValue = d[2].map(data => data.toJSON().total);
        if(prevWalkMonthlyValue.length !== 0 ){
          totalPrevMonthlyWalk = prevWalkMonthlyValue.reduce((a,b) => a+b);
        } else {
          totalPrevMonthlyWalk = 0
        }

        todayWalkValue = d[3].map(data => data.toJSON().total);
        if (todayWalkValue.length !== 0) {
            totalTodayWalk = todayWalkValue.reduce((a,b) => a+b);
        } else {
            totalTodayWalk = 0;
        }

        thisYearWalkValue = d[4].map(data => data.toJSON().total);

        if(thisYearWalkValue.length!==0){
          totalThisYearWalk = thisYearWalkValue.reduce((a,b) => a+b);
        } else {
          totalThisYearWalk = 0
        }

        thisWeekWalkValue = d[5].map(data => data.toJSON().total);
        if (thisWeekWalkValue.length !== 0) {
            totalThisWeekWalk = thisWeekWalkValue.reduce((a,b) => a+b);
        } else {
            totalThisWeekWalk = 0;
        }

        walkMonthlyKeyChart = d[6].map(data => {
            return moment(data.toJSON().creationDate, "M").format("MMM");
        });
        walkMonthlyValueChart = d[6].map(data => data.toJSON().total);
        
        bestMonth = {}
        if(d[6].length) {
          bestMonth = d[6]
          .sort((a, b) => {
              a = a.toJSON();
              b = b.toJSON();
              return a.total < b.total;
          })[0]
          .toJSON();
          bestMonth.creationDate = moment(bestMonth.creationDate, "M").format(
              "MMMM"
          );
          bestMonth.total = Math.floor(bestMonth.total);
        }

        events = d[7];

        res.render("user/detail", {
            title: "Health",
            user: req.user,
            data: jsonData,
            user: req.user,
            totalWalk: Math.floor(totalWalk),
            walkMonthly: walkMonthly,
            walkMonthlyKey: walkMonthlyKey,
            walkMonthlyValue: walkMonthlyValue,
            totalMonthlyWalk: Math.floor(totalMonthlyWalk),
            prevWalkMonthly: prevWalkMonthly,
            prevWalkMonthlyKey: prevWalkMonthlyKey,
            prevWalkMonthlyValue: prevWalkMonthlyValue,
            totalPrevMonthlyWalk: Math.floor(totalPrevMonthlyWalk),
            totalTodayWalk: totalTodayWalk,
            totalThisYearWalk: Math.floor(totalThisYearWalk),
            totalThisWeekWalk: Math.floor(totalThisWeekWalk),
            walkMonthlyKeyChart: walkMonthlyKeyChart,
            walkMonthlyValueChart: walkMonthlyValueChart,
            bestMonth,
            events: events
        });
    });
});

/* GET user' events details. */
router.get("/:id/events", function(req, res, next) {
    Event.findAll({
        where: {
            user_id: req.params.id
        }
    }).then(events =>
        res.render("user/events", {
            events: events,
            user: req.user
        })
    );
});

module.exports = router;

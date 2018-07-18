var express = require("express");
var router = express.Router();
var moment = require("moment");
var Event = require("../../models/index").Event;
var reportData = require("../../services/reportData")

/* GET Health page. */
router.get("/notifications", function(req, res, next) {
    Event.findAll({
        where: {
            user_id: req.user.id
        }
    }).then(events =>
        res.render("event/index", {
            events: events
        })
    );
});

/* GET Dashboard page. */
router.get("/dashboard", function(req, res, next) {
    reportData(req.user.id).then(function(d) {
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
        totalMonthlyWalk = walkMonthlyValue.reduce(d => d);

        prevWalkMonthly = d[2].map(data => data.toJSON());
        prevWalkMonthlyKey = d[2].map(data =>
            moment(data.toJSON().creationDate).format("DD")
        );
        prevWalkMonthlyValue = d[2].map(data => data.toJSON().total);
        totalPrevMonthlyWalk = prevWalkMonthlyValue.reduce(d => d);

        todayWalkValue = d[3].map(data => data.toJSON().total);
        if (todayWalkValue.length !== 0) {
            totalTodayWalk = todayWalkValue.reduce(d => d);
        } else {
            totalTodayWalk = 0;
        }

        thisYearWalkValue = d[4].map(data => data.toJSON().total);
        totalThisYearWalk = thisYearWalkValue.reduce(d => d);

        thisWeekWalkValue = d[5].map(data => data.toJSON().total);
        if (thisWeekWalkValue.length !== 0) {
            totalThisWeekWalk = thisWeekWalkValue.reduce(d => d);
        } else {
            totalThisWeekWalk = 0;
        }

        walkMonthlyKeyChart = d[6].map(data => {
            return moment(data.toJSON().creationDate, "M").format("MMM");
        });
        walkMonthlyValueChart = d[6].map(data => data.toJSON().total);
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

        events = d[7]

        res.render("me/dashboard", {
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


module.exports = router;

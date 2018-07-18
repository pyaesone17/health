var express = require("express");
var router = express.Router();
var dbcon = require("../database/connection");
var Sequelize = require("sequelize");
var Record = require("../models/index").records;
var moment = require("moment");
var Event = require("../models/index").Event;
var User = require("../models/index").User;

/* GET Health page. */
router.get("/dashboard", function(req, res, next) {
    getData().then(function(d) {
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
            return moment(data.toJSON().creationDate,'M').format("MMM");
        });
        walkMonthlyValueChart = d[6].map(data => data.toJSON().total);
        bestMonth = d[6].sort((a,b) => {
            a = a.toJSON()
            b = b.toJSON()
            return a.total < b.total;
        })[0].toJSON();
        bestMonth.creationDate = moment(bestMonth.creationDate,'M').format("MMMM")
        bestMonth.total = Math.floor(bestMonth.total)

        events = d[7]

        res.render("health/dashboard", {
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
            events
        });
    });
});

async function getData() {
    let data = await Record.findAll({
        attributes: [
            [Sequelize.fn("SUM", Sequelize.col("records.value")), "total"],
            "creationDate"
        ],
        group: ["creationDate"]
    });

    let month = await dbcon.query(
        "SELECT DATE(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE()) AND MONTH(creationDate) = MONTH(CURRENT_DATE()) GROUP BY DATE(creationDate)",
        { model: Record }
    );

    let lastMonth = await dbcon.query(
        "SELECT DATE(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND MONTH(creationDate) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) GROUP BY DATE(creationDate)",
        { model: Record }
    );

    let ThisWeek = await dbcon.query(
        "SELECT DATE(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE()) AND WEEK(creationDate) = WEEK(CURRENT_DATE()) GROUP BY DATE(creationDate)",
        { model: Record }
    );

    let Today = await dbcon.query(
        "SELECT DATE(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE()) AND MONTH(creationDate) = MONTH(CURRENT_DATE()) AND DAY(creationDate) = DAY(CURRENT_DATE()) GROUP BY DATE(creationDate)",
        { model: Record }
    );

    let ThisYear = await dbcon.query(
        "SELECT DATE(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE()) GROUP BY DATE(creationDate)",
        { model: Record }
    );

    let MonthlyData = await dbcon.query(
        "SELECT MONTH(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE()) GROUP BY MONTH(creationDate)",
        { model: Record }
    );

    let events = await Event.findAll({
        limit: 5,
        include: [{
            model: User,
            as: 'User'
        }]
    })

    console.log(events)

    return [data, month, lastMonth, Today, ThisYear, ThisWeek, MonthlyData, events];
}

module.exports = router;

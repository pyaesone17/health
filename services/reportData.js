var Record = require("../models/index").records;
var Sequelize = require("sequelize");
var dbcon = require("../database/connection");
var Event = require("../models/index").Event;

const getData = async function (userId) {
    let data = await Record.findAll({
        attributes: [
            [Sequelize.fn("SUM", Sequelize.col("records.value")), "total"],
            "creationDate"
        ],
        group: ["creationDate"]
    });

    let month = await dbcon.query(
        `SELECT DATE(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE()) AND MONTH(creationDate) = MONTH(CURRENT_DATE()) AND user_id = ${userId} GROUP BY DATE(creationDate)`,
        { model: Record }
    );

    let lastMonth = await dbcon.query(
        `SELECT DATE(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND MONTH(creationDate) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) AND user_id = ${userId}  GROUP BY DATE(creationDate)`,
        { model: Record }
    );

    let ThisWeek = await dbcon.query(
        `SELECT DATE(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE()) AND WEEK(creationDate) = WEEK(CURRENT_DATE()) AND user_id = ${userId}  GROUP BY DATE(creationDate)`,
        { model: Record }
    );

    let Today = await dbcon.query(
        `SELECT DATE(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE()) AND MONTH(creationDate) = MONTH(CURRENT_DATE()) AND DAY(creationDate) = DAY(CURRENT_DATE()) AND user_id = ${userId}  GROUP BY DATE(creationDate)`,
        { model: Record }
    );

    let ThisYear = await dbcon.query(
        `SELECT DATE(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE()) AND user_id = ${userId}  GROUP BY DATE(creationDate)`,
        { model: Record }
    );

    let MonthlyData = await dbcon.query(
        `SELECT MONTH(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE()) AND user_id = ${userId} GROUP BY MONTH(creationDate)`,
        { model: Record }
    );

    let events = await Event.findAll({
        limit: 5
    })

    return [data, month, lastMonth, Today, ThisYear, ThisWeek, MonthlyData, events];
}

module.exports = getData
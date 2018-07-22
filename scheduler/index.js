var schedule = require("node-schedule");
var Event = require("../models/index").Event;
var User = require("../models/index").User;
var Record = require("../models/index").records;
var dbcon = require("../database/connection");
var sendMail = require("../mailer/send");

let reminderJson = {
    title: "Reminder for inactivity",
    type: "inactivity",
    payload: "You are inactivity for one day."
};

let targetAchieved = {
    title: "Congratulations for achievement",
    type: "achieved",
    payload: "You have achieved the target of 10000 steps today. Get rest.",
};

var j = schedule.scheduleJob("* * * * *", function() {
    notifyUserForAchievedGoal();
    notifyUserForInactive();

    console.log("The answer to life, the universe, and everything!");
});

function notifyUserForAchievedGoal() {
    User.findAll({
        where: {
            type: "user"
        }
    }).then(users => {
        users.forEach(user => {
            getTodayRecordByUser(user.id).then(record => {
                console.log("Running schduler for alert archieved");
                if(record.length===0){
                  return
                }
                console.log('-----------------------------')
                console.log(record[0].dataValues.total)
                console.log('-----------------------------')
                if (record[0].dataValues.total > 10000) {
                    checkAlreadyNotify(user.id,"achieved").then(notifications => {
                        if (notifications.length === 0) {
                            targetAchieved.user_id = user.id
                            console.log(targetAchieved);
                            sendMail(
                                user.email,
                                targetAchieved.title,
                                targetAchieved.payload
                            );
                            Event.create(targetAchieved);
                        }
                    });
                }
            });
        });
    });
}

function notifyUserForInactive() {
    User.findAll({
        where: {
            type: "user"
        }
    }).then(users => {
        users.forEach(user => {
            getYesterdayRecordByUser(user.id).then(record => {
                console.log("Running schduler for inactive user "+user.id);
                console.log('-----------------------------')
                console.log(record.length)
                console.log('-----------------------------')
                if (record.length === 0) {
                    checkAlreadyNotify(user.id,"inactivity").then(notifications => {
                        console.log(
                            "notifications for inactive count " +
                                notifications.length
                        );
                        if (notifications.length === 0) {
                            reminderJson.user_id = user.id
                            console.log(reminderJson);
                            sendMail(
                                user.email,
                                reminderJson.title,
                                reminderJson.payload
                            );
                            Event.create(reminderJson);
                        }
                    });
                }
            });
        });
    });
}

async function getTodayRecordByUser(userId) {
    let record = await dbcon.query(
        `SELECT DATE(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE()) AND MONTH(creationDate) = MONTH(CURRENT_DATE()) AND DAY(creationDate) = DAY(CURRENT_DATE()) AND user_id = ${userId}  GROUP BY DATE(creationDate)`,
        { model: Record }
    );
    return record;
}

async function getYesterdayRecordByUser(userId) {
    let record = await dbcon.query(
        `SELECT DATE(creationDate) as creationDate, SUM(records.value) as total FROM records WHERE YEAR(creationDate) = YEAR(CURRENT_DATE()) AND MONTH(creationDate) = MONTH(CURRENT_DATE()) AND DAY(creationDate) = DAY(CURRENT_DATE() - 1) AND user_id = ${userId}  GROUP BY DATE(creationDate)`,
        { model: Record }
    );
    return record;
}

async function checkAlreadyNotify(userId,eventType) {
    events = await dbcon.query(
      `SELECT id FROM Events WHERE DAY(createdAt) = DAY(CURRENT_DATE()) AND user_id = ${userId} AND type = '${eventType}' `,
      { model: Record }
    );

    return events;
}

module.exports = j;

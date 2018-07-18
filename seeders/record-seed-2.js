var parseString = require("xml2js").parseString;
var fs = require("fs");
var path = require("path");
var Record = require("../models/index").records;
var Sequelize = require("sequelize");
var moment = require("moment");

function run() 
{
    filePath = path.join(__dirname, "../public/data/export2.xml");
    fs.readFile(filePath, { encoding: "utf-8" }, function(err, data) {
        parseString(data, function(err, result) {
            let data = [];
    
            result.HealthData.Record.splice(0,2000).forEach(function(record) {
                $ = record.$;

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
                $.user_id = 3;
                // console.log($)
                // data.push(record.$);
                try{
                    Record.create($)
                } catch(e ){

                }
            });

            // Record.bulkCreate(data)
            // data.forEach((d) =>
            //     Record.bulkCreate(data)
            // )
        });
    });
}

module.exports = run


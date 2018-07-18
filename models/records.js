"use strict";
module.exports = (sequelize, DataTypes) => {
    var records = sequelize.define(
        "records",
        {
            type: DataTypes.STRING,
            sourceName: DataTypes.STRING,
            sourceVersion: DataTypes.STRING,
            device: DataTypes.STRING,
            unit: DataTypes.STRING,
            creationDate: DataTypes.STRING,
            startDate: DataTypes.STRING,
            endDate: DataTypes.STRING,
            value: DataTypes.STRING,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        },
        {}
    );
    records.associate = function(models) {
        // associations can be defined here
    };
    return records;
};

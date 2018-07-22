'use strict';
module.exports = (sequelize, DataTypes) => {
  var Event = sequelize.define('Event', {
    title: DataTypes.STRING,
    type: DataTypes.STRING,
    payload: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    createdAt: DataTypes.DATE
  }, {});
  Event.associate = function(models) {
    // associations can be defined here
    Event.belongsTo(models.User,{
      foreignKey: 'user_id'
    });
  };
  return Event;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    username: DataTypes.STRING,
    type: DataTypes.STRING,
    createdAt: DataTypes.DATE
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Event,{
      foreignKey: 'user_id'
    });
  };
  return User;
};
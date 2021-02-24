'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    uid: DataTypes.INTEGER,
    address: DataTypes.STRING,
    privateAddress: DataTypes.STRING,
    privateKey: DataTypes.STRING
  }, {
    tableName: 'user',
    comment: "用户",
    sequelize 
  });
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
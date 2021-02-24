'use strict';
module.exports = (sequelize, DataTypes) => {
  const EverydayPoolLog = sequelize.define('EverydayPoolLog', {
    date: DataTypes.STRING,
    data: DataTypes.STRING
  }, {
    tableName: 'everyday_pool_log',
    comment: "日报",
    sequelize 
  });
  EverydayPoolLog.associate = function(models) {
    // associations can be defined here
  };
  return EverydayPoolLog;
};
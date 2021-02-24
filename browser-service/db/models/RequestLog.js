'use strict';
module.exports = (sequelize, DataTypes) => {
  const RequestLog = sequelize.define('RequestLog', {
    scene: DataTypes.INTEGER,
    url: DataTypes.STRING,
    request: DataTypes.STRING,
    status: DataTypes.INTEGER,
    response: DataTypes.STRING
  }, {
    tableName: 'request_log',
    comment: "请求记录",
    sequelize 
  });
  RequestLog.associate = function(models) {
    // associations can be defined here
  };
  return RequestLog;
};
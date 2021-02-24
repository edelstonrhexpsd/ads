'use strict';
module.exports = (sequelize, DataTypes) => {
  const GetLog = sequelize.define('GetLog', {
    blockNumber: DataTypes.INTEGER,
    contractRet: DataTypes.STRING,
    contract: DataTypes.STRING,
    hash: DataTypes.STRING,
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    value: DataTypes.DOUBLE(18,6),
    transactionsTimestamp:DataTypes.STRING,
    expands: DataTypes.STRING(1234)
  }, {
    tableName: 'get_log',
    comment: "充值记录",
    sequelize 
  });
  GetLog.associate = function(models) {
    // associations can be defined here
  };
  return GetLog;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  const PoolLog = sequelize.define('PoolLog', {
    name: DataTypes.STRING,
    hash: DataTypes.STRING,
    gas_hash:DataTypes.STRING,
    pool_hash: DataTypes.STRING,
    address: DataTypes.STRING,
    amount: DataTypes.STRING,
    state: DataTypes.STRING,
    msg: DataTypes.STRING
  }, {
    tableName: 'pool_log',
    comment: "归集日志表",
    sequelize 
  });
  PoolLog.associate = function(models) {
    // associations can be defined here
  };
  return PoolLog;
};
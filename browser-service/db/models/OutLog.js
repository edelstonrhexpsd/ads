'use strict';
module.exports = (sequelize, DataTypes) => {
  const OutLog = sequelize.define('OutLog', {
    type: DataTypes.INTEGER,
    order_id: DataTypes.STRING,
    symbol: DataTypes.STRING,
    amount: DataTypes.DOUBLE(18,6),
    blockNumber: DataTypes.INTEGER,
    hash: DataTypes.STRING,
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    status: DataTypes.INTEGER,
    expands: DataTypes.STRING(1234)
  }, {
    tableName: 'out_log',
    comment: "提币记录",
    sequelize 
  });
  OutLog.associate = function(models) {
    // associations can be defined here
  };
  return OutLog;
};
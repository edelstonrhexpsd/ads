'use strict';
module.exports = (sequelize, DataTypes) => {
  const Config = sequelize.define('Config', {
    scene: DataTypes.INTEGER,
    gaslimit: DataTypes.INTEGER,
    gasprice: DataTypes.INTEGER
  }, {
    tableName: 'config',
    comment: "配置",
    sequelize 
  });
  Config.associate = function(models) {
    // associations can be defined here
  };
  return Config;
};
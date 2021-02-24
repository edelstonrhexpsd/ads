'use strict';
module.exports = (sequelize, DataTypes) => {
  const Node = sequelize.define('Node', {
    name: DataTypes.STRING,
    ip: DataTypes.STRING,
    port: DataTypes.STRING,
    url: DataTypes.STRING,
    priority: DataTypes.INTEGER
  }, {
    tableName: 'node',
    comment: "节点配置",
    sequelize
  });
  Node.associate = function(models) {
    // associations can be defined here
  };
  return Node;
};
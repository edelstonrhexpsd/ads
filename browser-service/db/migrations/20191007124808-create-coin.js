 
 'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('coin', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        comment: '名称',
        type: Sequelize.STRING
      },
      symbol: {
        allowNull: false,
        comment: '简称',
        type: Sequelize.STRING
      },
      address: {
        allowNull: false,
        comment: '合约地址',
        type: Sequelize.STRING
      },
      amount: {
        allowNull: false,
        comment: '发行总量',
        defaultValue: 0,
        type: Sequelize.DOUBLE(18,6)
      },
      decimal: {
        allowNull: false,
        comment: '小数位',
        type: Sequelize.INTEGER
      },
      abi: {
        allowNull: false,
        comment: '合约abi',
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('coin');
  }
};
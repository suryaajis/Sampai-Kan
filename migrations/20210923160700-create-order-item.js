'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('OrderItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      OrderId: {
        type: Sequelize.INTEGER,
        references: { model: 'Orders', key: 'id' },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      ItemId: {
        type: Sequelize.INTEGER,
        references: { model: 'Items', key: 'id' },
        onUpdate: 'cascade',
        onDelete: 'set null'
      },
      name: { type: Sequelize.STRING },
      price: { type: Sequelize.INTEGER },
      quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
      subtotal: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('OrderItems');
  }
};

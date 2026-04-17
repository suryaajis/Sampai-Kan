'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      CustomerId: {
        type: Sequelize.INTEGER,
        references: { model: 'Customers', key: 'id' },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      DriverId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Drivers', key: 'id' },
        onUpdate: 'cascade',
        onDelete: 'set null'
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending'
      },
      subtotal: { type: Sequelize.INTEGER, defaultValue: 0 },
      deliveryFee: { type: Sequelize.INTEGER, defaultValue: 0 },
      total: { type: Sequelize.INTEGER, defaultValue: 0 },
      address: { type: Sequelize.TEXT },
      phone: { type: Sequelize.STRING },
      notes: { type: Sequelize.TEXT },
      paymentMethod: { type: Sequelize.STRING, defaultValue: 'cash' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Orders');
  }
};

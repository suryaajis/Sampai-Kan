'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.Customer, { foreignKey: 'CustomerId' })
      Order.belongsTo(models.Driver, { foreignKey: 'DriverId' })
      Order.hasMany(models.OrderItem, { foreignKey: 'OrderId', onDelete: 'CASCADE' })
    }
  }

  Order.init({
    CustomerId: DataTypes.INTEGER,
    DriverId: DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'preparing', 'picked_up', 'delivering', 'delivered', 'cancelled']]
      }
    },
    subtotal: { type: DataTypes.INTEGER, defaultValue: 0 },
    deliveryFee: { type: DataTypes.INTEGER, defaultValue: 0 },
    total: { type: DataTypes.INTEGER, defaultValue: 0 },
    address: DataTypes.TEXT,
    phone: DataTypes.STRING,
    notes: DataTypes.TEXT,
    paymentMethod: {
      type: DataTypes.STRING,
      defaultValue: 'cash'
    }
  }, {
    sequelize,
    modelName: 'Order'
  })

  return Order
}

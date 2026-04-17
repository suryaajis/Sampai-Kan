'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    static associate(models) {
      Item.belongsTo(models.Customer, { foreignKey: 'CustomerId' })
      Item.belongsTo(models.Category, { foreignKey: 'CategoryId' })
      Item.hasMany(models.OrderItem, { foreignKey: 'ItemId' })
    }

    static getAll(Category, { search, categoryId } = {}) {
      const options = {
        where: {},
        include: [Category],
        order: [['id', 'ASC']]
      }

      if (search) {
        options.where.name = { [Op.iLike]: `%${search}%` }
      }
      if (categoryId) {
        options.where.CategoryId = categoryId
      }

      return Item.findAll(options)
    }
  }

  Item.init({
    name: {
      type: DataTypes.STRING,
      validate: { notEmpty: { msg: 'Nama item tidak boleh kosong' } }
    },
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.INTEGER,
      validate: { min: { args: [0], msg: 'Harga tidak boleh negatif' } }
    },
    imageUrl: DataTypes.STRING,
    CustomerId: DataTypes.INTEGER,
    CategoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Item'
  })

  return Item
}

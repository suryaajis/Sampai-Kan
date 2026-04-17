const { Item, Category } = require('../models')
const formatPrice = require('../helpers/formatPrice')

class MainController {
  static async getHome(req, res, next) {
    try {
      const [categories, featured] = await Promise.all([
        Category.findAll({ order: [['id', 'ASC']] }),
        Item.findAll({ include: [Category], limit: 6, order: [['id', 'ASC']] })
      ])
      res.render('home', { categories, featured, formatPrice })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = MainController

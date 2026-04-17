const { Item, Category, Customer, Order, OrderItem } = require('../models')
const formatPrice = require('../helpers/formatPrice')
const formatDate = require('../helpers/formatDate')
const statusLabel = require('../helpers/statusLabel')

class CustomerController {
  static async getListItems(req, res, next) {
    try {
      const { search, categoryId } = req.query
      const [items, categories] = await Promise.all([
        Item.getAll(Category, { search, categoryId }),
        Category.findAll({ order: [['id', 'ASC']] })
      ])
      res.render('customers/listItems', {
        items,
        categories,
        formatPrice,
        filters: { search: search || '', categoryId: categoryId || '' }
      })
    } catch (err) {
      next(err)
    }
  }

  static async getItemDetail(req, res, next) {
    try {
      const item = await Item.findByPk(req.params.itemId, { include: [Category] })
      if (!item) {
        req.flash('error', 'Menu tidak ditemukan')
        return res.redirect('/customer')
      }
      res.render('customers/itemDetail', { item, formatPrice })
    } catch (err) {
      next(err)
    }
  }

  static async profile(req, res, next) {
    try {
      const customer = await Customer.findByPk(req.session.userId)
      const orders = await Order.findAll({
        where: { CustomerId: req.session.userId },
        include: [OrderItem],
        order: [['createdAt', 'DESC']],
        limit: 5
      })
      res.render('customers/customerProfile', {
        customer,
        orders,
        formatPrice,
        formatDate,
        statusLabel,
        errors: []
      })
    } catch (err) {
      next(err)
    }
  }

  static async postProfile(req, res, next) {
    try {
      const { fullName, email, phone, address, password } = req.body
      const customer = await Customer.findByPk(req.session.userId)
      if (!customer) {
        req.flash('error', 'Akun tidak ditemukan')
        return res.redirect('/login')
      }

      customer.fullName = fullName
      customer.email = email
      customer.phone = phone
      customer.address = address
      if (password && password.trim() !== '') {
        customer.password = password
      }

      await customer.save()
      req.session.fullName = customer.fullName
      req.session.email = customer.email
      req.flash('success', 'Profil berhasil diperbarui')
      res.redirect('/customer/profile')
    } catch (err) {
      const errors = err.errors
        ? err.errors.map(e => e.message)
        : [err.message || 'Gagal memperbarui profil']
      try {
        const customer = await Customer.findByPk(req.session.userId)
        const orders = await Order.findAll({
          where: { CustomerId: req.session.userId },
          include: [OrderItem],
          order: [['createdAt', 'DESC']],
          limit: 5
        })
        res.render('customers/customerProfile', {
          customer, orders, formatPrice, formatDate, statusLabel, errors
        })
      } catch (e) {
        next(e)
      }
    }
  }
}

module.exports = CustomerController

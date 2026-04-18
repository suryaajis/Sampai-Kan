'use strict';
const { Merchant, Store, Item, Category, Order, OrderItem } = require('../models')
const formatPrice = require('../helpers/formatPrice')
const formatDate = require('../helpers/formatDate')
const statusLabel = require('../helpers/statusLabel')

class MerchantController {
  static async dashboard(req, res, next) {
    try {
      const storeId = req.session.storeId
      const [store, pendingCount, preparingCount, totalDelivered, recentOrders] = await Promise.all([
        Store.findByPk(storeId),
        Order.count({ where: { StoreId: storeId, status: 'pending' } }),
        Order.count({ where: { StoreId: storeId, status: ['preparing', 'picked_up', 'delivering'] } }),
        Order.count({ where: { StoreId: storeId, status: 'delivered' } }),
        Order.findAll({
          where: { StoreId: storeId, status: ['pending', 'preparing', 'picked_up', 'delivering'] },
          include: [OrderItem, { model: require('../models').Customer }],
          order: [['createdAt', 'DESC']],
          limit: 5
        })
      ])
      res.render('merchants/dashboard', {
        store, pendingCount, preparingCount, totalDelivered, recentOrders,
        formatPrice, formatDate, statusLabel
      })
    } catch (err) {
      next(err)
    }
  }

  // ---- Items CRUD ----
  static async listItems(req, res, next) {
    try {
      const items = await Item.findAll({
        where: { StoreId: req.session.storeId },
        include: [Category],
        order: [['id', 'ASC']]
      })
      res.render('merchants/items', { items, formatPrice })
    } catch (err) {
      next(err)
    }
  }

  static async newItemForm(req, res, next) {
    try {
      const categories = await Category.findAll({ order: [['id', 'ASC']] })
      res.render('merchants/itemForm', { item: null, categories, errors: [] })
    } catch (err) {
      next(err)
    }
  }

  static async createItem(req, res, next) {
    try {
      const { name, description, price, imageUrl, CategoryId } = req.body
      await Item.create({
        name, description,
        price: parseInt(price, 10),
        imageUrl,
        CategoryId,
        StoreId: req.session.storeId
      })
      req.flash('success', 'Menu berhasil ditambahkan')
      res.redirect('/merchant/items')
    } catch (err) {
      const errors = err.errors ? err.errors.map(e => e.message) : [err.message]
      const categories = await Category.findAll({ order: [['id', 'ASC']] })
      res.render('merchants/itemForm', { item: null, categories, errors })
    }
  }

  static async editItemForm(req, res, next) {
    try {
      const item = await Item.findOne({
        where: { id: req.params.itemId, StoreId: req.session.storeId },
        include: [Category]
      })
      if (!item) {
        req.flash('error', 'Menu tidak ditemukan')
        return res.redirect('/merchant/items')
      }
      const categories = await Category.findAll({ order: [['id', 'ASC']] })
      res.render('merchants/itemForm', { item, categories, errors: [] })
    } catch (err) {
      next(err)
    }
  }

  static async updateItem(req, res, next) {
    try {
      const item = await Item.findOne({
        where: { id: req.params.itemId, StoreId: req.session.storeId }
      })
      if (!item) {
        req.flash('error', 'Menu tidak ditemukan')
        return res.redirect('/merchant/items')
      }
      const { name, description, price, imageUrl, CategoryId } = req.body
      item.name = name
      item.description = description
      item.price = parseInt(price, 10)
      item.imageUrl = imageUrl
      item.CategoryId = CategoryId
      await item.save()
      req.flash('success', 'Menu berhasil diperbarui')
      res.redirect('/merchant/items')
    } catch (err) {
      const errors = err.errors ? err.errors.map(e => e.message) : [err.message]
      const categories = await Category.findAll({ order: [['id', 'ASC']] })
      res.render('merchants/itemForm', { item: req.body, categories, errors })
    }
  }

  static async deleteItem(req, res, next) {
    try {
      const item = await Item.findOne({
        where: { id: req.params.itemId, StoreId: req.session.storeId }
      })
      if (item) await item.destroy()
      req.flash('success', 'Menu dihapus')
      res.redirect('/merchant/items')
    } catch (err) {
      next(err)
    }
  }

  // ---- Store settings ----
  static async storeSettings(req, res, next) {
    try {
      const store = await Store.findByPk(req.session.storeId)
      res.render('merchants/storeSettings', { store, errors: [] })
    } catch (err) {
      next(err)
    }
  }

  static async updateStoreSettings(req, res, next) {
    try {
      const store = await Store.findByPk(req.session.storeId)
      const { name, description, address, phone, email, logoUrl, isOpen } = req.body
      store.name = name
      store.description = description
      store.address = address
      store.phone = phone
      store.email = email
      store.logoUrl = logoUrl
      store.isOpen = isOpen === 'on' || isOpen === '1' || isOpen === 'true'
      await store.save()
      req.session.storeName = store.name
      req.flash('success', 'Pengaturan toko diperbarui')
      res.redirect('/merchant/store')
    } catch (err) {
      const errors = err.errors ? err.errors.map(e => e.message) : [err.message]
      const store = await Store.findByPk(req.session.storeId)
      res.render('merchants/storeSettings', { store, errors })
    }
  }

  // ---- Profile ----
  static async profile(req, res, next) {
    try {
      const merchant = await Merchant.findByPk(req.session.userId)
      res.render('merchants/profile', { merchant, errors: [] })
    } catch (err) {
      next(err)
    }
  }

  static async postProfile(req, res, next) {
    try {
      const merchant = await Merchant.findByPk(req.session.userId)
      const { fullName, email, phone, profileUrl, password } = req.body
      merchant.fullName = fullName
      merchant.email = email
      merchant.phone = phone
      merchant.profileUrl = profileUrl
      if (password && password.trim() !== '') merchant.password = password
      await merchant.save()
      req.session.fullName = merchant.fullName
      req.flash('success', 'Profil berhasil diperbarui')
      res.redirect('/merchant/profile')
    } catch (err) {
      const errors = err.errors ? err.errors.map(e => e.message) : [err.message]
      const merchant = await Merchant.findByPk(req.session.userId)
      res.render('merchants/profile', { merchant, errors })
    }
  }
}

module.exports = MerchantController

const { Customer, Driver, Store, Merchant, Order, OrderItem, Item } = require('../models')
const CartController = require('./cartController')
const formatPrice = require('../helpers/formatPrice')
const formatDate = require('../helpers/formatDate')
const statusLabel = require('../helpers/statusLabel')
const { sendMail } = require('../nodemailer')

class OrderController {
  static async getCheckout(req, res, next) {
    try {
      const cart = CartController.getCart(req)
      if (cart.length === 0) {
        req.flash('error', 'Keranjang masih kosong')
        return res.redirect('/customer')
      }
      const [customer, store] = await Promise.all([
        Customer.findByPk(req.session.userId),
        req.session.cartStoreId ? Store.findByPk(req.session.cartStoreId) : null
      ])
      res.render('customers/checkout', {
        cart,
        totals: CartController.cartTotals(cart),
        customer,
        store,
        formatPrice
      })
    } catch (err) {
      next(err)
    }
  }

  static async postCheckout(req, res, next) {
    try {
      const cart = CartController.getCart(req)
      if (cart.length === 0) {
        req.flash('error', 'Keranjang masih kosong')
        return res.redirect('/customer')
      }
      const { address, phone, notes, paymentMethod } = req.body
      const totals = CartController.cartTotals(cart)

      const order = await Order.create({
        CustomerId: req.session.userId,
        StoreId: req.session.cartStoreId || null,
        status: 'pending',
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        total: totals.total,
        address,
        phone,
        notes,
        paymentMethod: paymentMethod || 'cash'
      })

      await Promise.all(cart.map(c => OrderItem.create({
        OrderId: order.id,
        ItemId: c.itemId,
        name: c.name,
        price: c.price,
        quantity: c.quantity,
        subtotal: c.price * c.quantity
      })))

      req.session.cart = []
      req.session.cartStoreId = null
      req.session.cartStoreName = null
      req.flash('success', 'Pesanan berhasil dibuat! Menunggu konfirmasi toko...')
      res.redirect(`/customer/orders/${order.id}`)
    } catch (err) {
      next(err)
    }
  }

  static async listOrders(req, res, next) {
    try {
      const orders = await Order.findAll({
        where: { CustomerId: req.session.userId },
        include: [OrderItem, Driver, Store],
        order: [['createdAt', 'DESC']]
      })
      res.render('customers/orders', {
        orders,
        formatPrice,
        formatDate,
        statusLabel
      })
    } catch (err) {
      next(err)
    }
  }

  static async showOrder(req, res, next) {
    try {
      const order = await Order.findOne({
        where: { id: req.params.id, CustomerId: req.session.userId },
        include: [OrderItem, Driver, Store]
      })
      if (!order) {
        req.flash('error', 'Pesanan tidak ditemukan')
        return res.redirect('/customer/orders')
      }
      res.render('customers/orderDetail', {
        order,
        formatPrice,
        formatDate,
        statusLabel
      })
    } catch (err) {
      next(err)
    }
  }

  static async cancelOrder(req, res, next) {
    try {
      const order = await Order.findOne({
        where: { id: req.params.id, CustomerId: req.session.userId }
      })
      if (!order) {
        req.flash('error', 'Pesanan tidak ditemukan')
        return res.redirect('/customer/orders')
      }
      if (order.status !== 'pending') {
        req.flash('error', 'Pesanan tidak dapat dibatalkan saat ini')
        return res.redirect(`/customer/orders/${order.id}`)
      }
      order.status = 'cancelled'
      await order.save()
      req.flash('success', 'Pesanan dibatalkan')
      res.redirect(`/customer/orders/${order.id}`)
    } catch (err) {
      next(err)
    }
  }

  // ==== Driver side ====
  static async driverDashboard(req, res, next) {
    try {
      const activeOrder = await Order.findOne({
        where: {
          DriverId: req.session.userId,
          status: ['picked_up', 'delivering']
        },
        include: [OrderItem, Customer, Store]
      })

      const availableOrders = await Order.findAll({
        where: { status: 'preparing', DriverId: null },
        include: [OrderItem, Customer, Store],
        order: [['createdAt', 'ASC']]
      })

      const completedCount = await Order.count({
        where: { DriverId: req.session.userId, status: 'delivered' }
      })

      res.render('drivers/dashboard', {
        activeOrder,
        availableOrders,
        completedCount,
        formatPrice,
        formatDate,
        statusLabel
      })
    } catch (err) {
      next(err)
    }
  }

  static async acceptOrder(req, res, next) {
    try {
      const order = await Order.findOne({
        where: { id: req.params.id, status: 'preparing', DriverId: null }
      })
      if (!order) {
        req.flash('error', 'Pesanan sudah diambil driver lain')
        return res.redirect('/driver')
      }
      const activeExists = await Order.findOne({
        where: {
          DriverId: req.session.userId,
          status: ['picked_up', 'delivering']
        }
      })
      if (activeExists) {
        req.flash('error', 'Selesaikan pesanan aktif dulu')
        return res.redirect('/driver')
      }

      order.DriverId = req.session.userId
      await order.save()
      req.flash('success', 'Pesanan diterima. Menuju ke toko!')
      res.redirect('/driver')
    } catch (err) {
      next(err)
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status } = req.body
      const allowed = ['picked_up', 'delivering', 'delivered']
      if (!allowed.includes(status)) {
        req.flash('error', 'Status tidak valid')
        return res.redirect('/driver')
      }

      const order = await Order.findOne({
        where: { id: req.params.id, DriverId: req.session.userId },
        include: [Customer]
      })
      if (!order) {
        req.flash('error', 'Pesanan tidak ditemukan')
        return res.redirect('/driver')
      }

      order.status = status
      await order.save()

      if (order.Customer && order.Customer.email) {
        sendMail({
          to: order.Customer.email,
          subject: `Update pesanan #${order.id} - ${statusLabel(status).label}`,
          text: `Halo ${order.Customer.fullName}, pesanan Anda sekarang berstatus: ${statusLabel(status).label}.`
        }).catch(err => console.error('mail error:', err.message))
      }

      const msgs = {
        picked_up: 'Pesanan telah diambil',
        delivering: 'Mulai pengantaran',
        delivered: 'Pesanan selesai 🎉'
      }
      req.flash('success', msgs[status])
      res.redirect('/driver')
    } catch (err) {
      next(err)
    }
  }

  static async driverOrderDetail(req, res, next) {
    try {
      const order = await Order.findOne({
        where: { id: req.params.id, DriverId: req.session.userId },
        include: [OrderItem, Customer, Store]
      })
      if (!order) {
        req.flash('error', 'Pesanan tidak ditemukan')
        return res.redirect('/driver')
      }
      res.render('drivers/activeOrder', {
        order, formatPrice, formatDate, statusLabel
      })
    } catch (err) {
      next(err)
    }
  }

  static async driverHistory(req, res, next) {
    try {
      const orders = await Order.findAll({
        where: { DriverId: req.session.userId, status: 'delivered' },
        include: [OrderItem, Customer],
        order: [['updatedAt', 'DESC']]
      })
      res.render('drivers/history', {
        orders, formatPrice, formatDate, statusLabel
      })
    } catch (err) {
      next(err)
    }
  }

  // ==== Merchant side ====
  static async merchantOrders(req, res, next) {
    try {
      const storeId = req.session.storeId
      const { tab } = req.query
      const activeStatuses = ['pending', 'preparing', 'picked_up', 'delivering']
      const isHistory = tab === 'history'

      const orders = await Order.findAll({
        where: {
          StoreId: storeId,
          status: isHistory ? ['delivered', 'cancelled'] : activeStatuses
        },
        include: [OrderItem, Customer],
        order: [['createdAt', 'DESC']]
      })
      res.render('merchants/orders', {
        orders, tab: tab || 'active', formatPrice, formatDate, statusLabel
      })
    } catch (err) {
      next(err)
    }
  }

  static async merchantOrderDetail(req, res, next) {
    try {
      const order = await Order.findOne({
        where: { id: req.params.id, StoreId: req.session.storeId },
        include: [OrderItem, Customer, Driver]
      })
      if (!order) {
        req.flash('error', 'Pesanan tidak ditemukan')
        return res.redirect('/merchant/orders')
      }
      res.render('merchants/orderDetail', { order, formatPrice, formatDate, statusLabel })
    } catch (err) {
      next(err)
    }
  }

  static async merchantConfirmOrder(req, res, next) {
    try {
      const order = await Order.findOne({
        where: { id: req.params.id, StoreId: req.session.storeId, status: 'pending' },
        include: [Customer]
      })
      if (!order) {
        req.flash('error', 'Pesanan tidak ditemukan atau sudah diproses')
        return res.redirect('/merchant/orders')
      }
      order.status = 'preparing'
      await order.save()

      if (order.Customer && order.Customer.email) {
        sendMail({
          to: order.Customer.email,
          subject: `Pesanan #${order.id} dikonfirmasi toko`,
          text: `Halo ${order.Customer.fullName}, pesanan Anda telah dikonfirmasi oleh toko dan sedang disiapkan.`
        }).catch(() => {})
      }

      req.flash('success', 'Pesanan dikonfirmasi, sedang disiapkan')
      res.redirect('/merchant/orders')
    } catch (err) {
      next(err)
    }
  }

  static async merchantRejectOrder(req, res, next) {
    try {
      const order = await Order.findOne({
        where: { id: req.params.id, StoreId: req.session.storeId, status: 'pending' },
        include: [Customer]
      })
      if (!order) {
        req.flash('error', 'Pesanan tidak ditemukan atau sudah diproses')
        return res.redirect('/merchant/orders')
      }
      order.status = 'cancelled'
      await order.save()

      if (order.Customer && order.Customer.email) {
        sendMail({
          to: order.Customer.email,
          subject: `Pesanan #${order.id} ditolak toko`,
          text: `Maaf ${order.Customer.fullName}, pesanan Anda tidak dapat diproses oleh toko saat ini.`
        }).catch(() => {})
      }

      req.flash('success', 'Pesanan ditolak')
      res.redirect('/merchant/orders')
    } catch (err) {
      next(err)
    }
  }
}

module.exports = OrderController

const { Customer, Driver, Order, OrderItem, Item } = require('../models')
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
      const customer = await Customer.findByPk(req.session.userId)
      res.render('customers/checkout', {
        cart,
        totals: CartController.cartTotals(cart),
        customer,
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
      req.flash('success', 'Pesanan berhasil dibuat! Menunggu driver...')
      res.redirect(`/customer/orders/${order.id}`)
    } catch (err) {
      next(err)
    }
  }

  static async listOrders(req, res, next) {
    try {
      const orders = await Order.findAll({
        where: { CustomerId: req.session.userId },
        include: [OrderItem, Driver],
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
        include: [OrderItem, Driver]
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
          status: ['preparing', 'picked_up', 'delivering']
        },
        include: [OrderItem, Customer]
      })

      const availableOrders = await Order.findAll({
        where: { status: 'pending', DriverId: null },
        include: [OrderItem, Customer],
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
        where: { id: req.params.id, status: 'pending', DriverId: null }
      })
      if (!order) {
        req.flash('error', 'Pesanan sudah diambil driver lain')
        return res.redirect('/driver')
      }
      const activeExists = await Order.findOne({
        where: {
          DriverId: req.session.userId,
          status: ['preparing', 'picked_up', 'delivering']
        }
      })
      if (activeExists) {
        req.flash('error', 'Selesaikan pesanan aktif dulu')
        return res.redirect('/driver')
      }

      order.DriverId = req.session.userId
      order.status = 'preparing'
      await order.save()
      req.flash('success', 'Pesanan diterima. Segera siapkan!')
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
        include: [OrderItem, Customer]
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
}

module.exports = OrderController

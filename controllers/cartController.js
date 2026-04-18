const { Item, Category, Store } = require('../models')
const formatPrice = require('../helpers/formatPrice')

const DELIVERY_FEE = 5000

function getCart(req) {
  if (!req.session.cart) req.session.cart = []
  return req.session.cart
}

function cartTotals(cart) {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const deliveryFee = cart.length > 0 ? DELIVERY_FEE : 0
  const total = subtotal + deliveryFee
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  return { subtotal, deliveryFee, total, itemCount }
}

class CartController {
  static async viewCart(req, res, next) {
    try {
      const cart = getCart(req)
      res.render('customers/cart', {
        cart,
        totals: cartTotals(cart),
        formatPrice
      })
    } catch (err) {
      next(err)
    }
  }

  static async addToCart(req, res, next) {
    try {
      const { itemId } = req.params
      const quantity = Math.max(1, parseInt(req.body.quantity || 1, 10))
      const item = await Item.findByPk(itemId, { include: [Store] })
      if (!item) {
        req.flash('error', 'Menu tidak ditemukan')
        return res.redirect('/customer')
      }

      const cart = getCart(req)
      const cartStoreId = req.session.cartStoreId

      // warn and redirect if mixing stores
      if (cartStoreId && cart.length > 0 && cartStoreId !== item.StoreId) {
        const storeName = item.Store ? item.Store.name : 'toko lain'
        req.flash('error', `Keranjang berisi item dari toko berbeda. Kosongkan keranjang dulu untuk memesan dari ${storeName}.`)
        const redirect = req.body.redirect || '/customer'
        return res.redirect(redirect)
      }

      const existing = cart.find(c => c.itemId === item.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        cart.push({
          itemId: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          quantity,
          storeId: item.StoreId,
          storeName: item.Store ? item.Store.name : ''
        })
      }

      req.session.cartStoreId = item.StoreId
      req.session.cartStoreName = item.Store ? item.Store.name : ''

      req.flash('success', `${item.name} ditambahkan ke keranjang`)
      const redirect = req.body.redirect || '/customer'
      res.redirect(redirect)
    } catch (err) {
      next(err)
    }
  }

  static updateQuantity(req, res) {
    const { itemId } = req.params
    const { action } = req.body
    const cart = getCart(req)
    const existing = cart.find(c => c.itemId === parseInt(itemId, 10))

    if (existing) {
      if (action === 'inc') existing.quantity += 1
      else if (action === 'dec') existing.quantity = Math.max(0, existing.quantity - 1)
      if (existing.quantity === 0) {
        req.session.cart = cart.filter(c => c.itemId !== existing.itemId)
      }
    }

    res.redirect('/customer/cart')
  }

  static removeItem(req, res) {
    const itemId = parseInt(req.params.itemId, 10)
    req.session.cart = getCart(req).filter(c => c.itemId !== itemId)
    req.flash('success', 'Item dihapus dari keranjang')
    res.redirect('/customer/cart')
  }

  static clearCart(req, res) {
    req.session.cart = []
    req.session.cartStoreId = null
    req.session.cartStoreName = null
    req.flash('success', 'Keranjang dikosongkan')
    res.redirect('/customer/cart')
  }
}

CartController.DELIVERY_FEE = DELIVERY_FEE
CartController.cartTotals = cartTotals
CartController.getCart = getCart

module.exports = CartController

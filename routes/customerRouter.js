const express = require('express')
const customerRouter = express.Router()

const CustomerController = require('../controllers/customerController')
const CartController = require('../controllers/cartController')
const OrderController = require('../controllers/orderController')

// Menu browsing
customerRouter.get('/', CustomerController.getListItems)
customerRouter.get('/item/:itemId', CustomerController.getItemDetail)

// Cart
customerRouter.get('/cart', CartController.viewCart)
customerRouter.post('/cart/add/:itemId', CartController.addToCart)
customerRouter.post('/cart/update/:itemId', CartController.updateQuantity)
customerRouter.post('/cart/remove/:itemId', CartController.removeItem)
customerRouter.post('/cart/clear', CartController.clearCart)

// Checkout & Orders
customerRouter.get('/checkout', OrderController.getCheckout)
customerRouter.post('/checkout', OrderController.postCheckout)
customerRouter.get('/orders', OrderController.listOrders)
customerRouter.get('/orders/:id', OrderController.showOrder)
customerRouter.post('/orders/:id/cancel', OrderController.cancelOrder)

// Profile
customerRouter.get('/profile', CustomerController.profile)
customerRouter.post('/profile', CustomerController.postProfile)

module.exports = customerRouter

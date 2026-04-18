const express = require('express')
const merchantRouter = express.Router()

const MerchantController = require('../controllers/merchantController')
const OrderController = require('../controllers/orderController')

// Dashboard
merchantRouter.get('/', MerchantController.dashboard)

// Items CRUD
merchantRouter.get('/items', MerchantController.listItems)
merchantRouter.get('/items/new', MerchantController.newItemForm)
merchantRouter.post('/items', MerchantController.createItem)
merchantRouter.get('/items/:itemId/edit', MerchantController.editItemForm)
merchantRouter.put('/items/:itemId', MerchantController.updateItem)
merchantRouter.delete('/items/:itemId', MerchantController.deleteItem)

// Orders
merchantRouter.get('/orders', OrderController.merchantOrders)
merchantRouter.get('/orders/:id', OrderController.merchantOrderDetail)
merchantRouter.post('/orders/:id/confirm', OrderController.merchantConfirmOrder)
merchantRouter.post('/orders/:id/reject', OrderController.merchantRejectOrder)

// Store settings
merchantRouter.get('/store', MerchantController.storeSettings)
merchantRouter.post('/store', MerchantController.updateStoreSettings)

// Profile
merchantRouter.get('/profile', MerchantController.profile)
merchantRouter.post('/profile', MerchantController.postProfile)

module.exports = merchantRouter

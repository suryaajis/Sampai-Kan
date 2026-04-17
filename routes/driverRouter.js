const express = require('express')
const driverRouter = express.Router()

const DriverController = require('../controllers/driverController')
const OrderController = require('../controllers/orderController')

// Dashboard & orders
driverRouter.get('/', OrderController.driverDashboard)
driverRouter.get('/orders/:id', OrderController.driverOrderDetail)
driverRouter.post('/orders/:id/accept', OrderController.acceptOrder)
driverRouter.post('/orders/:id/status', OrderController.updateStatus)
driverRouter.get('/history', OrderController.driverHistory)

// Profile
driverRouter.get('/profile', DriverController.profile)
driverRouter.post('/profile', DriverController.postProfile)

module.exports = driverRouter

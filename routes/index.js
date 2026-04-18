const express = require('express')
const router = express.Router()

const isLoginDriver = require('../middlewares/isLoginDriver')
const isLoginCustomer = require('../middlewares/isLoginCustomer')
const isLoginMerchant = require('../middlewares/isLoginMerchant')

const MainController = require('../controllers/mainController')
const SignController = require('../controllers/signController')

const customerRouter = require('./customerRouter')
const driverRouter = require('./driverRouter')
const merchantRouter = require('./merchantRouter')

router.get('/', MainController.getHome)

router.get('/register', SignController.getRegister)
router.post('/register', SignController.postRegister)

router.get('/login', SignController.getLogin)
router.post('/login', SignController.postLogin)
router.get('/logout', SignController.getLogout)

router.use('/customer', isLoginCustomer, customerRouter)
router.use('/driver', isLoginDriver, driverRouter)
router.use('/merchant', isLoginMerchant, merchantRouter)

module.exports = router

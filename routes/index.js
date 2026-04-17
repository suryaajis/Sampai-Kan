const express = require('express')
const router = express.Router()

const isLoginDriver = require('../middlewares/isLoginDriver')
const isLoginCustomer = require('../middlewares/isLoginCustomer')

const MainController = require('../controllers/mainController')
const SignController = require('../controllers/signController')

const customerRouter = require('./customerRouter')
const driverRouter = require('./driverRouter')

router.get('/', MainController.getHome)

router.get('/register', SignController.getRegister)
router.post('/register', SignController.postRegister)

router.get('/login', SignController.getLogin)
router.post('/login', SignController.postLogin)
router.get('/logout', SignController.getLogout)

router.use('/customer', isLoginCustomer, customerRouter)
router.use('/driver', isLoginDriver, driverRouter)

module.exports = router

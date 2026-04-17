require('dotenv').config()

const express = require('express')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')

const app = express()
const port = process.env.PORT || 3000
const routes = require('./routes')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'))

app.use(session({
  secret: process.env.SESSION_SECRET || 'sampaikan-super-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))

app.use(flash())

// Locals available to all templates
app.use((req, res, next) => {
  res.locals.session = req.session
  res.locals.flashSuccess = req.flash('success')
  res.locals.flashError = req.flash('error')
  res.locals.cartCount = (req.session.cart || []).reduce((sum, it) => sum + it.quantity, 0)
  res.locals.currentPath = req.path
  next()
})

app.use('/', routes)

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    code: 404,
    message: 'Halaman tidak ditemukan'
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).render('error', {
    code: 500,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Terjadi kesalahan pada server'
  })
})

app.listen(port, () => console.log(`Sampai-Kan running on http://localhost:${port}`))

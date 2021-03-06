const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const routes = require('./routes')
const session = require('express-session')

app.set('view engine', 'ejs')
app.use(express.urlencoded({extended:true}))

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))


app.use('/', routes)

app.listen(port, ()=> console.log('This app listening on port:', port))
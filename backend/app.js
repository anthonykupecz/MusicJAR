const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(console.log('connected to mongo'))
  .catch(error => console.log("hi", error.message))

app.use(cors())
app.use(express.json())

app.use(express.static('build'))

const loginRouter = require('./controllers/login')
const userRouter = require('./controllers/user')
const mapRouter = require('./controllers/map')
const eventRouter = require('./controllers/event')
const artistRouter = require('./controllers/artist')
app.use('/api/artist', artistRouter)
app.use('/api/login', loginRouter)
app.use('/api/users', userRouter)
app.use('/api/map', mapRouter)
app.use('/api/event', eventRouter)
module.exports = app

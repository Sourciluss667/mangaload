const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const config = require('./config.js')
const app = express()

const japscanRouter = require('./routes/japscan.js')

app.use(cors({
  credentials: true,
  origin: config.URL_FRONTEND
}))
app.use(logger('dev'))
app.use(express.json())

app.use('/japscan', japscanRouter)

module.exports = app
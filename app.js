const express = require('express')
const apiRouter = require('./routes/api-router');
const { handleApiErrors } = require('./errorHandling')

const app = express()

app.use(express.json())

app.use('/api', apiRouter)
app.use(handleApiErrors)

module.exports = app
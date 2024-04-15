const express = require('express')
const app = express()
const {getTopics, urlNotFound} = require('./controllers')

app.get('/api/topics', getTopics)

app.get('*', urlNotFound)

app.use((err, req, res, next) => {
    if (err.status && err.message) { 
        res.status(err.status).send({message: err.message})
    }
    next()
})

app.use((err, req, res, next) => {
    res.status(500).send({ message: "Internal server error"})
})

module.exports = app
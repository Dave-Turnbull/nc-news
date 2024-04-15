const express = require('express')
const app = express()
const {getEndpoints, getTopics, getArticlesById, getArticles, getCommentsByArticleId, urlNotFound} = require('./controllers')

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics)

app.get('/api/articles/:id', getArticlesById)

app.get('/api/articles', getArticles)

app.get('/api/articles/:id/comments', getCommentsByArticleId)

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
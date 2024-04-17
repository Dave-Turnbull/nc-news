const express = require('express')
const app = express()
const {
    getEndpoints, 
    getTopics, 
    getArticlesById, 
    getArticles, 
    checkValidArticle,
    getUsers,
    getCommentsByArticleId, 
    postCommentByArticleId,
    patchArticleVotes,
    deleteCommentById,
    urlNotFound
    } = require('./controllers')

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics)

app.get('/api/articles/:id', getArticlesById)

//not sure if this is a better way to do error handling than promise.all but seems cleaner
app.all('/api/articles/:id*', checkValidArticle)

app.get('/api/articles', getArticles)

app.get('/api/users', getUsers)

app.get('/api/articles/:id/comments', getCommentsByArticleId)

app.use(express.json())

app.post('/api/articles/:id/comments', postCommentByArticleId)

app.patch('/api/articles/:id', patchArticleVotes)

app.delete('/api/comments/:id', deleteCommentById)

app.get('*', urlNotFound)
app.post('*', urlNotFound)

app.use((err, req, res, next) => {
    const codes = {
        badRequest: ['22P02', '42703', '23502'],
        missingInputData: ['23503']
    }
    if (codes.missingInputData.includes(err.code)) {
        const missingDataName = err.detail.match(/[a-z]+/ig)[1]
        res.status(404).send({message: `${missingDataName} not found`})
    }
    if (codes.badRequest.includes(err.code)) {
        res.status(400).send({message: 'Bad request'})
    }
    next(err)
})

app.use((err, req, res, next) => {
    if (err.status && err.message) { 
        res.status(err.status).send({message: err.message})
    }
    next(err)
})

app.use((err, req, res, next) => {
    res.status(500).send({ message: "Internal server error"})
})

module.exports = app
const {
    retrieveEndpoints, 
    retrieveTopics, 
    retrieveArticlesById, 
    retrieveArticles, 
    retrieveComments,
    postComment
} = require('./models')

exports.getEndpoints = (req, res, next) => {
    return retrieveEndpoints()
    .then((body) => {
        res.status(200).send(body)
    })
    .catch(next) 
}

exports.getTopics = (req, res, next) => {
    return retrieveTopics('topics')
    .then(({rows}) => {
        res.status(200).send(rows)
    })
    .catch(next) 
}

exports.getArticlesById = (req, res, next) => {
    const {params} = req
    return retrieveArticlesById(params.id)
    .then(({rows}) => {
        res.status(200).send(rows[0])
    })
    .catch(next) 
}

exports.getArticles = (req, res, next) => {
    return retrieveArticles()
    .then(({rows}) => {
        res.status(200).send(rows)
    })
    .catch(next) 
}

exports.getCommentsByArticleId = (req, res, next) => {
    const {params} = req
    return Promise.all([retrieveComments(params.id), retrieveArticlesById(params.id)])
    .then(([{rows}]) => {
        res.status(200).send(rows)
    })
    .catch(next) 
}
exports.postCommentByArticleId = (req, res, next) => {
    const {params, body} = req
    if (typeof body.username !== 'string' || typeof body.body !== 'string') {
        next({status: 400, message: 'Bad request'})
    }
    return postComment(params.id, body)
    .then(({rows}) => {
        res.status(201).send(rows)
    })
    .catch(next)
}

exports.urlNotFound = (req, res, next) => {
    return next({status: 404, message: 'URL not found'})
}
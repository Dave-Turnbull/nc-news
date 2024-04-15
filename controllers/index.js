const {
    retrieveEndpoints, 
    retrieveTopics, 
    retrieveArticlesById, 
    retrieveArticles, 
    retrieveComments
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
    if (isNaN(params.id)) {
        return next({status: 400, message: 'Bad request'})
    }
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
    if (isNaN(params.id)) {
        return next({status: 400, message: 'Bad request'})
    }
    return retrieveComments(params.id)
    .then(({rows}) => {
        res.status(200).send(rows)
    })
    .catch(next) 
    
}

exports.urlNotFound = (req, res, next) => {
    return next({status: 404, message: 'URL not found'})
}
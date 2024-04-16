const {
    retrieveEndpoints, 
    retrieveTopics, 
    retrieveArticlesById, 
    retrieveArticles, 
    retrieveComments,
    postComment,
    incrementArticleVote,
    deleteComment
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

exports.checkValidArticle = (req, res, next) => {
    const {params} = req
    retrieveArticlesById(params.id)
    .catch(next) 
    return next()
}

exports.getCommentsByArticleId = (req, res, next) => {
    const {params} = req
    return retrieveComments(params.id)
    .then(({rows}) => {
        res.status(200).send(rows)
    })
    .catch(next) 
}
exports.postCommentByArticleId = (req, res, next) => {
    const {params, body} = req
    return postComment(params.id, body)
    .then((result) => {
        res.status(201).send(result)
    })
    .catch(next)
}

exports.patchArticleVotes = (req, res, next) => {
    const {params, body} = req
    return incrementArticleVote(params.id, body.inc_votes)
    .then((result) => {
        res.status(200).send(result)
    })
    .catch(next)
}

exports.deleteCommentById = (req, res, next) => {
    const {params} = req
    return deleteComment(params.id)
    .then((result) => {
        res.status(204).send()
    })
    .catch(next)
}

exports.urlNotFound = (req, res, next) => {
    return next({status: 404, message: 'URL not found'})
}
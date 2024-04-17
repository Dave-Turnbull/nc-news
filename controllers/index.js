const {
    retrieveEndpoints, 
    retrieveTopics, 
    checkArticleExists, 
    retrieveArticles, 
    retrieveUsers,
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
        res.status(200).send({topics: rows})
    })
    .catch(next) 
}

exports.getArticlesById = (req, res, next) => {
    const {params} = req
    return retrieveArticles({article_id: params.id}, true)
    .then(({rows}) => {
        res.status(200).send(rows[0])
    })
    .catch(next) 
}

exports.getArticles = (req, res, next) => {
    const {query} = req
    return retrieveArticles(query)
    .then(({rows}) => {
        res.status(200).send({articles: rows})
    })
    .catch(next) 
}

exports.checkValidArticle = (req, res, next) => {
    const {params} = req
    checkArticleExists(params.id)
    .catch(next) 
    next()
}

exports.getUsers = (req, res, next) => {
    return retrieveUsers()
    .then(({rows}) => {
        res.status(200).send({users: rows})
    })
    .catch(next)
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
const {
    retrieveEndpoints, 
    retrieveTopics, 
    checkArticleExists, 
    retrieveArticles, 
    retrieveUsers,
    retrieveCommentsByArticleId,
    retrieveCommentById,
    postComment,
    postArticle,
    incrementVote,
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

exports.getUsers = (req, res, next) => {
    return retrieveUsers()
    .then(({rows}) => {
        res.status(200).send({users: rows})
    })
    .catch(next)
}

exports.getUserById = (req, res, next) => {
    const {id} = req.params
    return retrieveUsers(id)
    .then(({rows}) => {
        res.status(200).send(rows[0])
    })
    .catch(next)
}

exports.getCommentsByArticleId = (req, res, next) => {
    const {params} = req
    return Promise.all([retrieveCommentsByArticleId(params.id), checkArticleExists(params.id)])
    .then(([{rows}]) => {
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

exports.addNewArticle = (req, res, next) => {
    const {body} = req
    return postArticle(body)
    .then((result) => {
        res.status(201).send(result)
    })
    .catch(next)
}

exports.patchArticleVotes = (req, res, next) => {
    const {params, body} = req
    return Promise.all([incrementVote(params.id, body.inc_votes, 'article'), checkArticleExists(params.id)])
    .then(([result]) => {
        res.status(200).send(result)
    })
    .catch(next)
}

exports.patchCommentVotes = (req, res, next) => {
    const {params, body} = req
    return Promise.all([incrementVote(params.id, body.inc_votes, 'comment'), retrieveCommentById(params.id)])
    .then(([result]) => {
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
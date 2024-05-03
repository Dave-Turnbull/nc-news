const {
    retrieveEndpoints, 
    retrieveTopics, 
    postTopic,
    checkArticleExists, 
    retrieveArticles, 
    retrieveUsers,
    retrieveComments,
    retrieveCommentsByArticleId,
    retrieveCommentById,
    postComment,
    postArticle,
    incrementVote,
    deleteComment,
    deleteArticleAndComments
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
    .then((response) => {
        res.status(200).send({topics: response.data, total_count: response.total_count})
    })
    .catch(next) 
}

exports.addNewTopic = (req, res, next) => {
    const {body} = req
    return postTopic(body)
    .then((response) => {
        res.status(201).send(response)
    })
    .catch(next) 
}

exports.getArticlesById = (req, res, next) => {
    const {params} = req
    return retrieveArticles({article_id: params.id}, true)
    .then((response) => {
        res.status(200).send(response.data[0])
    })
    .catch(next) 
}

exports.getArticles = (req, res, next) => {
    const {query} = req
    return retrieveArticles(query)
    .then((response) => {
        res.status(200).send({articles: response.data, total_count: response.total_count})
    })
    .catch(next) 
}

exports.getUsers = (req, res, next) => {
    return retrieveUsers()
    .then((response) => {
        res.status(200).send({users: response.data, total_count: response.total_count})
    })
    .catch(next)
}

exports.getUserById = (req, res, next) => {
    const {id} = req.params
    return retrieveUsers(id)
    .then((response) => {
        res.status(200).send(response.data[0])
    })
    .catch(next)
}

exports.getComments = (req, res, next) => {
    const {query} = req
    return retrieveComments(query)
    .then((response) => {
        res.status(200).send({comments: response.data, total_count: response.total_count})
    })
    .catch(next)
}

exports.getCommentsByArticleId = (req, res, next) => {
    const {params, query} = req
    return checkArticleExists(params.id)
    .then(() => {
        return retrieveCommentsByArticleId(params.id, query)
        .then((response) => {
            res.status(200).send({comments: response.data, total_count: response.total_count})
        })
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

exports.deleteArticle = (req, res, next) => {
    const {params} = req
    return deleteArticleAndComments(params.id)
    .then(() => {
        res.status(204).send()
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
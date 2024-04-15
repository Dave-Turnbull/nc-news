const {retrieveEndpoints, retrieveTopics} = require('./models')

exports.getEndpoints = (req, res, next) => {
    return retrieveEndpoints()
    .then((body) => {
        res.status(200).send(body)
    })
    .catch(next) 
}

exports.getTopics = (req, res, next) => {
    return retrieveTopics()
    .then(({rows}) => {
        res.status(200).send(rows)
    })
    .catch(next) 
}

exports.urlNotFound = (req, res, next) => {
    return next({status: 404, message: 'URL not found'})
}
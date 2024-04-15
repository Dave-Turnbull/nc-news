const {retrieveTopics} = require('./models')

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
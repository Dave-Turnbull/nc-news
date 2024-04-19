const topicsRouter = require('express').Router();
const {
    getTopics,
    addNewTopic
    } = require('../../../controllers')

topicsRouter.route('/')
    .get(getTopics)
    .post(addNewTopic)

module.exports = topicsRouter;
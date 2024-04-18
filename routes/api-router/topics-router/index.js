const topicsRouter = require('express').Router();
const {
    getTopics
    } = require('../../../controllers')

topicsRouter.route('/')
    .get(getTopics)

module.exports = topicsRouter;
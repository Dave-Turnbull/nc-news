const usersRouter = require('express').Router();
const {
    getUsers
    } = require('../../../controllers')

usersRouter.route('/')
    .get(getUsers)

module.exports = usersRouter;
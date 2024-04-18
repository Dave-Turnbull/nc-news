const usersRouter = require('express').Router();
const {
    getUsers,
    getUserById
    } = require('../../../controllers')

usersRouter.route('/')
    .get(getUsers)

usersRouter.route('/:id')
    .get(getUserById)

module.exports = usersRouter;
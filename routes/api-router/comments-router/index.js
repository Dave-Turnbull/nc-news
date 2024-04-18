const commentsRouter = require('express').Router();
const {
    deleteCommentById
    } = require('../../../controllers')

commentsRouter.route('/:id')
    .delete(deleteCommentById)

module.exports = commentsRouter;
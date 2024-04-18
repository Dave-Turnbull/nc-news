const commentsRouter = require('express').Router();
const {
    deleteCommentById,
    patchCommentVotes
    } = require('../../../controllers')

commentsRouter.route('/:id')
    .patch(patchCommentVotes)
    .delete(deleteCommentById)

module.exports = commentsRouter;
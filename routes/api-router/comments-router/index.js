const commentsRouter = require('express').Router();
const {
    deleteCommentById,
    patchCommentVotes,
    getComments
    } = require('../../../controllers')

commentsRouter.route('/')
    .get(getComments)

commentsRouter.route('/:id')
    .patch(patchCommentVotes)
    .delete(deleteCommentById)

module.exports = commentsRouter;
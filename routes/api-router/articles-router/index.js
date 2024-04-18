const articlesRouter = require('express').Router();
const {
    getArticles, 
    getArticlesById,
    getCommentsByArticleId, 
    postCommentByArticleId,
    patchArticleVotes,
    } = require('../../../controllers')

articlesRouter.route('/')
    .get(getArticles)

articlesRouter.route('/:id')
    .get(getArticlesById)
    .patch(patchArticleVotes)

articlesRouter.route('/:id/comments')
    .get(getCommentsByArticleId)
    .post(postCommentByArticleId)

module.exports = articlesRouter;
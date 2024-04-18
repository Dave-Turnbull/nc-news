const articlesRouter = require('express').Router();
const {
    getArticles, 
    getArticlesById,
    getCommentsByArticleId, 
    postCommentByArticleId,
    patchArticleVotes,
    addNewArticle
    } = require('../../../controllers')

articlesRouter.route('/')
    .get(getArticles)
    .post(addNewArticle)

articlesRouter.route('/:id')
    .get(getArticlesById)
    .patch(patchArticleVotes)

articlesRouter.route('/:id/comments')
    .get(getCommentsByArticleId)
    .post(postCommentByArticleId)

module.exports = articlesRouter;
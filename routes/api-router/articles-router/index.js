const articlesRouter = require('express').Router();
const {
    getArticles, 
    getArticlesById,
    getCommentsByArticleId, 
    postCommentByArticleId,
    patchArticleVotes,
    addNewArticle,
    deleteArticle
    } = require('../../../controllers')

articlesRouter.route('/')
    .get(getArticles)
    .post(addNewArticle)

articlesRouter.route('/:id')
    .get(getArticlesById)
    .patch(patchArticleVotes)
    .delete(deleteArticle)

articlesRouter.route('/:id/comments')
    .get(getCommentsByArticleId)
    .post(postCommentByArticleId)

module.exports = articlesRouter;
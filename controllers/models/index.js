const db = require("../../db/connection.js");
var fs = require('fs'); 

exports.retrieveEndpoints = () => {
    return fs.promises.readFile('endpoints.json', 'utf8')
    .then((result) => {
        const endpoints = JSON.parse(result)
        return endpoints
    })
}

const retrieveData = (sqlQuery) => {
    return db.query(sqlQuery)
    .then((result) => {
        if(result.rows.length === 0) {
            const dataName = result.fields[0].name.match(/^[a-z]+/i)[0]
            return Promise.reject({status: 404, message: `${dataName} not found`})
        }
        return result
    })
}

exports.retrieveTopics = () => {
    const sqlQuery = `SELECT * FROM topics`
    return retrieveData(sqlQuery)
}

exports.retrieveArticlesById = (id) => {
    const sqlQuery = `SELECT * FROM articles WHERE article_id=${id} ORDER BY created_at DESC`
    return retrieveData(sqlQuery)
}

exports.retrieveArticles = (id) => {
    //COALESCE converts the value to 0 if its null
    //AS comment_count sets the column name
    //CAST(... AS INT) converts to an interger (apparently GROUP BY returns as a VARCHAR)
    //COUNT(*) counts all the items in the group
    //GROUP BY creates groups for all comments seperated by article_id
    //SQL hurts
    const sqlQuery = `SELECT author, title, articles.article_id, topic, created_at, votes, article_img_url, COALESCE(comments.comment_count, 0) AS comment_count FROM articles
    LEFT JOIN (
        SELECT comments.article_id, CAST(COUNT(*) AS INT) AS comment_count
        FROM comments
        GROUP BY comments.article_id
    ) comments ON comments.article_id = articles.article_id ORDER BY created_at DESC`
    return retrieveData(sqlQuery)
}

exports.retrieveComments = (id) => {
    return db.query(`SELECT * FROM comments WHERE article_id=${id} ORDER BY created_at DESC`)
}

exports.postComment = (id, body) => {
    return db.query(`
    INSERT INTO comments (body, author, article_id, votes, created_at)
    VALUES ($1, $2, $3, 0, $4)
    RETURNING *
    `, [body.body, body.username, id, new Date().toISOString()])
    .then(({rows}) => {
        return rows[0]
    })
}

exports.incrementArticleVote = (id, incvotes) => {
    return db.query(`
        UPDATE articles 
        SET votes = votes + $1 
        WHERE article_id = $2
        RETURNING *`, [incvotes, id])
    .then(({rows}) => {
        return rows[0]
    })
}

exports.deleteComment = (id) => {
    return db.query(`
        DELETE FROM comments 
        WHERE comment_id = $1
        RETURNING *
        `, [id])
    .then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, message: `comment not found`})
        }
    })
}
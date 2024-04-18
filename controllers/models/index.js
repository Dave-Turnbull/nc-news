const db = require("../../db/connection.js");
const fs = require('fs'); 
const format = require('pg-format');

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
            const dataName = result.fields
                .find(field => field.columnID === 1).name
                .match(/[a-z]+/ig)[0]
            return Promise.reject({status: 404, message: `${dataName} not found`})
        }
        return result
    })
}

exports.retrieveTopics = () => {
    const sqlQuery = `SELECT * FROM topics`
    return retrieveData(sqlQuery)
}

exports.checkArticleExists = (id) => {
    const sqlQuery = format(`SELECT * FROM articles WHERE article_id=%L`, id)
    return retrieveData(sqlQuery)
}

exports.retrieveArticles = (query, includeBody) => {
    //COALESCE converts the value to 0 if its null
    //AS comment_count sets the column name
    //CAST(... AS INT) converts to an interger (apparently GROUP BY returns as a VARCHAR)
    //COUNT(*) counts all the items in the group
    //GROUP BY creates groups for all comments seperated by article_id
    //SQL hurts
    let sqlQuery = format(`SELECT author, title, articles.article_id,${includeBody ? ' body,':''} topic, created_at, votes, article_img_url, COALESCE(comments.comment_count, 0) AS comment_count FROM articles
    LEFT JOIN (
        SELECT comments.article_id, CAST(COUNT(*) AS INT) AS comment_count
        FROM comments
        GROUP BY comments.article_id
    ) comments ON comments.article_id = articles.article_id`)
    const approvedQueries = [
        'article_id', 
        'title', 
        'topic', 
        'author',
        'created_at', 
        'votes', 
        'article_img_url'
    ]
    if (Object.keys(query).some((theQuery) => approvedQueries.includes(theQuery))) {
        const conditionalsArray = []
        for (key in query) {
            if (approvedQueries.includes(key)) {
                conditionalsArray.push(format(`articles.%I = %L`, key, query[key]))
            } else if (key !== 'sort_by' && key !== 'order'){
                return Promise.reject({status: 400, message: "Invalid query"})
            }
        }
        sqlQuery += ` WHERE ${conditionalsArray.join(' AND ')}`
    }
    if (query.order && !(query.order.toUpperCase() === 'ASC' || query.order.toUpperCase() === 'DESC')) {
        return Promise.reject({status: 400, message: "Invalid query"})
    }
    sqlQuery += format(` ORDER BY %I ${query.order ? query.order : 'DESC'}`, query.sort_by ? query.sort_by : 'created_at')
    return retrieveData(sqlQuery)
}

exports.retrieveUsers = (id) => {
    let sqlQuery = `SELECT * FROM users`
    if (id) {
        sqlQuery += format(` WHERE username=%L`, id)
    }
    return retrieveData(sqlQuery)
}

exports.retrieveComments = (id) => {
    return db.query(`SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`, [id])
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
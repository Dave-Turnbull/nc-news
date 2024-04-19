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

const formatConditionals = (sqlQuery, queries = {}, approvedConditionals, tableName) => {
    const { limit, order, sort_by, p, ...conditionals } = queries
    if (Object.keys(conditionals).length !== 0) {
        const conditionalsArray = []
        for (key in conditionals) {
            if (approvedConditionals.includes(key)) {
                conditionalsArray.push(
                    format(`${tableName ? tableName + '.': ''}%I = %L`, key, queries[key])
                    )
            } else {
                throw {status: 400, message: "Invalid query"}
            }
        }
        sqlQuery += ` WHERE ${conditionalsArray.join(' AND ')}`
    }
    return sqlQuery
}

const formatOrder = (sqlQuery, queries = {}, defaultSortColumn) => {
    const { order = 'DESC', sort_by = defaultSortColumn} = queries
    if (!(order.toUpperCase() === 'ASC' || order.toUpperCase() === 'DESC')) {
        throw {status: 400, message: "Invalid query"}
    }
    if (sort_by) {
        sqlQuery += format(` ORDER BY %I ${order}`, sort_by)
    }
    return sqlQuery
}

const retrieveData = (sqlQuery, limit, p, dont404) => {
    let sqlQueryWithLimit = sqlQuery
    if (!isNaN(limit) && !isNaN(p)) {
        sqlQueryWithLimit += ` LIMIT ${limit} OFFSET ${limit * (p - 1)}`
    } else if (limit) {
        return Promise.reject({status: 400, message: `Invalid query`})
    }
    return db.query(sqlQueryWithLimit)
    .then((result) => {
        const dataName = result.fields
            .find(field => field.columnID === 1).name
            .match(/[a-z]+/ig)[0]
        if(result.rows.length === 0 && !dont404) {
            return Promise.reject({status: 404, message: `${dataName} not found`})
        }
        if ((result.rows.length < limit && p === 1) || !limit) {
            return { data: result.rows, "total_count": result.rows.length}
        } else {
            return db.query(sqlQuery).then((total_pages) => {
                return { data: result.rows, "total_count": total_pages.rows.length}
            })
        }
    })
}

//adding pagination to this will cause bugs in retrieveData (there is no topic_id column)
exports.retrieveTopics = () => {
    const sqlQuery = `SELECT * FROM topics`
    return retrieveData(sqlQuery)
}

exports.postTopic = (postBody) => {
    const {slug, description} = postBody
    return db.query(`
    INSERT INTO topics (slug, description)
    VALUES ($1, $2)
    RETURNING *
    `, [slug, description])
    .then(({rows}) => {
        return rows[0]
    })
}

exports.checkArticleExists = (id) => {
    const sqlQuery = format(`SELECT * FROM articles WHERE article_id=%L`, id)
    return retrieveData(sqlQuery)
}

exports.retrieveArticles = (queries, includeBody) => {
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
    const approvedConditionals = [
        'article_id', 
        'title', 
        'topic', 
        'author',
        'created_at', 
        'votes', 
        'article_img_url'
    ]
    const {limit = 10, p = 1} = queries
    const defaultSortColumn = 'created_at'
    sqlQuery = formatConditionals(sqlQuery, queries, approvedConditionals, 'articles')
    sqlQuery = formatOrder(sqlQuery, queries, defaultSortColumn)
    return retrieveData(sqlQuery, limit, p)
}

exports.retrieveUsers = (id) => {
    let sqlQuery = `SELECT * FROM users`
    if (id) {
        sqlQuery += format(` WHERE username=%L`, id)
    }
    return retrieveData(sqlQuery)
}

exports.retrieveCommentsByArticleId = (id, queries) => {
    const sqlQuery = format(`SELECT * FROM comments WHERE article_id = %L ORDER BY created_at DESC`, id)
    const {limit = 10, p = 1} = queries
    return retrieveData(sqlQuery, limit, p, true)
}

exports.retrieveCommentById = (id) => {
    const sqlQuery = format(`SELECT * FROM comments WHERE comment_id = %L`, id)
    return retrieveData(sqlQuery)
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

exports.postArticle = (postBody) => {
    const {title, topic, body, author, article_img_url = 'http://defaultURL.com/1.png'} = postBody
    return db.query(`
    INSERT INTO articles (title, topic, body, author, votes, created_at, article_img_url)
    VALUES ($1, $2, $3, $4, 0, $5, $6)
    RETURNING *, 0 AS comment_count
    `, [title, topic, body, author, new Date().toISOString(), article_img_url])
    .then(({rows}) => {
        return rows[0]
    })
}

exports.incrementVote = (id, incvotes, dataName) => {
    return db.query(`
        UPDATE ${dataName}s 
        SET votes = votes + $1 
        WHERE ${dataName}_id = $2
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
const db = require("../../db/connection.js");
var fs = require('fs'); 

exports.retrieveEndpoints = () => {
    return fs.promises.readFile('endpoints.json', 'utf8')
    .then((result) => {
        const endpoints = JSON.parse(result)
        return endpoints
    }).catch((err) => {
        Promise.reject(err)
    })
}

const retrieveData = (sqlQuery) => {
    return db.query(sqlQuery)
    .then((result) => {
        if(result.rows.length === 0) {
            return Promise.reject({status: 404, message: 'Nothing found'})
        }
        return result
    })
}

exports.retrieveTopics = () => {
    let sqlQuery = `SELECT * FROM topics`
    return retrieveData(sqlQuery)
}

exports.retrieveArticlesById = (id) => {
    let sqlQuery = `SELECT * FROM articles WHERE article_id=${id}`
    sqlQuery += ` ORDER BY created_at DESC`
    return retrieveData(sqlQuery)
}

exports.retrieveArticles = (id) => {
    //COALESCE converts the value to 0 if its null
    //AS comment_count sets the column name
    //CAST(... AS INT) converts to an interger (apparently GROUP BY returns as a VARCHAR)
    //COUNT(*) counts all the items in the group
    //GROUP BY creates groups for all comments seperated by article_id
    //SQL hurts
    let sqlQuery = `SELECT author, title, articles.article_id, topic, created_at, votes, article_img_url, COALESCE(comments.comment_count, 0) AS comment_count FROM articles
    LEFT JOIN (
        SELECT comments.article_id, CAST(COUNT(*) AS INT) AS comment_count
        FROM comments
        GROUP BY comments.article_id
    ) comments ON comments.article_id = articles.article_id`
    sqlQuery += ` ORDER BY created_at DESC`
    return retrieveData(sqlQuery)
}

exports.retrieveComments = (id) => {
    let sqlQuery = `SELECT * FROM comments WHERE article_id=${id}`
    return retrieveData(sqlQuery).then((result) => {
        console.log(result.rows)
        return result
    })
}
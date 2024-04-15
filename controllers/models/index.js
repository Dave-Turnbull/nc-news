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

exports.retrieveArticles = (id) => {
    let sqlQuery = `SELECT * FROM articles`
    if (id) {
        sqlQuery += ` WHERE article_id=${id}`
    }
    sqlQuery += ` ORDER BY created_at DESC`
    return retrieveData(sqlQuery)
}
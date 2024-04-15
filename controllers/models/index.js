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

exports.retrieveData = (tableName, id) => {
    let sqlQuery = `SELECT * FROM ${tableName}`
    if (id) {
        sqlQuery += ` WHERE ${tableName.slice(0, -1)}_id=${id}`
    }
    return db.query(sqlQuery)
    .then((result) => {
        if(result.rows.length === 0) {
            return Promise.reject({status: 404, message: 'Nothing found'})
        }
        return result
    })
}
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

exports.retrieveTopics = () => {
    return db.query('SELECT * FROM topics')
    .then((result) => {
        if(result.rows.length === 0) {
            return Promise.reject({status: 404, message: 'nothing found'})
        }
        return result
    })
}
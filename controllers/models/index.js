const db = require("../../db/connection.js");

exports.retrieveTopics = () => {
    return db.query('SELECT * FROM topics')
    .then((result) => {
        if(result.rows.length === 0) {
            return Promise.reject({status: 404, message: 'nothing found'})
        }
        return result
    })
}
exports.handleApiErrors = (err, req, res, next) => {
    const codes = {
        badRequest: ['22P02', '42703', '23502', '42601'],
        missingInputData: ['23503']
    }
    if (codes.missingInputData.includes(err.code)) {
        const missingDataName = err.detail.match(/[a-z]+/ig)[1]
        res.status(404).send({message: `${missingDataName} not found`})
        return
    }
    else if (codes.badRequest.includes(err.code)) {
        res.status(400).send({message: 'Bad request'})
        return
    }
    else if (err.status && err.message) { 
        res.status(err.status).send({message: err.message})
        return
    }
    else {
        console.log(err)
        res.status(500).send({ message: "Internal server error"})
    }
}
module.exports.handleError = function(res, err) {
    /** Custom error. */
    if (err.statusCode == 400) {
        res.status(400).send(err)
    } 
    /** Unique key constraint. */
    else if (err.code === 11000) {
        res.status(400).send({ statusCode: 400, message: `'${err.keyValue.name}' already exists.`})
    } 
    /** Undocumented errors. */
    else {
        console.log(err)
        res.status(500).send({ statusCode: 500, message: 'An unknown error has occured.' });
    }
}

module.exports.throwError = function(statusCode, message) {
    throw { statusCode: statusCode, message: message };
}
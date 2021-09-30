module.exports.handleError = function(res, err) {
    /** Custom error. */
    if (err.statusCode == 400) {
        res.status(400).send(err);
    }
    else if (err.statusCode == 401) {
        res.sendStatus(401);
    }
    /** Unique key constraint. */
    else if (err.code === 11000) {
        res.status(400).send({ statusCode: 400, message: `'${err.keyValue.name}' already exists.`});
    } 
    /** Type error and validation errors. */
    else if (err.name === 'CastError' || 'ValidationError') {
        res.status(400).send({ statusCode: 400, message: err.message });
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
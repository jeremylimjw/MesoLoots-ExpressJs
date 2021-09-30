const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports.hash = async function(plainText) {
    return bcrypt.hash(plainText, saltRounds);
}
module.exports.compare = async function(plainText, hash) {
    return bcrypt.compare(plainText, hash);
}
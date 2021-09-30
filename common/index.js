module.exports.throwErrorIfPagePrivateAndPasswordMismatch = async function(page, req) {
  if (page.private) {
      const hashedPassword = req.headers.authorization?.split(' ')[1];
      if (hashedPassword !== page.password) {
        throw { statusCode: 401 };
      }
  }
}
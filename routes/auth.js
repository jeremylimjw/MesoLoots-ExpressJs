var express = require('express');
var router = express.Router();
const { isBetween, hasWhiteSpace, isBoolean, isString } = require('../common/typecheck');
const { handleError } = require('../common/httpError');
const { Page } = require('../models');

/** POST auth
 *  {
 *    password: string;  
 *  }
 */
router.post('/', async function(req, res, next) {
    const body = req.body;
    
    /** Validate request body. */
    const errors = validatePost(body);
    if (errors.length > 0) {
        res.status(488).send({ statusCode: 488, message: errors[0], errors: errors });
        return;
    }

    try {
      res.cookie('keyHttpOnly', 'success', { httpOnly: true })
      res.cookie('key', 'success')
      console.log(req.cookies)
      res.send(req.cookies)
      // res.sendStatus(403)

    } catch(err) {
        handleError(res, err);
    }

});


function validatePost(body) {
  const errors = [];

  /** Password is required. */
  if (body.password == null) {
    errors.push("The field 'password' is required.");
  }
  /** Password must be a string. */
  else if (!isString(body.password)) {
    errors.push("The field 'password' must be a string.");
  } 

  return errors;
}

module.exports = router;

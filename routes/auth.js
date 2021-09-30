var express = require('express');
var router = express.Router();
const { isBetween, hasWhiteSpace, isBoolean, isString } = require('../common/typecheck');
const { handleError } = require('../common/httpError');
const { Page } = require('../models');
const { compare } = require('../auth');

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
      const page = await Page.findByIdOrThrowError(body.pageId);

      const match = await compare(body.password, page.password);
      if (!match) {
        res.sendStatus(401);
        return;
      }

      res.send({ hashedPassword: page.password });

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

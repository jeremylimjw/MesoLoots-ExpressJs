var express = require('express');
var router = express.Router();
const { isBetween, hasWhiteSpace, isBoolean, isString } = require('../common/typecheck');
const { throwErrorIfPagePrivateAndPasswordMismatch } = require('../common');
const { handleError } = require('../common/httpError');
const { Page } = require('../models');
const { hash } = require('../auth');


/* GET page */
router.get('/', async function(req, res, next) {
  const name = req.query.name;

  try {
    if (!name) {
      const pages = await Page.find();
      res.send(pages);
    } else {
      const page = await Page.findOne({ name: name });
      res.send(page != null ? page : {});
    }

  } catch(err) {
    handleError(res, err);
  }

});

/** POST page
 *  {
 *    name: string (unique);
 *    private: boolean;
 *    password?: string;  
 *  }
 */
router.post('/', async function(req, res, next) {
  const body = req.body;
  
  /** Validate request body. */
  const errors = validatePage(body);
  if (errors.length > 0) {
    res.status(488).send({ statusCode: 488, message: errors[0], errors: errors });
    return;
  }

  try {
    if (body.password) {
      const newHash = await hash(body.password);
      body.password = newHash;
      const page = await Page.create(body);
      res.send(page);

    } else {
      const page = await Page.create(body);
      res.send(page);
    }

  } catch(err) {
    handleError(res, err);
  }

});

/** DELETE method
 *  {
 *    id: ObjectId;
 *  }
 */
router.delete('/', async function(req, res, next) {
  const body = { pageId: req.query.id };

  /** Validate request body. */
  const errors = validateDelete(body);
  if (errors.length > 0) {
    res.status(488).send({ statusCode: 488, message: errors[0], errors: errors });
    return;
  }

  try {
    const page = await Page.findByIdOrThrowError(body.pageId);

    await throwErrorIfPagePrivateAndPasswordMismatch(page, req);

    await Page.findByIdAndRemove(body.pageId);
    res.send({});

  } catch(err) {
    handleError(res, err);
  }

});



function validatePage(body) {
  const errors = [];

  /** Name is required. */
  if (body.name == null) {
    errors.push("The field 'name' is required.");
  } 
  /** Name must be between 4 and 32 characters. */
  else if (!isBetween(body.name, 4, 32)) {
    errors.push("The field 'name' must be between 4 and 32 characters.");
  }
  /** Name cannot contain whitespace. */
  else if (hasWhiteSpace(body.name)) {
    errors.push("The field 'name' cannot contain any spaces.");
  }

  /** Must have private boolean value. */
  if (body.private === undefined) {
    errors.push("The field 'private' is required.");
  }
  else if (!isBoolean(body.private)) {
    errors.push("The field 'private' must be a boolean.");
  }
  /** If is private, must have password. */
  else if (body.private && !body.password) {
    errors.push("Password cannot be empty for private use.");
  }

  if (body.password != null && body.password !== '') {
    /** If have password, must be string. */
    if (!isString(body.password)) {
      errors.push("The field 'password' must be a string.");
    } 
    /** If have password, must be between 6 and 32 characters. */
    else if (!isBetween(body.password, 6, 32)) {
      errors.push("The field 'password' must be between 6 and 32 characters.");
    }
  } else {
    delete body.password;
  }

  return errors;
}

function validateDelete(body) {
  const errors = [];

  /** Page id is required. */
  if (body.pageId == null) {
    errors.push("The field 'id' is required.");
  }
  /** Page id must be a string. */
  else if (!isString(body.pageId)) {
    errors.push("The field 'id' must be a string.");
  } 
  /** Object ID must be 24 characters. */
  else if (body.pageId.length !== 24) {
    errors.push("The field 'id' must be 24 characters.");
  }

  return errors;
}

module.exports = router;

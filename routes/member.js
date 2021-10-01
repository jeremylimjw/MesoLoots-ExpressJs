var express = require('express');
var router = express.Router();

const { isString, isBetween } = require('../common/typecheck');
const { throwErrorIfPagePrivateAndPasswordMismatch } = require('../common');
const { handleError } = require('../common/httpError');
const { Page, Member } = require('../models');

/** POST Method
 *  {
 *    pageId: ObjectId;
 *    name: string;
 *    jobId: number;
 *  }
 */
router.post('/', async function(req, res, next) {
  let body = {
    pageId: req.body.pageId,
    name: req.body.name,
    jobId: req.body.jobId
  }

  /** Validate request body. */
  const errors = validatePost(body);
  if (errors.length > 0) {
    res.status(488).send({ statusCode: 488, message: errors[0], errors: errors });
    return;
  }

  try {
    const page = await Page.findByIdOrThrowError(body.pageId);

    throwErrorIfPagePrivateAndPasswordMismatch(page, req);

    const newMember = await page.team.create(body);
    page.team.push(newMember)
    await page.save();

    res.send(newMember);

  } catch(err) {
    handleError(res, err);
  }

});

/** DELETE method
 *  {
 *    pageId: ObjectId;
 *    memberId: ObjectId;
 *  }
 */
router.delete('/', async function(req, res, next) {
  const body = {
    pageId: req.query.pageId,
    memberId: req.query.memberId
  }

  /** Validate request body. */
  const errors = validateDelete(body);
  if (errors.length > 0) {
    res.status(488).send({ statusCode: 488, message: errors[0], errors: errors });
    return;
  }

  try {
    const page = await Page.findByIdOrThrowError(body.pageId);

    throwErrorIfPagePrivateAndPasswordMismatch(page, req);

    page.team.id(body.memberId).remove();
    await page.save();
    res.send({});

  } catch(err) {
    handleError(res, err);
  }

});


function validatePost(body) {
    const errors = [];

    /** Page id is required. */
    if (body.pageId == null) {
      errors.push("The field 'pageId' is required.");
    }
    /** Page id must be a string. */
    else if (!isString(body.pageId)) {
      errors.push("The field 'pageId' must be a string.");
    } 
    /** Object ID must be 24 characters. */
    else if (body.pageId.length !== 24) {
      errors.push("The field 'pageId' must be 24 characters.");
    }

    /** Name is required. */
    if (body.name == null) {
      errors.push("The field 'name' is required.");
    }
    /** Name must be a string. */
    else if (!isString(body.name)) {
      errors.push("The field 'name' must be a string.");
    }
    /** Name must be between 4 and 32 characters. */
    else if (!isBetween(body.name, 4, 32)) {
      errors.push("The field 'name' must be between 4 and 32 characters.");
    }

    /** JobId is required. */
    if (body.jobId == null) {
      errors.push("The field 'jobId' is required.");
    }
    /** JobId must be a number. */
    else if (isNaN(body.jobId)) {
      errors.push("The field 'jobId' must be a number.");
    } else {
      body.jobId = +body.jobId;
    }

    return errors;
}

function validateDelete(body) {
  const errors = [];

  /** Page id is required. */
  if (body.pageId == null) {
    errors.push("The field 'pageId' is required.");
  }
  /** Page id must be a string. */
  else if (!isString(body.pageId)) {
    errors.push("The field 'pageId' must be a string.");
  } else if (body.pageId.length !== 24) {
    errors.push("The field 'pageId' must be 24 characters.");
  }

  /** Member id is required. */
  if (body.memberId == null) {
    errors.push("The field 'memberId' is required.");
  }
  /** Member id must be a string. */
  else if (!isString(body.memberId)) {
    errors.push("The field 'memberId' must be a string.");
  } else if (body.memberId.length !== 24) {
    errors.push("The field 'memberId' must be 24 characters.");
  }

  return errors;
}

module.exports = router;

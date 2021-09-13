var express = require('express');
var router = express.Router();

const { isString, isBetween, isDate, isArray } = require('../common/typecheck');
const { handleError } = require('../common/httpError');
const { Page } = require('../models');

/** POST Method
 *  {
 *    pageId: ObjectId;
 *    loots: Loot[];
 *  }
 */
router.post('/', async function(req, res, next) {
    let body = req.body;

    /** Validate request body. */
    const errors = validatePost(body);
    if (errors.length > 0) {
        res.status(488).send({ statusCode: 488, message: errors[0], errors: errors });
        return;
    }

    try {
      const page = await Page.findByIdOrThrowError(body.pageId);
      
      const newLoots = await Promise.all(body.loots.map(lootToCreate => page.loots.create(lootToCreate)))
      newLoots.forEach(loot => page.loots.push(loot));

      await page.save();
      res.send(newLoots);
  
    } catch(err) {
      handleError(res, err);
    }

});

/** POST Method
 *  {
 *    pageId: ObjectId;
 *    lootId: ObjectId;
 *    soldOn: Date;
 *    soldPrice: number;
 *    distributable: number;
 *  }
 */
router.post('/sell', async function(req, res, next) {
    let body = req.body;

    /** Validate request body. */
    const errors = validatePostSell(body);
    if (errors.length > 0) {
        res.status(488).send({ statusCode: 488, message: errors[0], errors: errors });
        return;
    }

    try {
      const page = await Page.findByIdOrThrowError(body.pageId);
      
      const lootToUpdate = page.loots.id(body.lootId);

      lootToUpdate.soldOn = body.soldOn;
      lootToUpdate.soldPrice = body.soldPrice ? body.soldPrice.toString() : '0';
      lootToUpdate.distributable = body.distributable ? body.distributable.toString() : '0';

      /** Add to the member's distributable list. */
      for (let member of lootToUpdate.party) {
        page.team.id(member._id)?.distributableLoots.push({ _id: lootToUpdate._id });
      }

      await page.save();
      res.send(lootToUpdate);
  
    } catch(err) {
      handleError(res, err);
    }

});

/** POST Method
 *  {
 *    pageId: ObjectId;
 *    memberId: ObjectId;
 *  }
 */
router.post('/claim', async function(req, res, next) {
    let body = req.body;

    /** Validate request body. */
    const errors = validatePostClaim(body);
    if (errors.length > 0) {
        res.status(488).send({ statusCode: 488, message: errors[0], errors: errors });
        return;
    }

    try {
      const page = await Page.findByIdOrThrowError(body.pageId);
      
      const member = page.team.id(body.memberId);

      /** Remove from member distributable list and add to their claimedLoots list. */
      member.claimedLoots = member.claimedLoots.concat(member.distributableLoots);
      member.distributableLoots = [];

      await page.save();
      res.send({});
  
    } catch(err) {
      handleError(res, err);
    }

});



/** DELETE Method
 *  {
 *    pageId: ObjectId;
 *    lootId: ObjectId;
 *  }
 */
/* DELETE loot. */
router.delete('/', async function(req, res, next) {
  const body = {
    pageId: req.query.pageId,
    lootId: req.query.lootId
  }

  /** Validate request body. */
  const errors = validateDelete(body);
  if (errors.length > 0) {
    res.status(488).send({ statusCode: 488, message: errors[0], errors: errors });
    return;
  }

  try {
    const page = await Page.findByIdOrThrowError(body.pageId);
    
    page.loots.id(body.lootId).remove();

    /** Remove any dependencies. */
    for (let member of page.team) {
      member.distributableLoots.id(body.lootId)?.remove()
    }

    await page.save();
    res.send({});

  } catch(err) {
    handleError(res, err);
  }

});


const validatePost = (body) => {
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

    /** Loots is required. */
    if (body.loots == null) {
      errors.push("The field 'loots' is required.");
    }
    /** Loots must be an array. */
    else if (!isArray(body.loots)) {
      errors.push("The field 'loots' must be an array.");
    }
    /** Loots must not be an empty array. */
    else if (body.loots.length === 0) {
      errors.push("The field 'loots' must have at least 1 item.");
    }

    return errors;
}


const validatePostSell = (body) => {
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

    /** Loot id is required. */
    if (body.lootId == null) {
      errors.push("The field 'lootId' is required.");
    }
    /** Loot id must be a string. */
    else if (!isString(body.lootId)) {
      errors.push("The field 'lootId' must be a string.");
    } 
    /** Object ID must be 24 characters. */
    else if (body.lootId.length !== 24) {
      errors.push("The field 'lootId' must be 24 characters.");
    }

    /** Loot is required. */
    if (body.soldOn == null) {
      errors.push("The field 'soldOn' is required.");
    }
    /** Item ids must be an array. */
    else if (!isDate(body.soldOn)) {
      errors.push("The field 'loot.soldOn' must be a date.");
    }

    return errors;
}


const validatePostClaim = (body) => {
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

    /** Loot id is required. */
    if (body.memberId == null) {
      errors.push("The field 'memberId' is required.");
    }
    /** Loot id must be a string. */
    else if (!isString(body.memberId)) {
      errors.push("The field 'memberId' must be a string.");
    } 
    /** Object ID must be 24 characters. */
    else if (body.memberId.length !== 24) {
      errors.push("The field 'memberId' must be 24 characters.");
    }

    return errors;
}

const validateDelete = (body) => {
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

    /** Loot id is required. */
    if (body.lootId == null) {
      errors.push("The field 'lootId' is required.");
    }
    /** Loot id must be a string. */
    else if (!isString(body.lootId)) {
      errors.push("The field 'lootId' must be a string.");
    } 
    /** Object ID must be 24 characters. */
    else if (body.lootId.length !== 24) {
      errors.push("The field 'lootId' must be 24 characters.");
    }

    return errors;
}

module.exports = router;

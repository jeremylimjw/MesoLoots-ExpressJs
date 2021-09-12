var express = require('express');
var router = express.Router();

const { isString, isBetween, isDate, isArray } = require('../common/typecheck');
const { handleError } = require('../common/httpError');
const { Page, Loot } = require('../models');

/** POST Method
 *  {
 *    pageId: ObjectId;
 *    loots: Loot[];
 *  }
 */
router.post('/', function(req, res, next) {
    let body = req.body;

    /** Validate request body. */
    const errors = validatePost(body);
    if (errors.length > 0) {
        res.status(488).send({ statusCode: 488, message: errors[0], errors: errors });
        return;
    }

    let newLoots;
    Promise.all(body.loots.map(loot => Loot.create(loot)))
      .then(results => {
        newLoots = results;
        
        return Page.findById(body.pageId);
      })
      .then(page => {
        if (page == null) {
          throw { statusCode: 400, message: `Page id ${body.pageId} not found.`}
        }

        for (let newLoot of newLoots) {
          page.loots.push(newLoot);
        }

        return page.save();
      })
      .then(() => {
        res.send(newLoots);
      })
      .catch(err => handleError(res, err));

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
router.post('/sell', function(req, res, next) {
    let body = req.body;

    /** Validate request body. */
    const errors = validatePostSell(body);
    if (errors.length > 0) {
        res.status(488).send({ statusCode: 488, message: errors[0], errors: errors });
        return;
    }

    let lootToUpdate;
    Page.findById(body.pageId).then(page => {
        if (page == null) {
          throw { statusCode: 400, message: `Page id ${body.pageId} not found.`}
        }

        lootToUpdate = page.loots.id(body.lootId);
        lootToUpdate.soldOn = body.soldOn;
        lootToUpdate.soldPrice = body.soldPrice | 0;
        lootToUpdate.distributable = body.distributable | 0;

        /** Add to the member's distributable list. */
        for (let member of lootToUpdate.party) {
          page.team.id(member._id)?.distributableLoots.push({ _id: lootToUpdate._id });
        }

        // /** Remove from members distributable list and add to their claimedLoots list. */
        // for (let member of lootToUpdate.party) {
        //   page.team.id(member._id)?.distributableLoots.id(lootToUpdate._id).remove();
        //   page.team.id(member._id)?.claimedLoots.push({ _id: lootToUpdate._id });
        // }

        return page.save();
      })
      .then(() => {
        res.send(lootToUpdate);
      })
      .catch(err => handleError(res, err));

});

/** POST Method
 *  {
 *    pageId: ObjectId;
 *    memberId: ObjectId;
 *  }
 */
router.post('/claim', function(req, res, next) {
    let body = req.body;

    /** Validate request body. */
    const errors = validatePostClaim(body);
    if (errors.length > 0) {
        res.status(488).send({ statusCode: 488, message: errors[0], errors: errors });
        return;
    }

    Page.findById(body.pageId).then(page => {
        if (page == null) {
          throw { statusCode: 400, message: `Page id ${body.pageId} not found.`}
        }

        const member = page.team.id(body.memberId);

        /** Remove from member distributable list and add to their claimedLoots list. */
        member.claimedLoots = member.claimedLoots.concat(member.distributableLoots);
        member.distributableLoots = [];

        return page.save();
      })
      .then(() => {
        res.send({});
      })
      .catch(err => handleError(res, err));

});



/** DELETE Method
 *  {
 *    pageId: ObjectId;
 *    lootId: ObjectId;
 *  }
 */
/* DELETE loot. */
router.delete('/', function(req, res, next) {
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

  Page.findById(body.pageId).then(page => {
    if (page == null) {
      throw { statusCode: 400, message: `Page id ${body.pageId} not found.`}
    }
    page.loots.id(body.lootId).remove();
    for (let member of page.team) {
      member.distributableLoots.id(body.lootId)?.remove()
    }
    return page.save();
  })
  .then(result => res.send(result))
  .catch(err => handleError(res, err));

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

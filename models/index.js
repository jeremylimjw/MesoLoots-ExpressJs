const mongoose = require('mongoose');
const { throwError } = require('../common/httpError');

const { Schema } = mongoose;

const memberSchema = new Schema({
  name: { type: String, required: true },
  jobId: { type: Number, required: true },
  distributableLoots: { type: [{ _id: mongoose.ObjectId }], default: [] },
  claimedLoots: { type: [{ _id: mongoose.ObjectId }], default: [] },
  createdAt: { type: Date, default: Date.now },
  lastClaimed: Date,
});

const lootSchema = new Schema({
  party: { type: [{ _id: mongoose.ObjectId }], default: [] },
  itemId: { type: Number, required: true },
  bossId: { type: Number, required: true },
  droppedOn: { type: Date, required: true },
  soldOn: Date,
  soldPrice: String,
  distributable: String,
  claimedOn: Date,
});

const pageSchema = new Schema({
  name: { type: String, unique: true, required: true },
  private: { type: Boolean, required: true },
  password: String,
  team: { type: [memberSchema], default: [] },
  loots: { type: [lootSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  lastPasswordChanged: { type: Date, default: undefined },
  lastNameChanged: { type: Date, default: undefined },
}); 

pageSchema.statics.findByIdOrThrowError = async function(id) {
  const page = await this.findById(id);
  if (page == null) {
    throwError(400, `Page id ${body.pageId} not found.`);
  }
  return page;
};

const Page = mongoose.model('Page', pageSchema);

module.exports = { Page };
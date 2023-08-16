const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  content: { type: String },
});

const answerSchema = new mongoose.Schema({
  question: [],
  answer: [],
});

const groupSchema = new mongoose.Schema({
  groupId: { type: String },
  groupName: { type: String, required: true },
  description: { type: String, required: true },
  paid: { type: Boolean, required: true },
  groupLink: { type: String, required: true },
  template: [templateSchema],
});

const communitySchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  description: { type: String },
  banner: { type: String },
  displayProfile: { type: String },
  groupRules: { type: String },
  paid: { type: Boolean, required: true },
  groupLink: { type: String, required: true },
  numberAdd:{type:Boolean},
  groupId:{type:String},
  questionSet: [],
  answerSet: [answerSchema],
  events:[]
});

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  whatsappNumber: { type: Number, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  group: [groupSchema],
  community: [communitySchema],
});

const userModel = mongoose.model("user", userSchema);

module.exports = {
  userModel,
};

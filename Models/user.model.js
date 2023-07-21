const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  content: { type: String },
});

const groupSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  groupName: { type: String, required: true },
  description: { type: String, required: true },
  paid: { type: Boolean, required: true },
  groupLink: { type: String, required: true },
  template: [templateSchema],
});

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  whatsappNumber: { type: Number, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  group: [groupSchema],
});

const userModel = mongoose.model("user", userSchema);

module.exports = {
  userModel,
};

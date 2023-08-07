const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
  numberid: { type: String, required: true },
  number: { type: Number, required: true },
  token: { type: String, required: true },
  numberofgroups:{type: Number},
  status:{ type:Boolean }
});

const tokenModel = mongoose.model("token", tokenSchema);

module.exports = {
  tokenModel,
};

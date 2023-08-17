const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  content: { type: String },
});

const answerSchema = new mongoose.Schema({
  question: [],
  answer: [],
});

const eventSchema=new mongoose.Schema({
  eventTitle:{type:String,required:true},
  eventDate:{type:String,required:true},
  eventTime:{type:String,required:true},
  eventDuration:{type:String,required:true},
  eventLocation:{type:String,required:true},
  eventLocationDetails:{type:String,required:true},
  eventDetails:{type:String,required:true},
  eventCoverImage:{type:String,required:true},
  eventPaid:{type:Boolean,required:true},
  eventAmount:{type:Number,required:true},
})

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
  events:[eventSchema]
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

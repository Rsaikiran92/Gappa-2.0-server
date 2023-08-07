const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose.connect("mongodb+srv://gappa:NJCI8wzsNuWNjGpY@cluster0.oqj5yw1.mongodb.net/gappa?retryWrites=true&w=majority");

module.exports = { connection };

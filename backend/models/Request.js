const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  foodId: String,
  userId: String,
  status: { type: String, default: "pending" }
});

module.exports = mongoose.model("Request", requestSchema);
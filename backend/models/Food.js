const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  title: String,
  qty: String,
  dt: String,
  photo: String,
  status: { type: String, default: "PENDING" },
  otp: String,
  donorName: String,
  donorEmail: String,
  donorMobile: String, 
  address: String,
  receivedBy: String,
  ngoEmail: String,
  ngoMobile: String,
  ngoLocation: String,
  claimedByEmail: String 
});

module.exports = mongoose.model("Food", foodSchema);
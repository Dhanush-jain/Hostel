const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true, // prevents double voting
  },
  food: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Vote", voteSchema);
const mongoose = require("mongoose");

const RoomAllocationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admission",
      required: true,
    },
    room: String,
    bed: String,
    status: {
      type: String,
      default: "Allocated",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RoomAllocation", RoomAllocationSchema);
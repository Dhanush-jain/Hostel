const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  hostel: { type: String, required: true },
  feeReceipt: { type: String },   // image filename
  photo: { type: String },        // optional profile photo

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Admission", studentSchema);
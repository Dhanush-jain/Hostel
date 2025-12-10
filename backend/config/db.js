const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = "mongodb://127.0.0.1:27017/hostelDB";

    if (!uri) {
      throw new Error("MongoDB URI is missing!");
    }

    await mongoose.connect(uri);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
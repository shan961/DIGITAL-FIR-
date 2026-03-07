// db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = "mongodb://127.0.0.1:27017/smartFIR"; // local MongoDB
    await mongoose.connect(mongoURI); // no options needed in Mongoose 7+
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
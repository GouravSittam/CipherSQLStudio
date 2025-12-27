/**
 * MongoDB Connection
 *
 * Using mongoose to connect to MongoDB Atlas.
 * Connection string should be in .env file.
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Exit process with failure code - no point running without DB
    process.exit(1);
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');

/**
 * Connect to MongoDB. Throws on failure so server.js can handle it.
 */
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;

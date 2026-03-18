const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/booking-system';
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected:', mongoose.connection.host);
};

module.exports = connectDB;

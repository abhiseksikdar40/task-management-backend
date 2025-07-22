const mongoose = require('mongoose');
require('dotenv').config();

const mongoUrl = process.env.MONGODB;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const taskManagementData = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("Database connected:", mongoose.connection.name);
    return cached.conn;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

module.exports = { taskManagementData };

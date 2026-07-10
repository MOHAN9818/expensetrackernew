const mongoose = require('mongoose');
const createMemoryStore = require('./memoryStore');

let store;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Mongo db error "+error.message);
    return null;
  }
};

const getStore = () => store;

module.exports = { connectDB, getStore };

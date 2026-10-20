const mongoose = require('mongoose');
const dns = require('dns');
const createMemoryStore = require('./memoryStore');

let store;

const connectDB = async (retries = 5, delay = 2000) => {
  // When using mongodb+srv URIs on Windows or certain routers, Node's default DNS
  // resolver may fail with querySrv ECONNREFUSED. Setting public DNS resolvers prevents this.
  if (process.env.MONGO_URI && process.env.MONGO_URI.includes('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    } catch (dnsErr) {
      console.warn('Unable to set custom DNS servers:', dnsErr.message);
    }
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`Retrying connection in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('All MongoDB connection attempts failed. Check internet connection and Atlas IP Access List.');
        return null;
      }
    }
  }
};

const getStore = () => store;

module.exports = { connectDB, getStore };

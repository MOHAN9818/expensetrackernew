const mongoose = require('mongoose');
const dns = require('dns');
const createMemoryStore = require('./memoryStore');

let store;

const connectDB = async () => {
  try {
    // When using mongodb+srv URIs on Windows or certain routers, Node's default DNS
    // resolver may fail with querySrv ECONNREFUSED. Setting public DNS resolvers prevents this.
    if (process.env.MONGO_URI && process.env.MONGO_URI.includes('mongodb+srv://')) {
      try {
        dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
      } catch (dnsErr) {
        console.warn('Unable to set custom DNS servers:', dnsErr.message);
      }
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Mongo db error: " + error.message);
    return null;
  }
};

const getStore = () => store;

module.exports = { connectDB, getStore };

const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/project1';

if (uri.includes('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (e) {}
}

async function test() {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
    
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ email: String }));
    const user = await User.findOne({ email: 'test@test.com' });
    console.log('Query result:', user);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}
test();

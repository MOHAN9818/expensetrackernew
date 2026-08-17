const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/project1');
    console.log('Connected to MongoDB');
    const User = mongoose.model('User', new mongoose.Schema({ email: String }));
    const user = await User.findOne({ email: 'test@test.com' });
    console.log('Query result:', user);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
}
test();

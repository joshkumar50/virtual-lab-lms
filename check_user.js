require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./backend/models/User');

const MONGO = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/virtual-lab-lms';

async function checkUser() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  const email = 'josh@gmail.com';
  const passwordToTest = '123456';

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    console.log(`User ${email} NOT FOUND in database.`);
  } else {
    console.log(`User ${email} FOUND.`);
    console.log(`User Name: ${user.name}`);
    console.log(`User Role: ${user.role}`);
    console.log(`User IsActive: ${user.isActive}`);
    
    const isMatch = await bcrypt.compare(passwordToTest, user.password);
    console.log(`Password '123456' match: ${isMatch}`);
    
    if (!isMatch) {
        // Just for debugging, let's see why it might not match
        // Maybe it's not hashed? (unlikely but good to check)
        console.log(`Hashed password in DB: ${user.password}`);
    }
  }

  await mongoose.disconnect();
}

checkUser().catch(console.error);

require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../src/models/User');

const email = (process.argv[2] || '').trim().toLowerCase();

const main = async () => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Pass the exact Google account email to promote.');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required to promote a Google account.');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email }).select('+googleId');
  if (!user || !user.googleId || user.emailVerified !== true) {
    throw new Error('No verified Google account found for that email. Sign in with Google first.');
  }
  if (user.status !== 'active') {
    throw new Error(`Cannot promote an account with status "${user.status}".`);
  }
  if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw new Error(`Cannot promote an account with role "${user.role}".`);
  }

  if (user.role !== 'SUPER_ADMIN') {
    user.role = 'SUPER_ADMIN';
    await user.save();
  }

  console.log(`Verified Google account ${user.email} has SUPER_ADMIN access.`);
};

main()
  .catch((error) => {
    console.error('Could not promote Google account:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });

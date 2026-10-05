// Deletes ONLY the test accounts made by Person 1's code
// (the "users", "otps" and "organizations" collections) so the database can start clean.
// It never touches campaigns or donations.
//
// Run:  node scripts/reset-auth-data.js --yes
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  if (!process.argv.includes('--yes')) {
    console.log('This deletes ALL users, otps and organizations in the database.');
    console.log('If you are sure, run:  node scripts/reset-auth-data.js --yes');
    process.exit(0);
  }
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing in your .env file.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  for (const name of ['users', 'otps', 'organizations']) {
    try {
      await mongoose.connection.dropCollection(name);
      console.log(`Deleted collection: ${name}`);
    } catch (err) {
      console.log(`Nothing to delete in: ${name}`);
    }
  }
  await mongoose.disconnect();
  console.log('Done. Now start the server again with: npm run dev');
})();

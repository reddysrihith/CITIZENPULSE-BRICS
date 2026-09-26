const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Job = require('../models/Job');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await Job.updateMany(
    { status: 'pending' },
    { $set: { status: 'approved' } }
  );
  console.log(`Successfully approved pending jobs: matched=${result.matchedCount}, modified=${result.modifiedCount}`);
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
});

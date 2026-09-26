const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const client = await User.findOne({ email: 'srihithc@gmail.com' });
  const jobs = await Job.find({ client: client._id });
  console.log(`Jobs found for client (${client.email}):`, jobs);
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
});

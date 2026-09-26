const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const users = await User.find()
    .select('name email role isVerified isTwoFactorEnabled createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const jobs = await Job.find()
    .populate('client', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

  const bids = await Bid.find()
    .populate('job', 'title')
    .populate('freelancer', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

  console.log('USERS');
  users.forEach((user) => {
    console.log(`${user._id} | ${user.role} | ${user.name} | ${user.email} | verified=${user.isVerified} | 2fa=${user.isTwoFactorEnabled}`);
  });

  console.log('\nJOBS');
  jobs.forEach((job) => {
    console.log(`${job._id} | ${job.title} | client=${job.client?.name || 'none'} <${job.client?.email || 'none'}>`);
  });

  console.log('\nBIDS');
  bids.forEach((bid) => {
    console.log(`${bid._id} | ${bid.job?.title || bid.job} | freelancer=${bid.freelancer?.name || 'none'} <${bid.freelancer?.email || 'none'}> | amount=${bid.amount} | status=${bid.status}`);
  });

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const client = await User.findOne({ role: 'client', email: 'srihithcs@gmail.com' });
  const freelancer = await User.findOne({ role: 'freelancer' }).sort({ createdAt: 1 });

  if (!client) {
    throw new Error('Could not find the srihithcs@gmail.com client account.');
  }

  if (!freelancer) {
    throw new Error('Could not find a freelancer account for the test proposal.');
  }

  const job = await Job.findOneAndUpdate(
    { title: 'Razorpay Smoke Test Gig' },
    {
      title: 'Razorpay Smoke Test Gig',
      description: 'Verify Razorpay order creation',
      category: 'Web Development',
      requiredSkills: ['React', 'Razorpay'],
      skills: ['React', 'Razorpay'],
      budget: 22000,
      client: client._id,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const bid = await Bid.findOneAndUpdate(
    { job: job._id, freelancer: freelancer._id },
    {
      job: job._id,
      freelancer: freelancer._id,
      amount: 21000,
      proposal: 'Accepted proposal for Razorpay checkout testing.',
      estimatedTime: '3 days',
      status: 'accepted',
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await Bid.deleteMany({ job: job._id, _id: { $ne: bid._id } });
  await Payment.deleteMany({ proposal: bid._id, status: { $in: ['paid', 'released'] } });

  console.log(`Razorpay smoke test ready: job=${job._id}, proposal=${bid._id}, client=${client.email}, freelancer=${freelancer.email}`);

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

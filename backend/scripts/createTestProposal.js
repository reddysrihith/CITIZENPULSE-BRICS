const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const job = await Job.findOne({ title: 'E-commerce React Application' });
  if (!job) {
    console.error('Job "E-commerce React Application" not found.');
    await mongoose.disconnect();
    return;
  }

  const freelancer = await User.findOne({ email: 'freelancer@example.com' });
  if (!freelancer) {
    console.error('Freelancer freelancer@example.com not found.');
    await mongoose.disconnect();
    return;
  }

  // Clean old bids for this job
  await Bid.deleteMany({ job: job._id });

  // Create accepted bid
  const bid = await Bid.create({
    job: job._id,
    freelancer: freelancer._id,
    amount: 45000,
    proposal: 'I can build this responsive E-commerce storefront beautifully using React and Tailwind CSS in 5 days. I have 3 years of React experience.',
    estimatedTime: '5 days',
    status: 'accepted',
  });

  // Increment proposal array in Job
  job.proposals = [bid._id];
  await job.save();

  console.log(`Successfully created accepted proposal for job: ${job.title}`);
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
});

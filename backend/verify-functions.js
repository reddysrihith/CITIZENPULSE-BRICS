const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('./models/Job');
const User = require('./models/User');

dotenv.config();

const verifyFunctions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB Connected for Verification');
    
    // 1. Check if we can find a user
    const user = await User.findOne();
    if (!user) {
      console.log('No user found to test with.');
      process.exit(0);
    }
    console.log(`Found user: ${user.email}`);

    // 2. Try to "Post a Job" (internal check)
    const testJob = await Job.create({
      title: 'Test Premium Job',
      description: 'Verifying that job posting works properly.',
      budget: 500,
      category: 'Design',
      skills: ['React', 'Tailwind'],
      client: user._id,
      status: 'open'
    });
    console.log(`Job posting working! Created Job: ${testJob.title}`);

    // 3. Cleanup
    await Job.findByIdAndDelete(testJob._id);
    console.log('Test Job cleaned up.');

    process.exit(0);
  } catch (err) {
    console.error(`Verification Failed: ${err.message}`);
    process.exit(1);
  }
};

verifyFunctions();

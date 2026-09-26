const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // Find all users that do NOT start with 'srihith'
  const usersToDelete = await User.find({ email: { $not: /^srihith/i } });
  const userIds = usersToDelete.map(u => u._id);

  console.log(`Found ${userIds.length} users to delete:`, usersToDelete.map(u => u.email));

  if (userIds.length > 0) {
    // Delete payments associated with these users (either as client or freelancer)
    const paymentRes = await Payment.deleteMany({
      $or: [
        { client: { $in: userIds } },
        { freelancer: { $in: userIds } }
      ]
    });
    console.log(`Deleted ${paymentRes.deletedCount} payments.`);

    // Delete bids associated with these users
    const bidRes = await Bid.deleteMany({ freelancer: { $in: userIds } });
    console.log(`Deleted ${bidRes.deletedCount} bids.`);

    // Delete jobs created by these users
    const jobRes = await Job.deleteMany({ client: { $in: userIds } });
    console.log(`Deleted ${jobRes.deletedCount} jobs.`);

    // Finally, delete the users
    const userRes = await User.deleteMany({ _id: { $in: userIds } });
    console.log(`Deleted ${userRes.deletedCount} users.`);
  }

  // Double check all users remaining
  const remaining = await User.find({});
  console.log('Remaining users in database:', remaining.map(u => `${u.name} (${u.email}) [${u.role}]`));

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
});

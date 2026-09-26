const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const result = await User.updateMany(
    {},
    {
      $set: {
        isVerified: true,
        isTwoFactorEnabled: false,
      },
      $unset: {
        twoFactorSecret: '',
        otp: '',
        otpExpires: '',
      },
    }
  );

  console.log(`Updated users: matched=${result.matchedCount}, modified=${result.modifiedCount}`);
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

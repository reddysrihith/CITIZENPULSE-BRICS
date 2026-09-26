const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // Clean old admins to ensure fresh state
  await User.deleteMany({ email: { $in: ['admin@skillsphere.in', 'admin@skillsphere.com', 'testadmin@skillsphere.com'] } });

  // Create admin@skillsphere.in
  const adminIn = await User.create({
    name: 'SkillSphere Admin',
    email: 'admin@skillsphere.in',
    password: 'Admin@12345',
    role: 'admin',
    isVerified: true,
    isSuspended: false,
  });
  console.log(`Created admin@skillsphere.in: ${adminIn._id}`);

  // Create admin@skillsphere.com (as a backup in case the user types .com)
  const adminCom = await User.create({
    name: 'SkillSphere Admin Backup',
    email: 'admin@skillsphere.com',
    password: 'Admin@12345',
    role: 'admin',
    isVerified: true,
    isSuspended: false,
  });
  console.log(`Created admin@skillsphere.com: ${adminCom._id}`);

  await mongoose.disconnect();
  console.log('Test admin accounts created successfully!');
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await User.deleteMany({ email: { $ne: 'admin@skillsphere.in' } });
  console.log(`Deleted ${result.deletedCount} user(s). Database is now clean (admin preserved).`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

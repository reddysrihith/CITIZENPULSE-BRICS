const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await User.deleteMany({ email: { $in: ['client@example.com', 'freelancer@example.com'] } });
  
  await User.create([
    { name: 'Example Client', email: 'client@example.com', password: 'password123', role: 'client', isVerified: true },
    { name: 'Example Freelancer', email: 'freelancer@example.com', password: 'password123', role: 'freelancer', isVerified: true }
  ]);
  
  console.log('Successfully seeded users: client@example.com, freelancer@example.com (password: password123)');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

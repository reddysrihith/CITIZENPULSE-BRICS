const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');
const Dispute = require('../models/Dispute');
const AdminLog = require('../models/AdminLog');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

const ADMIN_EMAIL = 'admin@skillsphere.in';
const ADMIN_PASSWORD = 'Admin@12345';

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  let admin = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

  if (!admin) {
    admin = await User.create({
      name: 'SkillSphere Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
      isSuspended: false,
    });
  } else {
    admin.name = admin.name || 'SkillSphere Admin';
    admin.role = 'admin';
    admin.isVerified = true;
    admin.isSuspended = false;
    admin.password = ADMIN_PASSWORD;
    await admin.save();
  }

  const jobResult = await Job.updateMany(
    { status: { $exists: false } },
    { $set: { status: 'approved' } }
  );

  const payment = await Payment.findOne().sort({ createdAt: -1 });
  const bid = payment ? await Bid.findById(payment.proposal) : await Bid.findOne().sort({ createdAt: -1 });
  const job = payment ? await Job.findById(payment.job) : bid ? await Job.findById(bid.job) : await Job.findOne();
  const client = payment ? await User.findById(payment.client) : await User.findOne({ role: 'client' });
  const freelancer = payment ? await User.findById(payment.freelancer) : await User.findOne({ role: 'freelancer' });

  if (client && job) {
    await Dispute.findOneAndUpdate(
      { reason: 'Milestone payment review required' },
      {
        payment: payment?._id,
        job: job._id,
        proposal: bid?._id,
        openedBy: client._id,
        againstUser: freelancer?._id,
        reason: 'Milestone payment review required',
        description: 'Client reported that the submitted milestone needs admin mediation before release.',
        status: 'under_review',
        priority: 'high',
        fraudRisk: 'medium',
        adminNotes: 'Seeded dispute for admin dashboard testing.',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  await AdminLog.findOneAndUpdate(
    { action: 'admin_setup' },
    {
      admin: admin._id,
      action: 'admin_setup',
      targetType: 'System',
      message: 'Admin setup script prepared the admin dashboard test data',
      metadata: { adminEmail: ADMIN_EMAIL },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin ready: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Jobs marked approved: matched=${jobResult.matchedCount}, modified=${jobResult.modifiedCount}`);

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

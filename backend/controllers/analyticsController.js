const Job = require('../models/Job');
const Payment = require('../models/Payment');
const User = require('../models/User');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (role === 'freelancer') {
      // Freelancer Analytics
      
      // Weekly Earnings
      const weeklyPayments = await Payment.aggregate([
        { $match: { freelancer: userId, status: 'paid', createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const weeklyEarnings = weeklyPayments.length > 0 ? weeklyPayments[0].total : 0;

      // Calculate trend chart (earnings per day for last 7 days)
      const dailyPayments = await Payment.aggregate([
        { $match: { freelancer: userId, status: 'paid', createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dayOfWeek: "$createdAt" },
            total: { $sum: '$amount' }
          }
        }
      ]);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      // initialize last 7 days
      const trendChart = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayOfWeek = d.getDay() + 1; // 1-7 (Sun-Sat)
        const match = dailyPayments.find(p => p._id === dayOfWeek);
        trendChart.push({
          day: dayNames[dayOfWeek - 1],
          val: match ? match.total : 0,
        });
      }

      // Completion Rate (Mocked for now since we don't have explicit project completion states yet)
      const completionRate = 95.0; // placeholder

      // Profile Views
      const user = await User.findById(userId);
      const profileViews = user.profileViews || 0;
      
      // Client Rating
      const clientRating = user.averageRating || 0;

      res.status(200).json({
        success: true,
        data: {
          stats: [
            { label: 'Weekly Earnings', value: `₹${weeklyEarnings.toLocaleString()}`, change: '+10%', isPositive: true },
            { label: 'Completion Rate', value: `${completionRate}%`, change: '+2%', isPositive: true },
            { label: 'Profile Views', value: profileViews.toString(), change: '+5%', isPositive: true },
            { label: 'Client Rating', value: `${clientRating.toFixed(1)} / 5`, change: 'Good', isPositive: true },
          ],
          trendChart
        }
      });
    } else if (role === 'client') {
      // Client Analytics
      const allPayments = await Payment.aggregate([
        { $match: { client: userId, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalSpent = allPayments.length > 0 ? allPayments[0].total : 0;

      const activeJobsCount = await Job.countDocuments({ client: userId });

      // Unique freelancers hired
      const hiredFreelancers = await Payment.distinct('freelancer', { client: userId, status: 'paid' });

      res.status(200).json({
        success: true,
        data: {
          stats: [
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, change: '', isPositive: true },
            { label: 'Active Jobs', value: activeJobsCount.toString(), change: '', isPositive: true },
            { label: 'Hired Freelancers', value: hiredFreelancers.length.toString(), change: '', isPositive: true },
            { label: 'Platform Rating', value: '4.8 / 5', change: '', isPositive: true },
          ],
          trendChart: []
        }
      });
    } else {
      res.status(403).json({ success: false, message: 'Analytics not available for this role' });
    }
  } catch (error) {
    next(error);
  }
};

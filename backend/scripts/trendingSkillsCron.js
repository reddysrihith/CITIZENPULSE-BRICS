const cron = require('node-cron');
const Job = require('../models/Job');
const TrendingSkill = require('../models/TrendingSkill');

const computeTrendingSkills = async () => {
  try {
    console.log('📈 Starting trending skills computation...');
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Aggregate skills from last 30 days
    const recentJobs = await Job.find({ createdAt: { $gte: thirtyDaysAgo } });
    const recentSkills = {};
    recentJobs.forEach(job => {
      const skills = job.requiredSkills && job.requiredSkills.length > 0 ? job.requiredSkills : (job.skills || []);
      skills.forEach(s => {
        const name = s.toLowerCase().trim();
        recentSkills[name] = (recentSkills[name] || 0) + 1;
      });
    });

    // Aggregate skills from 30-60 days ago
    const olderJobs = await Job.find({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
    const olderSkills = {};
    olderJobs.forEach(job => {
      const skills = job.requiredSkills && job.requiredSkills.length > 0 ? job.requiredSkills : (job.skills || []);
      skills.forEach(s => {
        const name = s.toLowerCase().trim();
        olderSkills[name] = (olderSkills[name] || 0) + 1;
      });
    });

    // Compute trends and update DB
    await TrendingSkill.deleteMany({}); // Clear old trends
    
    const trendingList = [];
    for (const [skillName, currentCount] of Object.entries(recentSkills)) {
      const previousCount = olderSkills[skillName] || 0;
      let growthPercent = 0;
      let tag = '✅ Stable';

      if (previousCount === 0) {
        growthPercent = 100;
        tag = currentCount > 2 ? '🔥 Hot' : '📈 Rising';
      } else {
        growthPercent = Math.round(((currentCount - previousCount) / previousCount) * 100);
        if (growthPercent >= 50) tag = '🔥 Hot';
        else if (growthPercent > 10) tag = '📈 Rising';
        else if (growthPercent < -10) tag = '📉 Declining';
      }

      trendingList.push({
        skillName,
        count: currentCount,
        growthPercent,
        tag
      });
    }

    if (trendingList.length > 0) {
      await TrendingSkill.insertMany(trendingList);
    }
    console.log(`✅ Trending skills computed successfully. Found ${trendingList.length} skills.`);
  } catch (error) {
    console.error('❌ Error computing trending skills:', error);
  }
};

const startCron = () => {
  // Run every 24 hours at midnight
  cron.schedule('0 0 * * *', computeTrendingSkills);
  console.log('⏰ Trending skills cron job scheduled.');
  
  // Also run once on startup for immediate testing
  setTimeout(computeTrendingSkills, 5000);
};

module.exports = startCron;

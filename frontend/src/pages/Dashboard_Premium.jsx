import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getJobs } from '../redux/slices/jobSlice';
import { Briefcase, Users, IndianRupee, TrendingUp, CheckCircle, Clock, ArrowUpRight, Zap, Activity, Target, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FreelancerRecommendationWidget from '../components/ai-matching/FreelancerRecommendationWidget';
import TrendingSkillsBanner from '../components/ai-matching/TrendingSkillsBanner';
import ReceivedInvitationsWidget from '../components/ai-matching/ReceivedInvitationsWidget';
import Counter from '../components/animations/Counter';
import { Activity as AnalyticsIcon, MessageSquare as MessageIcon, Settings as SettingsIcon, HelpCircle as HelpIcon } from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

// Data
const CLIENT_CARDS = [
  {
    title: 'Active Projects',
    value: 12,
    icon: Briefcase,
    trend: '+2.5%',
    color: 'blue',
    gradient: 'from-blue-500/10 to-blue-600/10',
  },
  {
    title: 'Total Proposals',
    value: 48,
    icon: Users,
    trend: '+12%',
    color: 'purple',
    gradient: 'from-purple-500/10 to-purple-600/10',
  },
  {
    title: 'Total Spent',
    value: 85450,
    icon: IndianRupee,
    prefix: '₹',
    color: 'emerald',
    gradient: 'from-emerald-500/10 to-emerald-600/10',
  },
  {
    title: 'Completion Rate',
    value: 98,
    icon: CheckCircle,
    suffix: '%',
    color: 'cyan',
    gradient: 'from-cyan-500/10 to-cyan-600/10',
  },
];

const FREELANCER_CARDS = [
  {
    title: 'Active Gigs',
    value: 3,
    icon: Briefcase,
    color: 'blue',
    gradient: 'from-blue-500/10 to-blue-600/10',
  },
  {
    title: 'Open Applications',
    value: 15,
    icon: Clock,
    trend: '+4',
    color: 'amber',
    gradient: 'from-amber-500/10 to-amber-600/10',
  },
  {
    title: 'Total Earnings',
    value: 64240,
    icon: IndianRupee,
    prefix: '₹',
    trend: '+18%',
    color: 'emerald',
    gradient: 'from-emerald-500/10 to-emerald-600/10',
  },
  {
    title: 'Profile Views',
    value: 240,
    icon: Users,
    trend: '+10%',
    color: 'purple',
    gradient: 'from-purple-500/10 to-purple-600/10',
  },
];

// Color mapping
const colorConfig = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: 'bg-blue-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: 'bg-purple-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: 'bg-emerald-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', icon: 'bg-cyan-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: 'bg-amber-500/20' },
};

// Animated Stat Card
const StatCardPremium = ({ card, index, onCardClick }) => {
  const colors = colorConfig[card.color];
  const numValue = typeof card.value === 'number' ? card.value : parseInt(card.value);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative cursor-pointer"
      onClick={() => onCardClick(card)}
    >
      <div className={`glass-card p-8 rounded-2xl overflow-hidden ${card.gradient} border border-white/10 transition-all duration-300`}>
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{
            background: `linear-gradient(135deg, rgb(99, 102, 241), rgb(124, 58, 237), rgb(99, 102, 241))`,
            backgroundSize: '200% 200%',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={`p-4 rounded-2xl ${colors.bg} border ${colors.border}`}
            >
              <card.icon className={`w-6 h-6 ${colors.text}`} />
            </motion.div>

            {card.trend && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              >
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold">{card.trend}</span>
              </motion.div>
            )}
          </div>

          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            {card.title}
          </p>

          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="text-4xl font-black text-white mb-1"
          >
            {card.prefix && <span className="text-2xl">{card.prefix}</span>}
            <Counter value={numValue} />
            {card.suffix && <span className="text-2xl">{card.suffix}</span>}
          </motion.h3>

          {/* Animated underline */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
            className={`h-1 rounded-full ${colors.bg} mt-4`}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Recent Activity Card
const ActivityCard = ({ job, userRole }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className="p-6 border-l-2 border-primary-500/30 hover:border-primary-500/60 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
          <Briefcase className="w-5 h-5 text-primary-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold mb-1">{job.title}</h4>
          <p className="text-slate-400 text-sm mb-3 line-clamp-2">{job.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-primary-400 font-bold">₹{job.budget?.toLocaleString()}</span>
            <Link to={userRole === 'client' ? `/jobs?manage=${job._id}` : `/jobs?apply=${job._id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-bold border border-primary-500/30 hover:bg-primary-500 hover:text-white transition-all"
              >
                {userRole === 'client' ? 'Manage' : 'Apply'}
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { jobs } = useSelector((state) => state.jobs);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  const statCards = user?.role === 'client' ? CLIENT_CARDS : FREELANCER_CARDS;

  const getDetailedInfo = (card) => {
    const details = {
      'Active Gigs': {
        description: 'Number of projects you are currently working on',
        breakdown: [
          { label: 'In Progress', value: '2', color: 'blue' },
          { label: 'On Hold', value: '1', color: 'amber' },
        ],
        insight: 'You are maintaining a healthy workload. Consider taking on more projects to increase earnings.'
      },
      'Open Applications': {
        description: 'Total applications you have submitted for available jobs',
        breakdown: [
          { label: 'Under Review', value: '8', color: 'blue' },
          { label: 'Accepted', value: '4', color: 'emerald' },
          { label: 'Rejected', value: '3', color: 'red' },
        ],
        insight: 'Your acceptance rate is strong at 33%. Keep applying to increase opportunities.'
      },
      'Total Earnings': {
        description: 'Cumulative income from all completed projects',
        breakdown: [
          { label: 'This Month', value: '₹18,240', color: 'emerald' },
          { label: 'Last Month', value: '₹15,000', color: 'blue' },
          { label: 'Total YTD', value: '₹64,240', color: 'purple' },
        ],
        insight: 'Excellent growth! Your earnings are up 21.6% from last month.'
      },
      'Profile Views': {
        description: 'Number of times your profile has been visited by clients',
        breakdown: [
          { label: 'This Week', value: '85', color: 'blue' },
          { label: 'This Month', value: '240', color: 'purple' },
          { label: 'Avg per Day', value: '8.6', color: 'cyan' },
        ],
        insight: 'Your profile visibility is strong. Update your skills to attract more clients.'
      },
      'Active Projects': {
        description: 'Number of projects you are currently managing',
        breakdown: [
          { label: 'Ongoing', value: '8', color: 'blue' },
          { label: 'Completed', value: '24', color: 'emerald' },
          { label: 'Total', value: '32', color: 'purple' },
        ],
        insight: 'Great project completion rate of 75%. Continue at this pace.'
      },
      'Total Proposals': {
        description: 'Proposals received from freelancers for your projects',
        breakdown: [
          { label: 'Reviewed', value: '32', color: 'blue' },
          { label: 'Selected', value: '12', color: 'emerald' },
          { label: 'Pending', value: '4', color: 'amber' },
        ],
        insight: 'You have strong candidate pool. Average selection rate is 37.5%.'
      },
      'Total Spent': {
        description: 'Total amount spent on freelancer projects',
        breakdown: [
          { label: 'This Month', value: '₹25,000', color: 'emerald' },
          { label: 'Last Month', value: '₹30,000', color: 'blue' },
          { label: 'Average Project', value: '₹2,665', color: 'purple' },
        ],
        insight: 'Budget is well-managed with 16.7% decrease from last month.'
      },
      'Completion Rate': {
        description: 'Percentage of projects completed successfully',
        breakdown: [
          { label: 'Successful', value: '24', color: 'emerald' },
          { label: 'In Progress', value: '8', color: 'blue' },
          { label: 'Success Rate', value: '98%', color: 'purple' },
        ],
        insight: 'Excellent completion rate! You are a reliable project partner.'
      },
    };
    return details[card.title] || {
      description: 'No detailed information available',
      breakdown: [],
      insight: 'Check back soon for more insights.'
    };
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleScrollFix = () => {
    const modal = document.querySelector('.glass-card');
    if (modal) {
      modal.style.overflowY = 'auto';
    }
  };

  useEffect(() => {
    handleScrollFix();
  }, []);

  const additionalFeatures = [
    {
      title: 'Analytics',
      description: 'View detailed analytics of your performance.',
      icon: AnalyticsIcon,
      link: '/analytics',
    },
    {
      title: 'Messages',
      description: 'Check your messages and notifications.',
      icon: MessageIcon,
      link: '/messages',
    },
    {
      title: 'Settings',
      description: 'Manage your account settings.',
      icon: SettingsIcon,
      link: '/settings',
    },
    {
      title: 'Help Center',
      description: 'Get support and find answers.',
      icon: HelpIcon,
      link: '/help',
    },
  ];

  return (
    <>
      {/* Card Info Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 rounded-3xl max-w-2xl w-full border-white/10 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${colorConfig[selectedCard.color].bg} border ${colorConfig[selectedCard.color].border}`}>
                    <selectedCard.icon className={`w-8 h-8 ${colorConfig[selectedCard.color].text}`} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white">{selectedCard.title}</h3>
                    <p className="text-slate-400 text-sm mt-1">{getDetailedInfo(selectedCard).description}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCard(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </motion.button>
              </div>

              {/* Main Value Section */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-3">Current Value</p>
                  <p className="text-5xl font-black text-white">
                    {selectedCard.prefix && <span className="text-3xl">{selectedCard.prefix}</span>}
                    {selectedCard.value}
                    {selectedCard.suffix && <span className="text-3xl">{selectedCard.suffix}</span>}
                  </p>
                </div>

                {selectedCard.trend && (
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-3">Growth Trend</p>
                    <p className="flex items-center gap-2 text-4xl font-black text-emerald-400">
                      <TrendingUp className="w-8 h-8" />
                      {selectedCard.trend}
                    </p>
                  </div>
                )}
              </div>

              {/* Breakdown Section */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                  <div className="w-1.5 h-6 bg-primary-500 rounded-full mr-3" />
                  Detailed Breakdown
                </h4>
                <div className="space-y-3">
                  {getDetailedInfo(selectedCard).breakdown.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-${item.color}-400`} />
                        <span className="text-slate-300 font-semibold">{item.label}</span>
                      </div>
                      <span className="text-white font-black text-lg">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Insights Section */}
              <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-8">
                <p className="text-slate-300 font-semibold mb-2 flex items-center">
                  <Zap className="w-5 h-5 text-cyan-400 mr-2" />
                  Smart Insight
                </p>
                <p className="text-cyan-300 text-sm leading-relaxed">{getDetailedInfo(selectedCard).insight}</p>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCard(null)}
                className="w-full py-3 rounded-2xl bg-primary-500/20 text-primary-400 font-bold border border-primary-500/30 hover:bg-primary-500 hover:text-white transition-all"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dashboard */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-12 pb-20"
      >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="relative">
        <div className="glass-card p-12 rounded-3xl overflow-hidden border-white/5">
          {/* Background animation */}
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(135deg, rgb(99, 102, 241), rgb(124, 58, 237), rgb(99, 102, 241))',
              backgroundSize: '200% 200%',
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <motion.div className="flex items-center gap-3 mb-4">
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-4 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-wider"
              >
                {user?.role} Dashboard
              </motion.span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Live</span>
            </motion.div>

            <h1 className="text-5xl lg:text-6xl font-black text-white mb-4">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">{user?.name?.split(' ')[0]}</span>
              <span className="ml-3 text-5xl">👋</span>
            </h1>

            <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
              Your {user?.role === 'client' ? 'project management' : 'freelance'} hub is ready. Keep track of your work and stay productive.
            </p>


          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCardPremium key={index} card={card} index={index} onCardClick={handleCardClick} />
        ))}
      </motion.div>

      {/* Trending Skills Banner */}
      <motion.div variants={itemVariants}>
        <TrendingSkillsBanner onSkillClick={(skill) => navigate(`/jobs?search=${encodeURIComponent(skill)}`)} />
      </motion.div>

      {/* Received Invitations for Freelancers */}
      {user?.role === 'freelancer' && (
        <motion.div variants={itemVariants}>
          <ReceivedInvitationsWidget />
        </motion.div>
      )}

      {/* AI Freelancer Recommendations */}
      {user?.role === 'client' && (
        <motion.div variants={itemVariants}>
          <FreelancerRecommendationWidget clientUser={user} />
        </motion.div>
      )}

      {/* Recent Jobs Section */}
      <motion.div variants={itemVariants}>
        <div className="glass-card rounded-3xl overflow-hidden border-white/5">
          <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
                <Briefcase className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="text-2xl font-black text-white">
                {user?.role === 'client' ? 'Recent Projects' : 'Recommended Opportunities'}
              </h2>
            </div>
            <Link to="/jobs">
              <motion.button
                whileHover={{ scale: 1.05, x: 4 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 font-bold text-sm border border-primary-500/30 hover:bg-primary-500 hover:text-white transition-all flex items-center gap-2"
              >
                View All
                <ArrowUpRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>

          {/* Activity List */}
          <div className="divide-y divide-white/5">
            {jobs.slice(0, 5).map((job) => (
              <ActivityCard key={job._id} job={job} userRole={user?.role} />
            ))}
          </div>

          {/* Empty State */}
          {jobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">No jobs available yet</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: user?.role === 'client' ? 'Post a Job' : 'Find Work',
            description: user?.role === 'client' ? 'Create a new project and find talented freelancers' : 'Browse and apply for jobs',
            icon: Zap,
            color: 'primary',
            link: user?.role === 'client' ? '/jobs/new' : '/jobs',
          },
          {
            title: 'View Profile',
            description: user?.role === 'client' ? 'Manage your account and preferences' : 'Showcase your skills and portfolio',
            icon: Users,
            color: 'purple',
            link: '/profile',
          },
        ].map((action, i) => (
          <Link key={i} to={action.link}>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card p-8 rounded-2xl cursor-pointer group border-white/5 hover:border-primary-500/30 transition-all"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 w-fit mb-4 group-hover:bg-primary-500 group-hover:text-white transition-all"
              >
                <action.icon className="w-6 h-6 text-primary-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
              <p className="text-slate-400 text-sm">{action.description}</p>
              <motion.div
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
                className="h-1 bg-primary-500/50 mt-4 rounded-full"
              />
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Additional Features */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {additionalFeatures.map((feature, i) => (
          <Link key={i} to={feature.link}>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card p-8 rounded-2xl cursor-pointer group border-white/5 hover:border-primary-500/30 transition-all"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 w-fit mb-4 group-hover:bg-primary-500 group-hover:text-white transition-all"
              >
                <feature.icon className="w-6 h-6 text-primary-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
              <motion.div
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
                className="h-1 bg-primary-500/50 mt-4 rounded-full"
              />
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
    </>
  );
};

export default Dashboard;

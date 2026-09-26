import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data.data || []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const markRead = async (notification) => {
    if (notification.read) return;

    setNotifications((items) => items.map((item) => (
      item._id === notification._id ? { ...item, read: true } : item
    )));

    try {
      await api.patch(`/notifications/${notification._id}/read`);
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  const formatTime = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle2 className="text-emerald-400 w-6 h-6" />;
      case 'alert': return <AlertCircle className="text-amber-400 w-6 h-6" />;
      default: return <Bell className="text-primary-400 w-6 h-6" />;
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-8 max-w-4xl mx-auto"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-4xl font-extrabold text-white font-heading tracking-tight">Notifications</h1>
        <p className="text-slate-400 mt-2 text-lg font-medium">Stay updated with your latest activities and messages.</p>
      </motion.div>

      <div className="space-y-4">
        {isLoading && (
          <div className="glass-card p-6 rounded-[2rem] border-white/5 text-slate-400 font-semibold">
            Loading notifications...
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="glass-card p-8 rounded-[2rem] border-white/5 text-center">
            <Bell className="w-10 h-10 text-primary-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold font-heading">No notifications yet</h3>
            <p className="text-slate-400 mt-2 font-medium">New gig, proposal, payment, message, review, and dispute updates will appear here.</p>
          </div>
        )}

        {notifications.map((n) => (
          <motion.div 
            key={n._id}
            variants={itemVariants}
            whileHover={{ x: 8, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
            onClick={() => markRead(n)}
            className={`glass-card p-6 rounded-[2rem] flex items-start space-x-6 border-white/5 relative overflow-hidden group transition-colors cursor-pointer ${n.read ? 'opacity-70' : ''}`}
          >
            <div className={`absolute top-0 left-0 w-1.5 h-full ${n.read ? 'bg-slate-600' : 'bg-primary-500'} opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="bg-slate-900/50 p-4 rounded-2xl shadow-inner border border-white/5">
              {getIcon(n.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white text-lg font-bold font-heading">{n.title}</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full">{formatTime(n.createdAt)}</span>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed">{n.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Notifications;

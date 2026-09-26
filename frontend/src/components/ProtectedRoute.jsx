import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getMe } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // If the token is available in local storage but the user details are not fully in state
    if (user && (!user.name || !user.role)) {
      dispatch(getMe());
    }
  }, [user, dispatch]);

  if (isLoading && (!user || !user.name || !user.role)) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-950/20 via-slate-950 to-purple-950/20" />
        
        {/* Glass card spinner container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-xl flex flex-col items-center max-w-sm w-full relative z-10"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full mb-6"
          />
          <h3 className="text-xl font-bold text-white mb-2">Syncing Workspace</h3>
          <p className="text-slate-400 text-sm text-center">Loading your personalized freelance ecosystem...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

import { motion } from 'framer-motion';

export const PremiumButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden relative';
  
  const variants = {
    primary: 'btn-premium',
    glass: 'btn-glass',
    neon: 'btn-neon',
    ghost: 'px-6 py-3 text-white hover:bg-white/10 transition-colors',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const PremiumCard = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      className={`card-premium ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`glass-card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  trend,
  color = 'blue',
  className = ''
}) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`stat-card bg-gradient-to-br ${colorClasses[color]} ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-500/20`}>
          {Icon && <Icon className={`w-6 h-6 text-${color}-400`} />}
        </div>
        {trend && (
          <span className="text-sm font-bold text-emerald-400">{trend}</span>
        )}
      </div>
      <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
  );
};

export const AnimatedBadge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'badge-premium',
    neon: 'badge-neon',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`${variants[variant]} ${className}`}
    >
      {children}
    </motion.span>
  );
};

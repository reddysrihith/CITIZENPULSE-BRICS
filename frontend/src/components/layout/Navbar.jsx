import { useSelector } from 'react-redux';
import { Bell, Search, Menu, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = ({ onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <motion.button 
          type="button"
          onClick={onMenuClick}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          whileTap={{ scale: 0.95 }}
          className="lg:hidden p-2 rounded-lg text-slate-400 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </motion.button>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />
            <motion.div
              initial={false}
              whileFocus="focused"
              className="relative"
            >
              <input 
                type="text" 
                placeholder="Search for projects, freelancers..." 
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all"
              />
              <motion.div 
                className="absolute bottom-0 left-1/2 h-[2px] bg-primary-500 origin-center"
                initial={{ width: 0, x: "-50%" }}
                whileFocus={{ width: "100%", x: "-50%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <Link to="/notifications">
            <motion.div 
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all group"
            >
              <Bell className="w-5 h-5" />
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-[#0f172a] group-hover:bg-primary-400"
              />
            </motion.div>
          </Link>

          {/* User Info */}
          <div className="flex items-center space-x-3 pl-6 border-l border-white/5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white font-heading flex items-center justify-end gap-1">
                {user?.name}
                {user?.isVerifiedBadge && (
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400 fill-blue-400/10 shrink-0" />
                )}
              </p>
              <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

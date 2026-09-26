import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout, reset } from '../redux/slices/authSlice';
import { Bell, Menu, Search, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './ui/Logo';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.95 }} className="lg:hidden p-2 rounded-lg text-slate-400">
            <Menu className="w-5 h-5" />
          </motion.button>

          <Link to="/" className="inline-block">
            <Logo size="sm" />
          </Link>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-xl mx-6">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
            <input placeholder="Search projects, freelancers..." className="w-full bg-transparent border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/notifications" className="relative">
            <motion.div whileHover={{ scale: 1.06 }} className="p-2 rounded-xl text-slate-300">
              <Bell className="w-5 h-5" />
            </motion.div>
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary-500 rounded-full border-2 border-[#0f172a]" />
          </Link>

          <div className="pl-4 border-l border-white/5 flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-white">{user?.name}</p>
              <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{user?.role}</p>
            </div>

            <button onClick={onLogout} className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/8 text-sm font-medium text-white/90 border border-white/5">
              <LogOut className="w-4 h-4 inline-block mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

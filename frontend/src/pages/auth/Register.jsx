import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerUser, reset } from '../../redux/slices/authSlice';
import { User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroScene from '../../components/3d/HeroScene';
import AnimatedInput from '../../components/ui/AnimatedInput';
import { PremiumButton } from '../../components/ui/PremiumUI';
import { MeshBackground, ParticleBackground } from '../../components/effects/BackgroundEffects';
import { Logo } from '../../components/ui/Logo';
import { API_BASE_URL } from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'freelancer',
  });

  const { name, email, password, role } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess || user) {
      navigate('/dashboard');
    }
    return () => dispatch(reset());
  }, [isSuccess, user, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 px-6 lg:px-8 bg-[#0f172a] overflow-hidden">
      <MeshBackground />
      <ParticleBackground />
      <HeroScene />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mx-auto w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <Logo size="lg" iconOnly={true} />
        </div>
        <h2 className="text-center text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-heading tracking-tight">
          Join SkillSphere
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-400 hover:text-primary-300 transition-colors">
            Sign in here
          </Link>
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08, duration: 0.5 }}
        className="mt-8 relative z-10 mx-auto w-full max-w-md"
      >
        <div className="glass-card py-10 sm:py-12 lg:py-14 px-6 sm:px-12 shadow-2xl rounded-2xl sm:rounded-[2.5rem] border-white/5">
          <AnimatePresence mode="wait">
            {isError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm font-bold flex items-center"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 mr-3 animate-pulse" />
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-400 ml-1">I want to...</label>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, role: 'freelancer' })}
                  className={`relative py-3.5 px-4 text-xs font-bold uppercase tracking-widest rounded-2xl border transition-all ${role === 'freelancer' ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-900/50 border-white/10 text-slate-500 hover:text-slate-300'}`}
                >
                  Work
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, role: 'client' })}
                  className={`relative py-3.5 px-4 text-xs font-bold uppercase tracking-widest rounded-2xl border transition-all ${role === 'client' ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-900/50 border-white/10 text-slate-500 hover:text-slate-300'}`}
                >
                  Hire
                </motion.button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-bold text-slate-400 ml-1">Full Name</label>
              <AnimatedInput
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={onChange}
                icon={User}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-slate-400 ml-1">Email Address</label>
              <AnimatedInput
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={onChange}
                icon={Mail}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-slate-400 ml-1">Password</label>
              <AnimatedInput
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={onChange}
                icon={Lock}
                placeholder="••••••••"
              />
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <PremiumButton type="submit" disabled={isLoading} className="w-full justify-center" size="lg">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>}
              </PremiumButton>
            </motion.div>

            {/* Divider */}
            <div className="my-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-slate-500 bg-[#0f172a]/60 backdrop-blur">
                  Or register with
                </span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <a 
                href={`${API_BASE_URL}/auth/google`}
                className="w-full py-4 px-4 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg shadow-white/5 border border-white/10"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </a>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

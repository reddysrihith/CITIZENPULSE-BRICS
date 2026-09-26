import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset, logout, verifyTwoFactorLogin } from '../../redux/slices/authSlice';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroScene from '../../components/3d/HeroScene';
import { Logo } from '../../components/ui/Logo';
import { MeshBackground, ParticleBackground } from '../../components/effects/BackgroundEffects';
import { API_BASE_URL } from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message, requiresTwoFactor, twoFactorToken } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(logout());
    dispatch(reset());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && user) {
      navigate('/dashboard');
    }
  }, [isSuccess, user, navigate]);

  useEffect(() => {
    return () => dispatch(reset());
  }, [dispatch]);

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (requiresTwoFactor) {
      dispatch(verifyTwoFactorLogin({ twoFactorToken, token: twoFactorCode }));
    } else {
      dispatch(login(formData));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen relative bg-slate-950 overflow-hidden">
      {/* Background Effects */}
      <MeshBackground />
      <ParticleBackground />
      <HeroScene />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"
        animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl pointer-events-none"
        animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Logo & Welcome Section */}
          <motion.div variants={itemVariants} className="text-center mb-10 flex flex-col items-center justify-center">
            <div className="mb-6">
              <Logo size="lg" iconOnly={true} />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-3 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-lg">
              Sign in to access your freelance workspace
            </p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {isError && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-pulse" />
                <p className="text-red-400 text-sm font-semibold">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Card */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-8 sm:p-10 relative overflow-hidden"
          >
            {/* Card decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

            <form onSubmit={onSubmit} autoComplete="off" className="relative space-y-6">
              {requiresTwoFactor ? (
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-primary-500/20 bg-primary-500/10 p-4">
                  <ShieldCheck className="h-5 w-5 text-primary-300" />
                  <p className="text-sm font-semibold text-slate-200">Enter the 6-digit code from your authenticator app.</p>
                </div>
                <label htmlFor="twoFactorCode" className="block text-sm font-bold text-slate-300">
                  Authenticator Code
                </label>
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    id="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="glass-input w-full pl-12 tracking-[0.35em] transition-all duration-300"
                  />
                </motion.div>
              </motion.div>
              ) : (
              <>
              <motion.div
                variants={itemVariants}
                className="space-y-3"
              >
                <label htmlFor="email" className="block text-sm font-bold text-slate-300">
                  Email Address
                </label>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  className="relative"
                >
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    className="glass-input w-full pl-12 transition-all duration-300"
                  />
                </motion.div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                variants={itemVariants}
                className="space-y-3"
              >
                <label htmlFor="password" className="block text-sm font-bold text-slate-300">
                  Password
                </label>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  className="relative"
                >
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={onChange}
                    placeholder="••••••••"
                    className="glass-input w-full pl-12 pr-12 transition-all duration-300"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Forgot Password Link */}
              <motion.div variants={itemVariants} className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </motion.div>
              </>
              )}

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-premium py-4 text-base font-bold tracking-wide flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      {requiresTwoFactor ? 'Verify Code' : 'Sign In'}
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Google OAuth Button */}
            <motion.div variants={itemVariants} className="mt-6">
              <a 
                href={`${API_BASE_URL}/auth/google`}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg shadow-white/5 border border-white/10"
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

            {/* Divider */}
            <div className="my-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-slate-500 bg-slate-900/60 backdrop-blur">
                  New to SkillSphere?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-slate-400">
                <Link
                  to="/register"
                  className="font-bold text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Create your account
                </Link>
                {' '}to get started
              </p>
            </motion.div>
          </motion.div>

          {/* Footer Features */}
          <motion.div
            variants={itemVariants}
            className="mt-8 grid grid-cols-3 gap-4 text-center text-sm"
          >
            {[
              { icon: '🔒', label: 'Secure' },
              { icon: '⚡', label: 'Fast' },
              { icon: '🎯', label: 'Reliable' },
            ].map((feature) => (
              <motion.div
                key={feature.label}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-slate-400"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <p className="text-xs font-semibold">{feature.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

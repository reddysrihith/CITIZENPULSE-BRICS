import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroScene from '../../components/3d/HeroScene';
import AnimatedInput from '../../components/ui/AnimatedInput';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 px-6 lg:px-8 bg-[#0f172a] overflow-hidden">
      <HeroScene />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="w-16 h-16 rounded-2xl premium-gradient flex items-center justify-center shadow-2xl shadow-primary-500/40"
          >
            <ShieldCheck className="w-10 h-10 text-white" />
          </motion.div>
        </div>
        <h2 className="text-center text-4xl font-extrabold text-white font-heading tracking-tight">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-medium">
          Enter your email and we'll send you instructions.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 relative z-10 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="glass-card py-10 px-8 shadow-2xl sm:rounded-[2.5rem] sm:px-12 border-white/5">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6" 
                onSubmit={onSubmit}
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-bold text-slate-400 ml-1">
                    Email Address
                  </label>
                  <AnimatedInput
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={Mail}
                    placeholder="you@example.com"
                  />
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-premium w-full flex justify-center items-center py-4 px-4 text-sm font-bold tracking-widest uppercase"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Mail className="w-10 h-10 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Check your inbox</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    We've sent password reset instructions to <br/>
                    <span className="text-white font-bold">{email}</span>
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSubmitted(false)}
                  className="text-primary-400 font-bold text-xs uppercase tracking-[2px]"
                >
                  Didn't receive the email? Try again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-8 border-t border-white/5">
            <Link 
              to="/login" 
              className="flex items-center justify-center text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

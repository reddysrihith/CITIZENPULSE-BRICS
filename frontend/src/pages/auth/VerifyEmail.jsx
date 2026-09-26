import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { verifyEmail, reset, logout } from '../../redux/slices/authSlice';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { verificationEmail, user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!verificationEmail && !user) {
      navigate('/register');
    }
    if (isSuccess && user) {
      navigate('/dashboard');
    }
    return () => dispatch(reset());
  }, [verificationEmail, user, isSuccess, navigate, dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(verifyEmail({ email: verificationEmail, otp }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-500/10 mix-blend-screen filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-violet-500/10 mix-blend-screen filter blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-3xl z-10 relative">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl premium-gradient flex items-center justify-center shadow-xl shadow-primary-500/20 mb-6">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight">Verify Email</h2>
          <p className="mt-3 text-slate-400 text-sm">
            We've sent a 6-digit verification code to <br />
            <span className="text-primary-400 font-semibold">{verificationEmail}</span>
          </p>
        </div>

        {isError && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
            <p className="text-sm text-red-400 font-medium">{message}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-4 px-4 text-center text-2xl font-bold tracking-[1em] text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="btn-premium w-full flex items-center justify-center"
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
            {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Didn't receive the code?{' '}
          <button className="text-primary-400 font-bold hover:text-primary-300 transition-colors">Resend</button>
        </p>

        <div className="mt-4 text-center">
          <button 
            onClick={() => {
              dispatch(logout());
              dispatch(reset());
              navigate('/login');
            }}
            className="text-sm text-slate-500 hover:text-white transition-colors"
          >
            Wrong account? <span className="font-bold underline">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

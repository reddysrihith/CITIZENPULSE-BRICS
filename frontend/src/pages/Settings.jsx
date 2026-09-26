import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../redux/slices/authSlice';
import api, { API_BASE_URL } from '../services/api';
import {
  User, Mail, Lock, Camera, Save, Bell,
  Eye, EyeOff, ShieldCheck, Briefcase,
  ToggleLeft, ToggleRight, CheckCircle, Calendar, Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedInput from '../components/ui/AnimatedInput';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};
const tabVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } }
};

const Alert = ({ msg, onDismiss }) => {
  if (!msg.text) return null;
  const isSuccess = msg.type === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className={`p-5 rounded-[1.5rem] border backdrop-blur-xl mb-6 cursor-pointer ${isSuccess ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
      onClick={onDismiss}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isSuccess ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
          <ShieldCheck className="w-5 h-5" />
        </div>
        <p className="font-bold">{msg.text}</p>
      </div>
    </motion.div>
  );
};

const PasswordInput = ({ label, name, value, show, onToggle, onChange }) => (
  <div className="space-y-3">
    <label className="text-sm font-bold text-slate-400 ml-1">{label}</label>
    <div className="relative">
      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 z-10" />
      <input
        name={name} type={show ? 'text' : 'password'} value={value} onChange={onChange}
        className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all placeholder:text-slate-600"
        placeholder="••••••••"
      />
      <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  </div>
);

// --- Tab: Profile Info ---
const ProfileTab = ({ user }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    skills: user?.skills?.map(s => s.name).join(', ') || '',
    profileImage: user?.profileImage || '',
  });

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const skillsArray = formData.skills.split(',').map(s => ({ name: s.trim(), proficiency: 'Intermediate' })).filter(s => s.name);
      const res = await api.put('/users/profile', { ...formData, skills: skillsArray });
      const updatedUser = res.data.user || res.data;
      dispatch(updateUser(updatedUser));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
      <AnimatePresence>{message.text && <Alert msg={message} onDismiss={() => setMessage({ type: '', text: '' })} />}</AnimatePresence>
      <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
        <div className="p-10 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-8">
            <motion.div whileHover={{ scale: 1.05 }} className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt={formData.name}
                  className="w-24 h-24 rounded-[2rem] object-cover shadow-2xl ring-4 ring-[#0f172a]"
                />
              ) : (
                <div className="w-24 h-24 rounded-[2rem] premium-gradient flex items-center justify-center text-white text-4xl font-black shadow-2xl ring-4 ring-[#0f172a]">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
              )}
              <motion.button onClick={triggerFileInput} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="absolute -bottom-2 -right-2 p-2.5 bg-primary-500 rounded-xl shadow-xl text-white hover:bg-primary-600 transition-all">
                <Camera className="w-5 h-5" />
              </motion.button>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white font-heading">{formData.name}</h2>
              <p className="text-primary-400 capitalize font-bold tracking-[2px] text-xs mt-1 uppercase">{user?.role}</p>
            </div>
          </div>
        </div>
        <form onSubmit={onSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">Full Name</label>
              <AnimatedInput icon={User} name="name" value={formData.name} onChange={onChange} />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">Email Address</label>
              <AnimatedInput icon={Mail} name="email" value={formData.email} onChange={onChange} />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-400 ml-1">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={onChange} rows="4"
              className="w-full px-6 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all resize-none placeholder:text-slate-600"
              placeholder="Tell us about yourself..." />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-400 ml-1">Skills (comma separated)</label>
            <AnimatedInput icon={Briefcase} name="skills" value={formData.skills} onChange={onChange} placeholder="React, Node.js, Figma..." />
          </div>
          <div className="pt-4 flex justify-end">
            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="btn-premium flex items-center px-10 py-4 text-sm font-bold tracking-widest uppercase">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" /> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

// --- Tab: Security & Password ---
const SecurityTab = ({ user }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const onChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPass.length < 6) { setMessage({ type: 'error', text: 'New password must be at least 6 characters.' }); return; }
    if (passwords.newPass !== passwords.confirm) { setMessage({ type: 'error', text: 'New passwords do not match.' }); return; }
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/users/profile', { password: passwords.newPass });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate2FA = async () => {
    setTwoFactorLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/auth/2fa/generate');
      setTwoFactorSetup(res.data);
      setMessage({ type: 'success', text: 'Scan the QR code and enter the 6-digit code to enable 2FA.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to start 2FA setup.' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (twoFactorCode.length !== 6) {
      setMessage({ type: 'error', text: 'Enter the 6-digit authenticator code.' });
      return;
    }
    setTwoFactorLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/auth/2fa/verify', { token: twoFactorCode });
      dispatch(updateUser(res.data.user));
      setTwoFactorSetup(null);
      setTwoFactorCode('');
      setMessage({ type: 'success', text: 'Two-factor authentication is now enabled.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid 2FA code.' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setTwoFactorLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/auth/2fa/disable');
      dispatch(updateUser(res.data.user));
      setTwoFactorSetup(null);
      setTwoFactorCode('');
      setMessage({ type: 'success', text: 'Two-factor authentication has been disabled.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to disable 2FA.' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
      <AnimatePresence>{message.text && <Alert msg={message} onDismiss={() => setMessage({ type: '', text: '' })} />}</AnimatePresence>

      <div className="glass-card rounded-[2.5rem] border-white/5 p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-heading">Change Password</h3>
            <p className="text-slate-500 text-sm">Use a strong password you don't use elsewhere.</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <PasswordInput label="Current Password" name="current" value={passwords.current} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} onChange={onChange} />
          <PasswordInput label="New Password" name="newPass" value={passwords.newPass} show={showNew} onToggle={() => setShowNew(!showNew)} onChange={onChange} />
          <PasswordInput label="Confirm New Password" name="confirm" value={passwords.confirm} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} onChange={onChange} />

          {/* Password strength indicator */}
          {passwords.newPass && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Strength</p>
              <div className="flex gap-1.5">
                {[1,2,3,4].map((lvl) => {
                  const strength = passwords.newPass.length >= lvl * 3 ? true : false;
                  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
                  return <div key={lvl} className={`h-1.5 flex-1 rounded-full transition-all ${strength ? colors[lvl-1] : 'bg-white/10'}`} />;
                })}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="btn-premium flex items-center px-10 py-4 text-sm font-bold tracking-widest uppercase">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" /> : <><ShieldCheck className="w-4 h-4 mr-2" />Update Password</>}
            </motion.button>
          </div>
        </form>
      </div>

      <div className="glass-card rounded-[2.5rem] border-white/5 p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-heading">Two-Factor Authentication</h3>
            <p className="text-slate-500 text-sm">Add an extra layer of security to your account.</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
          <div>
            <p className="text-white font-bold text-sm">Authenticator App</p>
            <p className="text-slate-500 text-xs mt-0.5">
              {user?.isTwoFactorEnabled ? 'Enabled for this account' : 'Use an app like Google Authenticator'}
            </p>
          </div>
          <motion.button
            type="button"
            onClick={user?.isTwoFactorEnabled ? handleDisable2FA : handleGenerate2FA}
            disabled={twoFactorLoading}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all">
            {twoFactorLoading ? 'Working...' : user?.isTwoFactorEnabled ? 'Disable' : 'Enable'}
          </motion.button>
        </div>
        {twoFactorSetup && !user?.isTwoFactorEnabled && (
          <form onSubmit={handleVerify2FA} className="mt-6 grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6 rounded-3xl border border-white/5 bg-slate-900/40 p-6">
            <div className="rounded-2xl bg-white p-3">
              <img src={twoFactorSetup.qrCode} alt="2FA QR code" className="h-full w-full rounded-xl" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-white font-bold">Scan and verify</p>
                <p className="text-slate-500 text-sm mt-1">Scan the QR code, then enter the current 6-digit code from your authenticator app.</p>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400">Authenticator Code</label>
                <input
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  inputMode="numeric"
                  className="mt-2 w-full bg-slate-950/70 border border-white/10 rounded-2xl py-3.5 px-4 text-white tracking-[0.35em] focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="123456"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={twoFactorLoading} className="btn-premium px-6 py-3 text-xs font-bold uppercase tracking-widest">
                  Verify & Enable
                </button>
                <button type="button" onClick={() => setTwoFactorSetup(null)} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};

// --- Tab: Notifications ---
const NotificationsTab = () => {
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('notificationPrefs');
    return saved ? JSON.parse(saved) : {
      emailNewProposal: true,
      emailMessages: true,
      emailJobUpdates: false,
      pushAll: true,
    };
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    setIsLoading(true);
    localStorage.setItem('notificationPrefs', JSON.stringify(prefs));
    setTimeout(() => {
      setIsLoading(false);
      setMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }, 600);
  };

  const items = [
    { key: 'emailNewProposal', label: 'New Proposals', desc: 'When someone applies to your job posting' },
    { key: 'emailMessages', label: 'New Messages', desc: 'When you receive a direct message' },
    { key: 'emailJobUpdates', label: 'Job Updates', desc: 'Status changes on your applications' },
    { key: 'pushAll', label: 'Push Notifications', desc: 'In-app notifications for all activity' },
  ];

  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <AnimatePresence>{message.text && <Alert msg={message} onDismiss={() => setMessage({ type: '', text: '' })} />}</AnimatePresence>
      <div className="glass-card rounded-[2.5rem] border-white/5 p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-heading">Notification Preferences</h3>
            <p className="text-slate-500 text-sm">Choose what you want to be notified about.</p>
          </div>
        </div>
        <div className="space-y-4">
          {items.map(item => (
            <motion.div key={item.key} whileHover={{ x: 4 }}
              className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 cursor-pointer"
              onClick={() => toggle(item.key)}
            >
              <div>
                <p className="text-white font-bold text-sm">{item.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
              </div>
              <motion.div animate={{ scale: prefs[item.key] ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                {prefs[item.key]
                  ? <ToggleRight className="w-8 h-8 text-primary-400" />
                  : <ToggleLeft className="w-8 h-8 text-slate-600" />
                }
              </motion.div>
            </motion.div>
          ))}
        </div>
        <div className="pt-8 flex justify-end">
          <motion.button onClick={handleSave} disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="btn-premium flex items-center px-10 py-4 text-sm font-bold tracking-widest uppercase">
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Save Preferences</>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Tab: Availability (Freelancers Only) ---
const AvailabilityTab = ({ user }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [availability, setAvailability] = useState({
    isAvailable: user?.availability?.isAvailable ?? true,
    workingDays: user?.availability?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    start: user?.availability?.workingHours?.start || '09:00',
    end: user?.availability?.workingHours?.end || '17:00'
  });

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        availability: {
          isAvailable: availability.isAvailable,
          workingDays: availability.workingDays,
          workingHours: { start: availability.start, end: availability.end }
        }
      };
      const res = await api.put('/users/profile', payload);
      dispatch(updateUser(res.data.user || res.data));
      setMessage({ type: 'success', text: 'Availability settings saved!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <AnimatePresence>{message.text && <Alert msg={message} onDismiss={() => setMessage({ type: '', text: '' })} />}</AnimatePresence>
      <div className="glass-card rounded-[2.5rem] border-white/5 p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-heading">Availability Calendar</h3>
            <p className="text-slate-500 text-sm">Manage your working hours and availability for new gigs.</p>
          </div>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 cursor-pointer" onClick={() => setAvailability(prev => ({...prev, isAvailable: !prev.isAvailable}))}>
            <div>
              <p className="text-white font-bold text-sm">Open for Work</p>
              <p className="text-slate-500 text-xs mt-0.5">Toggle if you are currently accepting new projects.</p>
            </div>
            <motion.div animate={{ scale: availability.isAvailable ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 400 }}>
              {availability.isAvailable
                ? <ToggleRight className="w-8 h-8 text-primary-400" />
                : <ToggleLeft className="w-8 h-8 text-slate-600" />
              }
            </motion.div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-400 ml-1">Working Days</label>
            <div className="flex flex-wrap gap-3">
              {DAYS.map(day => {
                const isActive = availability.workingDays.includes(day);
                return (
                  <button
                    key={day} type="button" onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isActive ? 'bg-primary-500/20 border border-primary-500/30 text-primary-300' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">Start Time</label>
              <input type="time" value={availability.start} onChange={(e) => setAvailability(prev => ({...prev, start: e.target.value}))}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">End Time</label>
              <input type="time" value={availability.end} onChange={(e) => setAvailability(prev => ({...prev, end: e.target.value}))}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="btn-premium flex items-center px-10 py-4 text-sm font-bold tracking-widest uppercase">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" /> : <><Save className="w-4 h-4 mr-2" />Save Schedule</>}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
// --- Tab: Connected Accounts ---
const ConnectedTab = ({ user }) => {
  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="glass-card rounded-[2.5rem] border-white/5 p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-heading">Connected Accounts</h3>
            <p className="text-slate-500 text-sm">Manage single sign-on connections and linked profiles.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.358-2.848-6.358-6.358s2.848-6.358 6.358-6.358c1.624 0 3.098.618 4.22 1.631l3.18-3.18C18.665 1.706 15.65 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.76 0 12.24-5.48 12.24-12.24 0-.825-.09-1.62-.27-2.385H12.24z"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm">Google Account</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {user?.googleId ? 'Linked to your Google profile' : 'Not connected'}
                </p>
              </div>
            </div>
            {user?.googleId ? (
              <span className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
                Connected
              </span>
            ) : (
              <a
                href={`${API_BASE_URL}/auth/google`}
                className="px-5 py-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all"
              >
                Connect
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Settings Page ---
const TABS = [
  { id: 'profile', label: 'Profile Information', icon: User },
  { id: 'availability', label: 'Availability', icon: Calendar, role: 'freelancer' },
  { id: 'connected', label: 'Connected Accounts', icon: Link2 },
  { id: 'security', label: 'Security & Password', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto space-y-10 pb-20">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-extrabold text-white font-heading tracking-tight">Account Settings</h1>
        <p className="text-slate-400 mt-2 text-lg font-medium">Manage your professional identity and preferences.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-2">
          {TABS.filter(tab => !tab.role || tab.role === user?.role).map(tab => (
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} whileHover={{ x: 4 }}
              className={`w-full flex items-center px-5 py-4 rounded-2xl font-bold transition-all text-sm uppercase tracking-widest ${
                activeTab === tab.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 border border-white/5 hover:bg-white/5'
              }`}>
              <tab.icon className="w-4 h-4 mr-3" />
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && <ProfileTab key="profile" user={user} />}
            {activeTab === 'availability' && <AvailabilityTab key="availability" user={user} />}
            {activeTab === 'connected' && <ConnectedTab key="connected" user={user} />}
            {activeTab === 'security' && <SecurityTab key="security" user={user} />}
            {activeTab === 'notifications' && <NotificationsTab key="notifications" />}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings;

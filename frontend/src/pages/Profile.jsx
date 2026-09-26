import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../redux/slices/authSlice';
import api from '../services/api';
import { uploadFile, fileToDataUri } from '../services/upload';
import { User, Mail, Briefcase, FileText, Camera, Save, ShieldCheck, Plus, ExternalLink, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedInput from '../components/ui/AnimatedInput';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const Profile = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    skills: '',
    role: '',
    hourlyRate: 0,
    username: '',
    profileImage: '',
    portfolio: [],
    resume: '',
    certifications: [],
    experience: [],
    isVerifiedBadge: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        const data = res.data.data || res.data;
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || '',
          skills: data.skills ? data.skills.map(s => s.name).join(', ') : '',
          role: data.role || '',
          hourlyRate: data.hourlyRate || 0,
          username: data.username || '',
          profileImage: data.profileImage || '',
          portfolio: data.portfolio || [],
          resume: data.resume || '',
          certifications: data.certifications || [],
          experience: data.experience || [],
          isVerifiedBadge: data.isVerifiedBadge || false
        });
      } catch (error) {
        console.error("Error fetching profile", error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const uploaded = await uploadFile(file, 'skillsphere/profile-images');
        setProfileData(prev => ({ ...prev, profileImage: uploaded.url }));
      } catch (error) {
        const preview = await fileToDataUri(file);
        setProfileData(prev => ({ ...prev, profileImage: preview }));
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const skillsArray = profileData.skills
        .split(',')
        .map(skill => ({ name: skill.trim(), proficiency: 'Intermediate' }))
        .filter(skill => skill.name !== '');

      const updateData = {
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio,
        skills: skillsArray,
        hourlyRate: profileData.hourlyRate,
        username: profileData.username,
        profileImage: profileData.profileImage,
        portfolio: profileData.portfolio,
        resume: profileData.resume,
        certifications: profileData.certifications,
        experience: profileData.experience
      };

      const res = await api.put('/users/profile', updateData);
      const updatedUser = res.data.user || res.data;
      dispatch(updateUser(updatedUser));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error updating profile' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="max-w-6xl mx-auto space-y-10"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white font-heading tracking-tight">Professional Profile</h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Update your digital identity and showcase your expertise.</p>
        </div>
        <div className="flex items-center space-x-3">
            <a
                href={`/public/${encodeURIComponent(profileData.username || profileData.email)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-2xl bg-white/5 text-white font-bold border border-white/10 hover:bg-white/10 transition-all flex items-center"
            >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public
            </a>
            <motion.button 
                onClick={handleSubmit}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-premium px-8 py-3 flex items-center text-sm font-bold tracking-widest uppercase"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </>
                )}
            </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-10">
          {/* Avatar Card */}
          <motion.div variants={itemVariants} className="glass-card p-10 rounded-[3rem] text-center relative overflow-hidden border-white/5">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary-500/20 to-transparent" />
            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative inline-block"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt={profileData.name}
                    className="w-32 h-32 rounded-[2.5rem] object-cover mx-auto shadow-2xl ring-4 ring-[#0f172a]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-[2.5rem] premium-gradient mx-auto flex items-center justify-center text-white text-5xl font-black shadow-2xl ring-4 ring-[#0f172a]">
                    {profileData.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <motion.button 
                  onClick={triggerFileInput}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-2 -right-2 p-3 bg-primary-500 rounded-2xl shadow-xl text-white hover:bg-primary-600 transition-all"
                >
                  <Camera className="w-5 h-5" />
                </motion.button>
              </motion.div>
              <h2 className="mt-8 text-2xl font-bold text-white font-heading flex items-center justify-center gap-1.5">
                {profileData.name}
                {profileData.isVerifiedBadge && (
                  <ShieldCheck className="w-5 h-5 text-blue-400 fill-blue-400/10 shrink-0" />
                )}
              </h2>
              <p className="text-primary-400 capitalize font-bold tracking-[3px] text-xs mt-2 uppercase">{user?.role}</p>
              
              <div className="mt-8 pt-8 border-t border-white/5 flex justify-center space-x-8">
                <div>
                  <p className="text-2xl font-black text-white">0</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Earnings</p>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div>
                  <p className="text-2xl font-black text-white">0</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Projects</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social / Links */}
          <motion.div variants={itemVariants} className="glass-card p-8 rounded-[2.5rem] border-white/5">
             <h3 className="text-white font-bold mb-6 flex items-center">
               <Plus className="w-4 h-4 mr-2 text-primary-400" />
               Connected Accounts
             </h3>
             <div className="space-y-4">
               {['GitHub', 'LinkedIn', 'Dribbble'].map(platform => (
                 <div key={platform} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary-500/30 transition-all cursor-pointer group">
                   <span className="text-slate-300 font-bold text-sm">{platform}</span>
                   <span className="text-[10px] text-slate-500 group-hover:text-primary-400 transition-colors uppercase tracking-widest font-bold">Connect</span>
                 </div>
               ))}
             </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <AnimatePresence>
            {message.text && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-5 rounded-[1.5rem] border backdrop-blur-xl ${
                  message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-4 ${message.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="font-bold tracking-tight">{message.text}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* General Section */}
            <motion.div variants={itemVariants} className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
              <h3 className="text-xl font-bold text-white mb-8 font-heading flex items-center">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full mr-4" />
                General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 ml-1">Full Name</label>
                  <AnimatedInput
                    icon={User}
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 ml-1">Email Address</label>
                  <AnimatedInput
                    icon={Mail}
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 ml-1">Username</label>
                  <AnimatedInput
                    icon={User}
                    name="username"
                    value={profileData.username}
                    onChange={handleChange}
                    placeholder="john_doe"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 ml-1">Hourly Rate (₹)</label>
                  <AnimatedInput
                    icon={IndianRupee}
                    type="number"
                    name="hourlyRate"
                    value={profileData.hourlyRate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </motion.div>

            {/* Professional Section */}
            <motion.div variants={itemVariants} className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
              <h3 className="text-xl font-bold text-white mb-8 font-heading flex items-center">
                <div className="w-1.5 h-6 bg-violet-500 rounded-full mr-4" />
                Professional Details
              </h3>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 ml-1">Bio / Headline</label>
                  <div className="relative group">
                    <motion.div className="relative">
                      <textarea 
                        name="bio"
                        value={profileData.bio}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-6 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:outline-none transition-all resize-none placeholder:text-slate-600"
                        placeholder="Expert React Developer specialized in premium SaaS experiences..."
                      />
                      <motion.div 
                        className="absolute bottom-0 left-1/2 h-[2px] bg-primary-500 origin-center"
                        initial={{ width: 0, x: "-50%" }}
                        whileFocus={{ width: "100%", x: "-50%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                      <FileText className="absolute right-4 top-4 w-5 h-5 text-slate-700" />
                    </motion.div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 ml-1">Expertise & Skills</label>
                  <AnimatedInput
                    icon={Briefcase}
                    name="skills"
                    value={profileData.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, Three.js, Figma..."
                  />
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Separate skills with commas</p>
                  {/* Portfolio Section */}
                  <div className="mt-6 space-y-4">
                    <h3 className="text-white font-bold text-lg mb-2">Portfolio</h3>
                    {profileData.portfolio && profileData.portfolio.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <AnimatedInput
                          icon={Briefcase}
                          placeholder="Project Title"
                          value={item.title}
                          onChange={(e) => {
                            const newPortfolio = [...profileData.portfolio];
                            newPortfolio[idx].title = e.target.value;
                            setProfileData({ ...profileData, portfolio: newPortfolio });
                          }}
                        />
                        <AnimatedInput
                          icon={Briefcase}
                          placeholder="Link"
                          value={item.link}
                          onChange={(e) => {
                            const newPortfolio = [...profileData.portfolio];
                            newPortfolio[idx].link = e.target.value;
                            setProfileData({ ...profileData, portfolio: newPortfolio });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newPortfolio = profileData.portfolio.filter((_, i) => i !== idx);
                            setProfileData({ ...profileData, portfolio: newPortfolio });
                          }}
                          className="text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newPortfolio = profileData.portfolio ? [...profileData.portfolio, { title: '', link: '' }] : [{ title: '', link: '' }];
                        setProfileData({ ...profileData, portfolio: newPortfolio });
                      }}
                      className="text-primary-400 hover:text-primary-300 font-semibold"
                    >
                      + Add Portfolio Item
                    </button>
                  </div>

                  {/* Certifications Section */}
                  <div className="mt-6 space-y-4">
                    <h3 className="text-white font-bold text-lg mb-2">Certifications</h3>
                    {profileData.certifications && profileData.certifications.map((cert, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <AnimatedInput
                          icon={Briefcase}
                          placeholder="Certification Name"
                          value={cert.name}
                          onChange={(e) => {
                            const newCerts = [...profileData.certifications];
                            newCerts[idx].name = e.target.value;
                            setProfileData({ ...profileData, certifications: newCerts });
                          }}
                        />
                        <AnimatedInput
                          icon={Briefcase}
                          placeholder="Issuer"
                          value={cert.issuer}
                          onChange={(e) => {
                            const newCerts = [...profileData.certifications];
                            newCerts[idx].issuer = e.target.value;
                            setProfileData({ ...profileData, certifications: newCerts });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newCerts = profileData.certifications.filter((_, i) => i !== idx);
                            setProfileData({ ...profileData, certifications: newCerts });
                          }}
                          className="text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newCerts = profileData.certifications ? [...profileData.certifications, { name: '', issuer: '' }] : [{ name: '', issuer: '' }];
                        setProfileData({ ...profileData, certifications: newCerts });
                      }}
                      className="text-primary-400 hover:text-primary-300 font-semibold"
                    >
                      + Add Certification
                    </button>
                  </div>

                  {/* Experience Section */}
                  <div className="mt-6 space-y-4">
                    <h3 className="text-white font-bold text-lg mb-2">Experience</h3>
                    {profileData.experience && profileData.experience.map((exp, idx) => (
                      <div key={idx} className="flex flex-col gap-2">
                        <AnimatedInput
                          icon={Briefcase}
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...profileData.experience];
                            newExp[idx].company = e.target.value;
                            setProfileData({ ...profileData, experience: newExp });
                          }}
                        />
                        <AnimatedInput
                          icon={Briefcase}
                          placeholder="Role"
                          value={exp.role}
                          onChange={(e) => {
                            const newExp = [...profileData.experience];
                            newExp[idx].role = e.target.value;
                            setProfileData({ ...profileData, experience: newExp });
                          }}
                        />
                        <AnimatedInput
                          icon={Briefcase}
                          placeholder="Duration"
                          value={exp.duration}
                          onChange={(e) => {
                            const newExp = [...profileData.experience];
                            newExp[idx].duration = e.target.value;
                            setProfileData({ ...profileData, experience: newExp });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newExp = profileData.experience.filter((_, i) => i !== idx);
                            setProfileData({ ...profileData, experience: newExp });
                          }}
                          className="text-red-500 hover:text-red-400 self-start"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newExp = profileData.experience ? [...profileData.experience, { company: '', role: '', duration: '' }] : [{ company: '', role: '', duration: '' }];
                        setProfileData({ ...profileData, experience: newExp });
                      }}
                      className="text-primary-400 hover:text-primary-300 font-semibold"
                    >
                      + Add Experience
                    </button>
                  </div>

                  {/* Resume Upload */}
                  <div className="mt-6">
                    <h3 className="text-white font-bold text-lg mb-2">Resume</h3>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const uploaded = await uploadFile(file, 'skillsphere/resumes');
                            setProfileData({ ...profileData, resume: uploaded.url });
                          } catch (error) {
                            const preview = await fileToDataUri(file);
                            setProfileData({ ...profileData, resume: preview });
                          }
                        }
                      }}
                      className="bg-slate-800 text-white p-2 rounded"
                    />
                    {profileData.resume && (
                      <p className="text-slate-400 mt-2">Resume attached</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;

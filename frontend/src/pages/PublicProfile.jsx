import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, MapPin, Star, Briefcase, Award, ExternalLink, Globe,
  Clock, CheckCircle, ArrowLeft, Code2, Loader2, Link2
} from 'lucide-react';


import { API_BASE_URL as API } from '../services/api';

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/users/public/${username}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('User not found');
          throw new Error('Failed to load profile');
        }
        const data = await res.json();
        setProfile(data.data || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const proficiencyColor = (level) => {
    if (level === 'Expert') return 'from-violet-500 to-purple-600';
    if (level === 'Intermediate') return 'from-blue-500 to-cyan-500';
    return 'from-slate-500 to-slate-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{error}</h2>
          <p className="text-slate-400 mb-6">The profile you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-10">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </motion.button>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-6"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(30,41,59,0.8) 50%, rgba(15,23,42,0.9) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Banner */}
          <div className="h-36 w-full" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 50%, #0f172a 100%)' }} />

          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4 flex items-end justify-between">
              <div className="relative">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} className="w-28 h-28 rounded-2xl object-cover border-4 border-[#0a0f1e] shadow-2xl" />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 border-4 border-[#0a0f1e] flex items-center justify-center shadow-2xl">
                    <span className="text-4xl font-black text-white">{profile.name?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                {profile.isVerifiedBadge && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#0a0f1e]">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Stats pills */}
              <div className="flex gap-3 pb-2">
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <span className="font-bold">{profile.averageRating?.toFixed(1) || '—'}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Rating</div>
                </div>
                {profile.hourlyRate && (
                  <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-green-400 font-bold">${profile.hourlyRate}/hr</div>
                    <div className="text-xs text-slate-500 mt-0.5">Rate</div>
                  </div>
                )}
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className={`font-semibold text-sm ${profile.availability?.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                    {profile.availability?.isAvailable ? 'Available' : 'Busy'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Status</div>
                </div>
              </div>
            </div>

            {/* Name & Role */}
            <h1 className="text-3xl font-black text-white mb-1">{profile.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium border border-violet-500/30 capitalize">
                {profile.role}
              </span>
              {profile.location?.city && (
                <span className="flex items-center gap-1 text-slate-400 text-sm">
                  <MapPin className="w-3.5 h-3.5" /> {profile.location.city}{profile.location.country ? `, ${profile.location.country}` : ''}
                </span>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-slate-300 text-base leading-relaxed max-w-2xl mb-5">{profile.bio}</p>
            )}

            {/* Social Links */}
            <div className="flex gap-3">
              {profile.socialLinks?.github && (
                <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm">
                  <Link2 className="w-4 h-4" /> GitHub
                </a>
              )}
              {profile.socialLinks?.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm">
                  <Link2 className="w-4 h-4" /> LinkedIn
                </a>
              )}
              {profile.socialLinks?.dribbble && (
                <a href={profile.socialLinks.dribbble} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm">
                  <Globe className="w-4 h-4" /> Dribbble
                </a>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Code2 className="w-5 h-5 text-violet-400" />
                  <h2 className="text-lg font-bold text-white">Skills</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.03 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5"
                    >
                      <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${proficiencyColor(skill.proficiency)}`} />
                      <span className="text-white text-sm font-medium">{skill.name}</span>
                      <span className="text-xs text-slate-500">{skill.proficiency}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Experience */}
            {profile.experience?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-bold text-white">Experience</h2>
                </div>
                <div className="space-y-5">
                  {profile.experience.map((exp, i) => (
                    <div key={i} className="relative pl-5 border-l border-white/10">
                      <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <h3 className="text-white font-semibold">{exp.role}</h3>
                      <p className="text-slate-400 text-sm">{exp.company}</p>
                      {exp.duration && (
                        <span className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Clock className="w-3 h-3" /> {exp.duration}
                        </span>
                      )}
                      {exp.description && <p className="text-slate-400 text-sm mt-2">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Portfolio */}
            {profile.portfolio?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <ExternalLink className="w-5 h-5 text-green-400" />
                  <h2 className="text-lg font-bold text-white">Portfolio</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.portfolio.map((item, i) => (
                    <a
                      key={i}
                      href={item.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
                    >
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                      )}
                      <h3 className="text-white font-semibold group-hover:text-violet-300 transition-colors">{item.title}</h3>
                      {item.description && <p className="text-slate-400 text-sm mt-1">{item.description}</p>}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* Certifications */}
            {profile.certifications?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-bold text-white">Certifications</h2>
                </div>
                <div className="space-y-4">
                  {profile.certifications.map((cert, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Award className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{cert.name}</p>
                        <p className="text-slate-400 text-xs">{cert.issuer}</p>
                        {cert.date && (
                          <p className="text-slate-500 text-xs mt-0.5">{new Date(cert.date).getFullYear()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Availability */}
            {profile.availability && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-bold text-white">Availability</h2>
                </div>
                <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-xl ${profile.availability.isAvailable ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  <div className={`w-2 h-2 rounded-full ${profile.availability.isAvailable ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <span className={`text-sm font-medium ${profile.availability.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                    {profile.availability.isAvailable ? 'Available for work' : 'Not available'}
                  </span>
                </div>
                {profile.availability.workingHours && (
                  <p className="text-slate-400 text-sm">
                    {profile.availability.workingHours.start} – {profile.availability.workingHours.end}
                  </p>
                )}
                {profile.availability.workingDays?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const fullDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i];
                      const active = profile.availability.workingDays.includes(fullDay);
                      return (
                        <span key={day} className={`px-2 py-1 rounded-lg text-xs font-medium ${active ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-slate-600 border border-white/5'}`}>
                          {day}
                        </span>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;

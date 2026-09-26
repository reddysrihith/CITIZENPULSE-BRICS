import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../redux/slices/jobSlice';
import { motion } from 'framer-motion';
import { Briefcase, CalendarClock, FileText, IndianRupee, Layers, MapPin, PenTool, Send } from 'lucide-react';
import AnimatedInput from '../components/ui/AnimatedInput';
import { uploadFile } from '../services/upload';

const PostJob = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.jobs);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    budgetMin: '',
    deadline: '',
    category: 'Design',
    skills: '',
    city: '',
    country: 'India',
    milestones: '',
    documents: ''
  });
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  const { title, description, budget, budgetMin, deadline, category, skills, city, country, milestones, documents } = formData;

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const parseLines = (value) => value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const onSubmit = async (e) => {
    e.preventDefault();
    const parsedMilestones = parseLines(milestones).map((line, index) => {
      const [titlePart, amountPart] = line.split('|').map((item) => item?.trim());
      return {
        title: titlePart || `Milestone ${index + 1}`,
        amount: Number(amountPart) || 0,
      };
    });

    const jobData = {
      title,
      description,
      budget: Number(budget),
      budgetMin: Number(budgetMin) || 0,
      budgetMax: Number(budget),
      deadline,
      category,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      location: { city, country },
      milestones: parsedMilestones,
      documents: [
        ...uploadedDocuments,
        ...parseLines(documents).map((url, index) => ({
        name: `Project document ${index + 1}`,
        url,
        type: 'link'
      }))
      ]
    };

    try {
      await dispatch(createJob(jobData)).unwrap();
      navigate('/jobs');
    } catch (err) {
      console.error('Failed to post job:', err);
    }
  };

  const onDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadFile(file, 'skillsphere/gig-documents');
      setUploadedDocuments(prev => [...prev, {
        name: file.name,
        url: uploaded.url,
        type: file.type || 'file'
      }]);
    } catch (err) {
      console.error('Document upload failed:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-4xl mx-auto"
    >
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-white font-heading tracking-tight">Post a New Project</h1>
        <p className="text-slate-400 mt-2 text-lg font-medium">Find the perfect expert for your professional needs.</p>
      </div>

      <motion.div 
        whileHover={{ y: -5 }}
        className="glass-card p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        
        <form className="space-y-8" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">Project Title</label>
              <AnimatedInput
                icon={Briefcase}
                name="title"
                value={title}
                onChange={onChange}
                required
                type="text" 
                placeholder="e.g. Design a modern landing page" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">Max Budget (INR)</label>
              <AnimatedInput
                icon={IndianRupee}
                name="budget"
                value={budget}
                onChange={onChange}
                required
                type="number" 
                placeholder="e.g. 10000" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">Min Budget (INR)</label>
              <AnimatedInput
                icon={IndianRupee}
                name="budgetMin"
                value={budgetMin}
                onChange={onChange}
                type="number"
                placeholder="e.g. 5000"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">Deadline</label>
              <AnimatedInput
                icon={CalendarClock}
                name="deadline"
                value={deadline}
                onChange={onChange}
                type="date"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">Category</label>
              <AnimatedInput icon={Layers}>
                <div className="relative">
                  <select 
                    name="category"
                    value={category}
                    onChange={onChange}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none transition-all appearance-none cursor-pointer placeholder:text-slate-600"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Apps">Mobile Apps</option>
                    <option value="Design">Design</option>
                    <option value="Writing">Writing</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                </div>
              </AnimatedInput>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">Required Skills</label>
              <AnimatedInput
                icon={PenTool}
                name="skills"
                value={skills}
                onChange={onChange}
                required
                type="text" 
                placeholder="e.g. React, Tailwind, Figma" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">City</label>
              <AnimatedInput
                icon={MapPin}
                name="city"
                value={city}
                onChange={onChange}
                type="text"
                placeholder="e.g. Hyderabad"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">Country</label>
              <AnimatedInput
                icon={MapPin}
                name="country"
                value={country}
                onChange={onChange}
                type="text"
                placeholder="e.g. India"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-400 ml-1">Project Description</label>
            <div className="relative group">
              <motion.div className="relative">
                <textarea 
                  name="description"
                  value={description}
                  onChange={onChange}
                  required
                  rows={5}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-6 text-white focus:outline-none transition-all resize-none placeholder:text-slate-600" 
                  placeholder="Describe what you need help with..." 
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">Milestones</label>
              <div className="relative">
                <FileText className="absolute left-4 top-5 w-5 h-5 text-slate-500" />
                <textarea
                  name="milestones"
                  value={milestones}
                  onChange={onChange}
                  rows={4}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none transition-all resize-none placeholder:text-slate-600"
                  placeholder={"Design wireframes | 3000\nBuild MVP | 7000"}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 ml-1">Document Links</label>
              <div className="relative">
                <FileText className="absolute left-4 top-5 w-5 h-5 text-slate-500" />
                <textarea
                  name="documents"
                  value={documents}
                  onChange={onChange}
                  rows={4}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none transition-all resize-none placeholder:text-slate-600"
                  placeholder="Paste one Drive/Cloudinary link per line"
                />
              </div>
              <input
                type="file"
                onChange={onDocumentUpload}
                className="block w-full text-xs text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-primary-500 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white"
              />
              {uploadedDocuments.length > 0 && (
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest">
                  {uploadedDocuments.length} uploaded to Cloudinary
                </p>
              )}
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-premium w-full flex items-center justify-center py-4 text-sm font-bold tracking-widest uppercase"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post Project Now
                </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PostJob;

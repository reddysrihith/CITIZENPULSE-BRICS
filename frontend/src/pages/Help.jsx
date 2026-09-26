import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Sparkles, HelpCircle, ArrowRight, Bot, User, CheckCircle2 } from 'lucide-react';
import TiltCard from '../components/animations/TiltCard';

const KNOWLEDGE_BASE = [
  {
    keywords: ['skillsphere', 'what is', 'platform', 'about'],
    answer: "SkillSphere is a next-generation MERN freelance platform engineered with premium glassmorphism aesthetics, fluid micro-animations (powered by Lenis), and full-stack interactive features. It bridges the gap between expert freelancers and premium clients looking for top-tier work."
  },
  {
    keywords: ['post', 'job', 'gig', 'client', 'create project'],
    answer: "To post a gig as a Client: 1. Navigate to the 'Gigs Marketplace'. 2. Click the 'Post a Gig' button. 3. Fill in the animated details: Title, Category, Budget (in ₹), Skills, and a detailed description. 4. Click 'Post Project' to publish it instantly to the Marketplace!"
  },
  {
    keywords: ['apply', 'proposal', 'bid', 'freelancer', 'work'],
    answer: "To apply for a gig as a Freelancer: 1. Go to the 'Gigs Marketplace'. 2. Browse live projects or search by title/skill. 3. Click 'Apply Now' on a project card. 4. Enter your custom Bid Amount and write a professional Cover Letter. 5. Click 'Submit Proposal' to notify the client!"
  },
  {
    keywords: ['settings', 'password', 'profile', 'notifications', 'upload picture', 'change email'],
    answer: "You can fully manage your account in 'Settings'. 1. Update Profile Info: Save your bio, username, and click the camera icon to upload a profile picture. 2. Security & Password: Reset your password (with interactive strength checks) and enable 2FA. 3. Notifications: Toggle preferences for proposals, messages, and job updates, and click 'Save Preferences'."
  },
  {
    keywords: ['who built', 'creator', 'deepmind', 'antigravity', 'model'],
    answer: "SkillSphere is a highly customized collaborative master project designed by the Google DeepMind team and pair-programmed together with Antigravity!"
  },
  {
    keywords: ['hourly rate', 'price', 'rupee', 'budget', 'earnings'],
    answer: "SkillSphere handles premium contracts denominated in Indian Rupees (₹). Freelancers can configure their hourly rate on their Professional Profile page, and all budget filters adapt instantly."
  },
  {
    keywords: ['message', 'chat', 'contact', 'talk'],
    answer: "You can use the 'Messages' panel on the dashboard to chat directly with clients or freelancers. The system supports full-screen direct messaging with active indicators and real-time inputs."
  },
  {
    keywords: ['scrolling', 'lenis', 'stuck'],
    answer: "We utilize Lenis Smooth Scrolling. If a custom modal is stuck or not scrolling, ensure it has the 'data-lenis-prevent' attribute. We have already patched this for dashboard stat modals and job proposal panels!"
  }
];

const DEFAULT_SUGGESTIONS = [
  "What is SkillSphere?",
  "How do I apply for a job?",
  "How to update my profile and picture?",
  "How do I post a gig?",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } }
};

const Help = () => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello ${user?.name || 'there'}! Welcome to the SkillSphere Smart Support Center. 🌟 I know everything about our platform, features, and database. Ask me anything!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = textToSend.trim();
    if (!text) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // AI bot response generation
    setTimeout(() => {
      let botResponse = "I'm sorry, I couldn't find specific information on that. Feel free to ask about posting/applying to gigs, profile settings, hourly rates, or platform architecture!";
      const query = text.toLowerCase();

      // Find matching knowledge items
      for (const item of KNOWLEDGE_BASE) {
        if (item.keywords.some(keyword => query.includes(keyword))) {
          botResponse = item.answer;
          break;
        }
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-primary-500/20">
          <HelpCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight font-heading">Help Center</h1>
          <p className="text-slate-400 mt-1 font-medium">Get support, find answers, and chat with our smart AI assistant.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Help Info */}
        <div className="space-y-8 lg:col-span-1">
          <motion.div variants={itemVariants} className="glass-card p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
            <h3 className="text-lg font-bold text-white mb-4 font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" />
              Instant Suggestions
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
              Click any frequently asked question below to ask the AI bot immediately:
            </p>
            <div className="space-y-3">
              {DEFAULT_SUGGESTIONS.map((suggestion, i) => (
                <motion.button
                  key={i}
                  whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSend(suggestion)}
                  className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-300 text-xs font-bold flex items-center justify-between group transition-all"
                >
                  <span>{suggestion}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary-400 transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8 rounded-[2.5rem] border-white/5">
            <h3 className="text-lg font-bold text-white mb-4 font-heading flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Quick Documentation
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-white font-bold text-xs">Decentralized Gig Matching</p>
                <p className="text-slate-500 text-[11px] mt-1 font-medium leading-relaxed">
                  No middleman charges. Direct client-to-freelancer matching using smart profile credentials.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-white font-bold text-xs">Two-Factor Authentication</p>
                <p className="text-slate-500 text-[11px] mt-1 font-medium leading-relaxed">
                  Secured with authenticator app integration directly on the Settings screen.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Chatbot interface */}
        <div className="lg:col-span-2">
          <motion.div variants={itemVariants} className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden flex flex-col h-[650px] relative">
            {/* Top Info Bar */}
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center relative">
                  <Bot className="w-6 h-6 text-primary-400" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">SkillSphere Assistant</h3>
                  <p className="text-emerald-400 text-xs font-bold tracking-wider uppercase">Online &amp; Intelligent</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar" data-lenis-prevent>
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isBot = msg.sender === 'bot';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex gap-4 max-w-[80%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                    >
                      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${
                        isBot ? 'bg-primary-500/10 border-primary-500/20 text-primary-400' : 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                      }`}>
                        {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className="space-y-1.5">
                        <div className={`p-5 rounded-[2rem] text-sm leading-relaxed font-medium shadow-xl ${
                          isBot 
                            ? 'bg-slate-900/60 border border-white/5 text-slate-200 rounded-tl-none' 
                            : 'premium-gradient text-white rounded-tr-none'
                        }`}>
                          {msg.text}
                        </div>
                        <p className={`text-[9px] font-bold text-slate-500 uppercase tracking-widest ${isBot ? 'pl-2' : 'pr-2 text-right'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[80%] mr-auto">
                  <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border bg-primary-500/10 border-primary-500/20 text-primary-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-900/60 border border-white/5 p-5 rounded-[2rem] rounded-tl-none flex items-center gap-1.5 shadow-xl">
                    <span className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-6 border-t border-white/5 bg-[#0f172a]/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-4 bg-slate-900/80 border border-white/10 rounded-3xl p-2.5 focus-within:border-primary-500/50 transition-colors"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about SkillSphere..."
                  className="flex-1 bg-transparent px-4 text-white text-sm focus:outline-none placeholder:text-slate-600"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-2xl premium-gradient flex items-center justify-center text-white hover:shadow-lg hover:shadow-primary-500/30 transition-shadow shrink-0"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Help;

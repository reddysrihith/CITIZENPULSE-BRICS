import { motion } from 'framer-motion';

/**
 * Premium Logo Component for SkillSphere
 * Features orbital ring animations, dynamic glowing filters, and rich typography.
 */
export const Logo = ({ 
  iconOnly = false, 
  size = 'md', 
  className = '', 
  animated = true 
}) => {
  // Size mapping for the logo icon container
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  // Size mapping for the text sizes
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  // Size mapping for the subtitle/badge sizes
  const badgeSizes = {
    sm: 'text-[9px] px-1.5 py-0.2',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
    xl: 'text-sm px-3.5 py-1.5'
  };

  // SVG dimensions & scales based on size
  const svgDimensions = {
    sm: { viewBox: '0 0 100 100', strokeWidth: 2.5 },
    md: { viewBox: '0 0 100 100', strokeWidth: 3 },
    lg: { viewBox: '0 0 100 100', strokeWidth: 3.5 },
    xl: { viewBox: '0 0 100 100', strokeWidth: 4 }
  };

  const currentSvg = svgDimensions[size] || svgDimensions.md;

  // Animation variants
  const outerRingVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 25,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const innerRingVariants = {
    animate: {
      rotate: -360,
      transition: {
        duration: 18,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const coreVariants = {
    animate: {
      scale: [1, 1.06, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const particleVariants = {
    animate: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0.4, 0.9, 0.4],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 2
      }
    }
  };

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Dynamic Animated Icon */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={`${iconSizes[size]} relative flex items-center justify-center`}
      >
        {/* Under-glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/30 via-accent-500/20 to-purple-500/30 blur-md pointer-events-none" />

        <svg
          viewBox={currentSvg.viewBox}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]"
        >
          {/* DEFINITIONS & GRADIENTS */}
          <defs>
            {/* Primary Blue-Indigo Gradient */}
            <linearGradient id="logoPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>

            {/* Cyan-Purple Accents */}
            <linearGradient id="logoAccentGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#D946EF" />
            </linearGradient>

            {/* Glowing Core Radial Gradient */}
            <radialGradient id="logoCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A5B4FC" stopOpacity="1" />
              <stop offset="60%" stopColor="#6366F1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#312E81" stopOpacity="0" />
            </radialGradient>

            {/* Holographic Ring Gradients */}
            <linearGradient id="ringGrad1" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#C084FC" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F472B6" stopOpacity="0.8" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKGROUND SPHERE EMBLEM */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="#0B0F19"
            stroke="url(#logoPrimaryGrad)"
            strokeWidth="1.5"
            strokeOpacity="0.2"
          />

          {/* INNER GLOWING CORE */}
          <motion.circle
            cx="50"
            cy="50"
            r="16"
            fill="url(#logoCoreGrad)"
            variants={animated ? coreVariants : {}}
            animate="animate"
          />

          {/* ABSTRACT LAYERED 'S' DESIGN */}
          {/* Inner core 'S' symbol made of clean elegant curved lines */}
          <path
            d="M44 43.5C44 38.5 48.5 35 53 35C57.5 35 60.5 38 60.5 41C60.5 45.5 54 47 50 49C45.5 51.2 39.5 53.5 39.5 59.5C39.5 65 44.5 68 50 68C56 68 60.5 64 60.5 58.5"
            stroke="url(#logoAccentGrad)"
            strokeWidth={currentSvg.strokeWidth * 1.3}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* OUTER ORBITAL RING 1 (Tilted Diagonal) */}
          <motion.ellipse
            cx="50"
            cy="50"
            rx="36"
            ry="11"
            stroke="url(#ringGrad1)"
            strokeWidth={currentSvg.strokeWidth}
            strokeDasharray="60 15 10 15"
            transform="rotate(-28 50 50)"
            variants={animated ? outerRingVariants : {}}
            animate="animate"
          />

          {/* OUTER ORBITAL RING 2 (Counter-tilted Diagonal) */}
          <motion.ellipse
            cx="50"
            cy="50"
            rx="33"
            ry="9"
            stroke="url(#logoAccentGrad)"
            strokeWidth={currentSvg.strokeWidth * 0.7}
            strokeDasharray="40 20"
            transform="rotate(35 50 50)"
            variants={animated ? innerRingVariants : {}}
            animate="animate"
            opacity="0.75"
          />

          {/* ORBITAL SPARKLES / CONNECTIONS (Skills nodes) */}
          {/* Top-Right Node */}
          <motion.circle
            cx="76"
            cy="36"
            r="3.5"
            fill="#F472B6"
            variants={animated ? particleVariants : {}}
            animate="animate"
            className="drop-shadow-[0_0_8px_#F472B6]"
          />

          {/* Bottom-Left Node */}
          <motion.circle
            cx="24"
            cy="64"
            r="3"
            fill="#22D3EE"
            variants={animated ? particleVariants : {}}
            animate="animate"
            className="drop-shadow-[0_0_8px_#22D3EE]"
          />

          {/* Top-Left Node */}
          <motion.circle
            cx="32"
            cy="26"
            r="2.5"
            fill="#C084FC"
            variants={animated ? particleVariants : {}}
            animate="animate"
            className="drop-shadow-[0_0_6px_#C084FC]"
          />
        </svg>
      </motion.div>

      {/* Brand Text Section */}
      {!iconOnly && (
        <div className="flex flex-col items-start leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`${textSizes[size]} font-black font-heading text-white tracking-tight flex items-center`}>
              Skill
              <span className="bg-gradient-to-r from-[#818CF8] via-[#A78BFA] to-[#F472B6] bg-clip-text text-transparent ml-0.5 drop-shadow-[0_0_10px_rgba(167,139,250,0.2)]">
                Sphere
              </span>
            </span>
          </div>
          {size !== 'sm' && (
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[3px] mt-1 ml-0.5">
              Freelance Ecosystem
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;

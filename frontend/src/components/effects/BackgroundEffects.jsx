import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMousePosition } from '../../hooks/useMousePosition';

export const CursorGlow = ({ size = 300 }) => {
  const mousePosition = useMousePosition();

  return (
    <motion.div
      className="fixed pointer-events-none z-40"
      animate={{
        x: mousePosition.x - size / 2,
        y: mousePosition.y - size / 2,
      }}
      transition={{ duration: 0.1 }}
    >
      <div
        className={`rounded-full blur-3xl opacity-30 pointer-events-none`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0) 70%)',
        }}
      />
    </motion.div>
  );
};

export const AnimatedGradientBg = () => {
  return (
    <>
      {/* Main gradient blob */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Secondary gradient */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10 blur-3xl" />
      </div>
    </>
  );
};

export const MeshBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg
        className="w-full h-full opacity-20"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
          </filter>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.1 }} />
          </linearGradient>
          <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>
        <circle cx="200" cy="150" r="300" fill="url(#grad1)" filter="url(#blur)" />
        <circle cx="1000" cy="450" r="350" fill="url(#grad2)" filter="url(#blur)" />
        <circle cx="600" cy="300" r="200" fill="url(#grad1)" opacity="0.5" filter="url(#blur)" />
      </svg>
    </div>
  );
};

export const ParticleBackground = () => {
  const [particles] = useState(() =>
    Array.from({ length: 50 }).map(() => ({
      dx: (Math.random() * 500 - 250).toFixed(2),
      dy: (Math.random() * 500 - 250).toFixed(2),
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: +(Math.random() * 10 + 12).toFixed(2),
      opacityPeak: +(Math.random() * 0.6 + 0.3).toFixed(2),
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary-400/30"
          style={{ left: p.left, top: p.top }}
          animate={{
            y: [0, Number(p.dy)],
            x: [0, Number(p.dx)],
            opacity: [0.2, p.opacityPeak, 0.2],
          }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

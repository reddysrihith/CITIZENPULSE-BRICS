import { motion } from 'framer-motion';

const AnimatedInput = ({ icon: Icon, children, ...props }) => (
  <div className="relative group">
    {Icon && !children && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />}
    <motion.div className="relative">
      {children ? (
        children
      ) : (
        <>
          <input
            {...props}
            autoComplete="off"
            className={`w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 ${Icon ? 'pl-12' : 'px-4'} pr-4 text-white focus:outline-none transition-all placeholder:text-slate-600`}
          />
          <motion.div 
            className="absolute bottom-0 left-1/2 h-[2px] bg-primary-500 origin-center"
            initial={{ width: 0, x: "-50%" }}
            whileFocus={{ width: "100%", x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </>
      )}
    </motion.div>
  </div>
);

export default AnimatedInput;

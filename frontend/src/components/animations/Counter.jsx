import { useEffect, useRef } from 'react';
import { useMotionValue, animate, useMotionValueEvent } from 'framer-motion';

export default function Counter({ value, prefix = '', suffix = '' }) {
  const count = useMotionValue(0);
  const ref = useRef(null);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [value, count]);

  useMotionValueEvent(count, "change", (latest) => {
    if (ref.current) {
      ref.current.textContent = prefix + Math.round(latest).toLocaleString() + suffix;
    }
  });

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

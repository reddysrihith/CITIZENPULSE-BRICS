import { useEffect, useRef } from 'react';
import { useAnimation } from 'framer-motion';
import { useInView } from 'framer-motion';

export const useScrollTrigger = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return { ref, controls };
};

export const useScrollReveal = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return { ref, isInView };
};

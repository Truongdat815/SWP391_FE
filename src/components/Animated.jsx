import React from 'react';
import { motion } from 'framer-motion';

// Reusable animated image component with a gentle fade/scale and loading placeholder
export const AnimatedImage = ({ src, alt = '', className = '', style = {}, onError, onLoad }) => {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      style={style}
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onError={onError}
      onLoad={onLoad}
      loading="lazy"
    />
  );
};

// Section wrapper to animate when scrolled into view
export const AnimatedSection = ({ children, className = '', delay = 0, ...rest }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, delay }}
    className={className}
    {...rest}
  >
    {children}
  </motion.section>
);

export default AnimatedImage;

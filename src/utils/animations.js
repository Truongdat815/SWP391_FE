// Animation variants and utilities for Framer Motion

// Button animations
export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export const buttonHover = {
  scale: 1.03,
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const buttonDisabled = {
  opacity: 0.5,
  cursor: 'not-allowed',
  scale: 1,
};

// Card animations
export const cardHover = {
  scale: 1.02,
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const cardInitial = {
  opacity: 0,
  y: 20,
};

export const cardAnimate = {
  opacity: 1,
  y: 0,
  transition: { duration: 0.4, ease: 'easeOut' },
};

// Modal animations
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const modalMotion = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 },
  },
};

// Page transitions
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const slideLeft = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

// List animations
export const listMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

// Table row animations
export const tableRowMotion = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
  transition: { duration: 0.2 },
};

// Sidebar animations
export const sidebarMotion = {
  initial: { x: -300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -300, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 },
};

// Input focus animations
export const inputFocus = {
  scale: 1.01,
  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  transition: { duration: 0.2 },
};

// Toast animations
export const toastSlideIn = {
  initial: { opacity: 0, y: 50, x: 50 },
  animate: { opacity: 1, y: 0, x: 0 },
  exit: { opacity: 0, y: 20, x: 20 },
  transition: { type: 'spring', stiffness: 300, damping: 30 },
};

// Skeleton shimmer
export const shimmer = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

// Loading overlay
export const loadingOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

// Icon rotation
export const iconRotate = {
  rotate: 180,
  transition: { duration: 0.3, ease: 'easeInOut' },
};

// Scale in animation
export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

// Fade in with delay
export const fadeInDelay = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3, delay },
});

// Slide in from direction
export const slideInFrom = (direction = 'left') => {
  const directions = {
    left: { x: -20 },
    right: { x: 20 },
    top: { y: -20 },
    bottom: { y: 20 },
  };

  return {
    initial: { opacity: 0, ...directions[direction] },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...directions[direction] },
    transition: { duration: 0.3, ease: 'easeOut' },
  };
};


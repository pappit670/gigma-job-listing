// Gigma Motion System
// Consistent animation variants used across the entire app

export const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
};

export const slideUp = {
  initial: { opacity: 0, y: '100%' },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: '100%' },
  transition: { type: 'spring', damping: 30, stiffness: 350 },
};

export const slideInFromRight = {
  initial: { opacity: 0, x: '100%' },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: '100%' },
  transition: { type: 'spring', damping: 28, stiffness: 300 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.92 },
  transition: { type: 'spring', damping: 24, stiffness: 280 },
};

// Staggered list — parent container
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

// Each child card in a staggered list
export const cardItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', damping: 22, stiffness: 300 },
};

// Notification banner drop-in from top
export const notificationBanner = {
  initial: { opacity: 0, y: -40, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.96 },
  transition: { type: 'spring', damping: 26, stiffness: 320 },
};

// Tab content switch
export const tabContent = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
  transition: { duration: 0.16, ease: 'easeOut' },
};

// Overlay backdrop
export const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

// Bottom sheet panel
export const bottomSheet = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: { type: 'spring', damping: 32, stiffness: 380 },
};

// Pulse for "live" indicators
export const livePulse = {
  animate: {
    scale: [1, 1.15, 1],
    opacity: [1, 0.6, 1],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Accept job button spring press
export const buttonPress = {
  whileTap: { scale: 0.94 },
  whileHover: { scale: 1.02 },
  transition: { type: 'spring', damping: 20, stiffness: 400 },
};

// Success check mark bounce
export const successBounce = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: 'spring', damping: 14, stiffness: 260 },
};

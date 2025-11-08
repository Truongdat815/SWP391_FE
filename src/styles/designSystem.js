// Design System - Colors and Gradients
export const roleColors = {
  dealerStaff: {
    primary: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    gradientHover: 'from-emerald-600 to-teal-700',
    light: 'emerald-50',
    dark: 'emerald-900',
    accent: 'teal-500',
    ring: 'ring-emerald-500',
    focus: 'focus:ring-emerald-500',
    bg: 'bg-emerald-500',
    bgHover: 'hover:bg-emerald-600',
    text: 'text-emerald-600',
    border: 'border-emerald-500'
  },
  dealerManager: {
    primary: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    gradientHover: 'from-blue-600 to-indigo-700',
    light: 'blue-50',
    dark: 'blue-900',
    accent: 'indigo-500',
    ring: 'ring-blue-500',
    focus: 'focus:ring-blue-500',
    bg: 'bg-blue-500',
    bgHover: 'hover:bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-500'
  },
  admin: {
    primary: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    gradientHover: 'from-purple-600 to-pink-700',
    light: 'purple-50',
    dark: 'purple-900',
    accent: 'pink-500',
    ring: 'ring-purple-500',
    focus: 'focus:ring-purple-500',
    bg: 'bg-purple-500',
    bgHover: 'hover:bg-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-500'
  },
  evmStaff: {
    primary: 'green',
    gradient: 'from-green-500 to-emerald-600',
    gradientHover: 'from-green-600 to-emerald-700',
    light: 'green-50',
    dark: 'green-900',
    accent: 'emerald-500',
    ring: 'ring-green-500',
    focus: 'focus:ring-green-500',
    bg: 'bg-green-500',
    bgHover: 'hover:bg-green-600',
    text: 'text-green-600',
    border: 'border-green-500'
  }
};

// Status Colors
export const statusColors = {
  ACTIVE: {
    bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
    text: 'text-white',
    light: 'bg-green-100',
    dot: 'bg-green-500'
  },
  INACTIVE: {
    bg: 'bg-gradient-to-r from-gray-500 to-slate-500',
    text: 'text-white',
    light: 'bg-gray-100',
    dot: 'bg-gray-500'
  },
  PENDING: {
    bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    text: 'text-white',
    light: 'bg-yellow-100',
    dot: 'bg-yellow-500'
  },
  CONFIRMED: {
    bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    text: 'text-white',
    light: 'bg-blue-100',
    dot: 'bg-blue-500'
  },
  COMPLETED: {
    bg: 'bg-gradient-to-r from-green-500 to-teal-500',
    text: 'text-white',
    light: 'bg-green-100',
    dot: 'bg-green-500'
  },
  CANCELLED: {
    bg: 'bg-gradient-to-r from-red-500 to-pink-500',
    text: 'text-white',
    light: 'bg-red-100',
    dot: 'bg-red-500'
  },
  DRAFT: {
    bg: 'bg-gradient-to-r from-gray-400 to-gray-500',
    text: 'text-white',
    light: 'bg-gray-100',
    dot: 'bg-gray-400'
  }
};

// Common UI Patterns
export const uiPatterns = {
  glass: 'bg-white/80 backdrop-blur-lg border border-white/20',
  card: 'bg-white rounded-2xl shadow-lg border border-gray-100',
  cardHover: 'hover:shadow-2xl hover:-translate-y-1 transition-all duration-300',
  input: 'px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all',
  button: 'px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all',
  badge: 'px-3 py-1.5 rounded-full text-sm font-medium shadow-md'
};


import { motion } from 'framer-motion';

function ToggleSwitch({ checked, onChange, disabled = false, size = 'md' }) {
  const sizes = {
    sm: {
      track: 'h-5 w-9',
      thumb: 'h-4 w-4',
      translate: 'translate-x-4'
    },
    md: {
      track: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: 'translate-x-6'
    },
    lg: {
      track: 'h-7 w-14',
      thumb: 'h-6 w-6',
      translate: 'translate-x-7'
    }
  };

  const sizeClasses = sizes[size];

  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
        checked ? 'bg-emerald-600' : 'bg-gray-300'
      } ${sizeClasses.track} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={checked}
    >
      <motion.span
        className={`inline-block rounded-full bg-white shadow-lg ${sizeClasses.thumb}`}
        initial={false}
        animate={{
          x: checked ? (size === 'sm' ? 16 : size === 'md' ? 20 : 24) : 2
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}
      />
    </button>
  );
}

export default ToggleSwitch;


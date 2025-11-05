import React from 'react';
import Tooltip from './Tooltip';

const baseClasses = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

const variants = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-sm hover:shadow-md',
  secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400 shadow-sm',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm'
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base'
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  tooltip,
  tooltipPlacement = 'top',
  ...props
}) {
  const classes = `${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;
  
  const button = (
    <button className={classes} {...props}>
      {children}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} placement={tooltipPlacement}>
        {button}
      </Tooltip>
    );
  }

  return button;
}



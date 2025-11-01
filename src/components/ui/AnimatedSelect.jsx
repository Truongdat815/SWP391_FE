import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

/**
 * Animated Select Dropdown Component
 * Replaces native HTML select with smooth animations
 * 
 * @param {Object} props
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Callback when value changes
 * @param {Array} props.options - Array of {value, label} objects
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Disable the select
 * @param {string} props.name - Input name attribute
 */
export default function AnimatedSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Chọn...',
  className = '',
  disabled = false,
  name
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the button container and the dropdown
      const isInContainer = containerRef.current && containerRef.current.contains(event.target);
      const isInDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      
      if (!isInContainer && !isInDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Position dropdown portal
  useEffect(() => {
    if (isOpen && containerRef.current && dropdownRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current;
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - containerRect.bottom;
      const spaceAbove = containerRect.top;
      const dropdownHeight = Math.min(300, options.length * 40 + 20); // Estimate dropdown height
      
      dropdown.style.position = 'fixed';
      dropdown.style.left = `${containerRect.left}px`;
      dropdown.style.width = `${containerRect.width}px`;
      
      // Decide if dropdown should open upward or downward
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        // Open upward
        dropdown.style.bottom = `${windowHeight - containerRect.top + 8}px`;
        dropdown.style.top = 'auto';
      } else {
        // Open downward (default)
        dropdown.style.top = `${containerRect.bottom + 8}px`;
        dropdown.style.bottom = 'auto';
      }
    }
  }, [isOpen, options.length]);

  const selectedOption = options.find(opt => opt.value === value) || null;
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue) => {
    if (onChange) {
      // Simulate native select onChange event
      const syntheticEvent = {
        target: {
          name: name,
          value: optionValue
        }
      };
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  return (
    <>
      <div ref={containerRef} className={`relative ${className}`}>
        <motion.button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          whileHover={disabled ? {} : { scale: 1.01 }}
          whileTap={disabled ? {} : { scale: 0.99 }}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-left flex items-center justify-between transition-all ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } ${!selectedOption ? 'text-gray-500' : 'text-gray-700'}`}
        >
          <span className="truncate">{displayText}</span>
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.button>
      </div>

      {/* Portal dropdown outside to avoid overflow issues */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ 
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-[9999] origin-top"
              style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
              <div className="py-1">
                {options.map((option, index) => (
                  <motion.button
                    key={option.value || `option-${index}`}
                    type="button"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-emerald-50 transition-colors ${
                      value === option.value 
                        ? 'bg-emerald-50 text-emerald-700 font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}


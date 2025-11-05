import React, { useState } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  arrow,
  useTransitionStyles
} from '@floating-ui/react';

/**
 * Reusable Tooltip Component
 * Provides helpful guidance for interactive elements across the application
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The element to attach the tooltip to
 * @param {string} props.content - The tooltip text content
 * @param {string} props.placement - Position of tooltip (top, bottom, left, right)
 * @param {number} props.delay - Delay before showing tooltip in ms
 * @param {boolean} props.disabled - Disable tooltip display
 */
export default function Tooltip({ 
  children, 
  content, 
  placement = 'top',
  delay = 300,
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 })
    ],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { 
    delay: { open: delay, close: 0 },
    enabled: !disabled 
  });
  const focus = useFocus(context, { enabled: !disabled });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 200,
    initial: {
      opacity: 0,
      transform: 'scale(0.95)',
    },
  });

  if (disabled || !content) {
    return children;
  }

  return (
    <>
      {React.cloneElement(children, {
        ref: refs.setReference,
        ...getReferenceProps(),
      })}
      {isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              ...transitionStyles,
            }}
            {...getFloatingProps()}
            className="z-[9999] max-w-xs px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none"
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}



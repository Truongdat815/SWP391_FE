import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideSnackbar } from '../store/slices/snackbarSlice';

const Snackbar = () => {
    const dispatch = useDispatch();
    const { open, message, severity, duration, action } = useSelector(state => state.snackbar);

    useEffect(() => {
        if (open && duration > 0) {
            const timer = setTimeout(() => {
                dispatch(hideSnackbar());
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [open, duration, dispatch]);

    const handleClose = () => {
        dispatch(hideSnackbar());
    };

    const getSeverityStyles = () => {
        switch (severity) {
            case 'success':
                return {
                    bg: 'bg-green-500',
                    border: 'border-green-600',
                    icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )
                };
            case 'error':
                return {
                    bg: 'bg-red-500',
                    border: 'border-red-600',
                    icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    )
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-500',
                    border: 'border-yellow-600',
                    icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    )
                };
            default: // info
                return {
                    bg: 'bg-blue-500',
                    border: 'border-blue-600',
                    icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    )
                };
        }
    };

    const styles = getSeverityStyles();

    if (!open) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
            <div className={`
                ${styles.bg} ${styles.border} border-2 rounded-lg shadow-lg
                transform transition-all duration-300 ease-in-out
                ${open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}>
                <div className="flex items-center p-4">
                    <div className="flex-shrink-0 text-white">
                        {styles.icon}
                    </div>
                    
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-white">
                            {message}
                        </p>
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-2">
                        {action && (
                            <button
                                onClick={action.onClick}
                                className="text-white hover:text-gray-200 text-sm font-medium underline"
                            >
                                {action.text}
                            </button>
                        )}
                        
                        <button
                            onClick={handleClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Snackbar;

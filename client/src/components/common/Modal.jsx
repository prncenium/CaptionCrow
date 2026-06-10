import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    footer,
    maxWidth = "max-w-md"
}) {
    // Close modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent scrolling on the body when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* The Backdrop overlay */}
            <div 
                className="absolute inset-0 transition-opacity bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* The Modal Window */}
            <div className={`relative flex flex-col w-full ${maxWidth} bg-[#121212] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#181818]">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                        {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-1 transition-colors rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Content Body */}
                <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar text-neutral-300">
                    {children}
                </div>

                {/* Optional Footer (Usually for Action Buttons) */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 p-4 border-t border-neutral-800 bg-[#181818]">
                        {footer}
                    </div>
                )}
                
            </div>
        </div>
    );
}
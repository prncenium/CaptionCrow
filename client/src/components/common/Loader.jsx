import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ 
    size = 'md', 
    text = '', 
    fullScreen = false, 
    className = '' 
}) {
    // Map sizes to Tailwind dimensions
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const spinner = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <Loader2 className={`${sizeClasses[size]} text-blue-500 animate-spin`} />
            {text && (
                <span className="text-sm font-bold tracking-widest text-blue-400 uppercase animate-pulse">
                    {text}
                </span>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-sm">
                {spinner}
            </div>
        );
    }

    return spinner;
}
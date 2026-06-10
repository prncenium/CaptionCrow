import React from 'react';
import Loader from './Loader';

export default function Button({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    leftIcon: LeftIcon, 
    rightIcon: RightIcon, 
    className = '', 
    disabled, 
    ...props 
}) {
    // Base styles that apply to ALL buttons
    const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all rounded-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    // Size variants
    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3 text-base"
    };

    // Color & Theme variants
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-transparent",
        secondary: "bg-neutral-900 text-neutral-300 border border-neutral-700 hover:bg-neutral-800 hover:text-white",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-sm",
        ghost: "bg-transparent text-neutral-400 border border-transparent hover:text-white hover:bg-neutral-800/50",
    };

    return (
        <button 
            className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {/* If loading, replace left icon with spinner */}
            {isLoading && <Loader size="sm" className="!text-current" />}
            {!isLoading && LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" />}
            
            {children}
            
            {!isLoading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
        </button>
    );
}
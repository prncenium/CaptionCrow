import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';

import { Ban, Sun, ZoomIn, ArrowUpCircle, ArrowDownCircle, ArrowRightCircle, ArrowLeftCircle, ChevronsUp } from 'lucide-react';

// 🚨 2. Define our animation options with their corresponding labels and icons
const ANIMATION_OPTIONS = [
    { id: 'none', label: 'None', icon: Ban },
    { id: 'fadeIn', label: 'Fade', icon: Sun },
    { id: 'popIn', label: 'Pop', icon: ZoomIn },
    { id: 'bounce', label: 'Bounce', icon: ChevronsUp },
    { id: 'slideUp', label: 'Slide Up', icon: ArrowUpCircle },
    { id: 'slideDown', label: 'Slide Down', icon: ArrowDownCircle },
    { id: 'slideLeft', label: 'From Right', icon: ArrowLeftCircle },
    { id: 'slideRight', label: 'From Left', icon: ArrowRightCircle },
];

export default function TransitionsPanel({ glassSliderClass, getSliderStyle }) {
    const { 
        activeStyle, 
        updateStyle, 
        activeLineTarget, 
        lineStyles 
    } = useEditorStore();

    const currentStyle = activeLineTarget === -1 
        ? activeStyle 
        : { ...activeStyle, ...(lineStyles[activeLineTarget] || {}) };

    const currentAnimation = currentStyle.animationStyle || 'none';

    return (
        <div className="space-y-3">
            
            {/* 🚨 3. UPDATED ENTRY ANIMATION GRID 🚨 */}
            <div className="flex flex-col gap-3 p-3 bg-white/60 rounded-xl border border-white/70 shadow-sm">
                <label className="text-[9.5px] tracking-[0.1em] font-bold text-neutral-500 uppercase">
                    Entry Animation
                </label>
                
                {/* CSS Grid for the 3-column layout */}
                <div className="grid grid-cols-3 gap-2">
                    {ANIMATION_OPTIONS.map((option) => {
                        const isSelected = currentAnimation === option.id;
                        const IconComponent = option.icon;
                        
                        return (
                            <button
                                key={option.id}
                                onClick={(e) => {
                                    e.preventDefault();
                                    updateStyle({ animationStyle: option.id });
                                }}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border ${
                                    isSelected 
                                    // Active State: Green border, slightly green tinted glass, green text
                                    ? 'border-[#34C759] bg-[#34C759]/10 shadow-sm scale-95' 
                                    // Default State: Standard glassy white
                                    : 'border-white/50 bg-white/40 hover:bg-white/70 hover:border-white/90'
                                }`}
                            >
                                <IconComponent 
                                    strokeWidth={isSelected ? 2.5 : 1.5} 
                                    className={`w-6 h-6 mb-1.5 transition-colors ${
                                        isSelected ? 'text-[#34C759]' : 'text-slate-600'
                                    }`} 
                                />
                                <span className={`text-[10px] font-bold ${
                                    isSelected ? 'text-[#34C759]' : 'text-slate-500'
                                }`}>
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Animation Speed Glass Card */}
            <div className="flex flex-col gap-2 p-3 bg-white/60 rounded-xl border border-white/70 shadow-sm">
                <div className="flex justify-between items-center text-[9.5px] tracking-[0.1em] font-bold text-neutral-500 uppercase">
                    <span>Animation Speed</span>
                    <div className="flex items-center justify-center w-14 h-6 text-[11px] font-bold rounded-lg bg-white/80 border border-white/70 text-slate-900 shadow-sm tabular-nums">
                        {currentStyle.animationDurationMs || 300}ms
                    </div>
                </div>
                <input 
                    type="range" min="50" max="1500" step="50" 
                    value={currentStyle.animationDurationMs || 300}
                    onChange={(e) => updateStyle({ animationDurationMs: parseInt(e.target.value) })}
                    className={glassSliderClass}
                    style={getSliderStyle(currentStyle.animationDurationMs || 300, 50, 1500)}
                />
            </div>

            {/* 3. Line Stagger Delay Glass Card */}
<div className="flex flex-col gap-2 p-3 bg-white/60 rounded-xl border border-white/70 shadow-sm">
    <div className="flex justify-between items-center text-[9.5px] tracking-[0.1em] font-bold text-neutral-500 uppercase">
        <span>Line Stagger Delay</span>
        <div className="flex items-center justify-center w-14 h-6 text-[11px] font-bold rounded-lg bg-white/80 border border-white/70 text-slate-900 shadow-sm tabular-nums">
            {/* 🚨 FIXED: Now reads currentStyle instead of global activeStyle */}
            {currentStyle.staggerDelayMs || 0}ms
        </div>
    </div>
    <input 
        type="range" min="0" max="1000" step="50"
        /* 🚨 FIXED: Now reads currentStyle */
        value={currentStyle.staggerDelayMs || 0}
        /* 🚨 FIXED: Updates the specific targeted line */
        onChange={(e) => updateStyle({ staggerDelayMs: parseInt(e.target.value) })}
        className={glassSliderClass}
        style={getSliderStyle(currentStyle.staggerDelayMs || 0, 0, 1000)}
    />
</div>

            {/* 4. Motion Blur Glass Card */}
            <div className="flex flex-col gap-2 p-3 bg-white/60 rounded-xl border border-white/70 shadow-sm">
                <div className="flex justify-between items-center text-[9.5px] tracking-[0.1em] font-bold text-neutral-500 uppercase">
                    <span>Motion Blur Intensity</span>
                    <div className="flex items-center justify-center w-14 h-6 text-[11px] font-bold rounded-lg bg-white/80 border border-white/70 text-[#34C759] shadow-sm tabular-nums">
                        {currentStyle.motionBlur || 0}%
                    </div>
                </div>
                <input 
                    type="range" min="0" max="100" 
                    value={currentStyle.motionBlur || 0}
                    onChange={(e) => updateStyle({ motionBlur: parseInt(e.target.value) })}
                    className={glassSliderClass}
                    style={getSliderStyle(currentStyle.motionBlur || 0, 0, 100)}
                />
            </div>

        </div>
    );
}
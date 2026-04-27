import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';

export default function ColorPicker() {
    const { activeStyle, updateStyle } = useEditorStore();

    // A reusable sub-component for consistency
    const ColorControl = ({ label, property }) => (
        <div className="flex items-center justify-between p-2 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-colors">
            <span className="text-sm font-medium text-neutral-300">{label}</span>
            <div className="relative w-8 h-8 rounded overflow-hidden border border-neutral-700 flex-shrink-0 cursor-pointer">
                <input
                    type="color"
                    value={activeStyle[property].length === 4 ? activeStyle[property] + '000' : activeStyle[property].substring(0, 7)} // Safely handle standard hex
                    onChange={(e) => updateStyle({ [property]: e.target.value })}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-3">
            <ColorControl label="Text Fill Color" property="fillColor" />
            <ColorControl label="Outline Color" property="strokeColor" />
            <ColorControl label="Glow/Shadow Color" property="shadowColor" />

            {/* Shadow Blur Control */}
            <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    <span>Glow Intensity</span>
                    <span className="text-emerald-500">{activeStyle.shadowBlur}px</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="30" 
                    value={activeStyle.shadowBlur}
                    onChange={(e) => updateStyle({ shadowBlur: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
            </div>
        </div>
    );
}
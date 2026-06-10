import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, RotateCcw, Layers, Edit2 } from 'lucide-react';
import { useEditorStore } from '../../../store/useEditorStore';
import { useUIStore } from '../../../store/useUIStore';
import { HexColorPicker } from "react-colorful";
import { useState } from 'react';
import TransitionsPanel from './TransitionsPanel';


const FONT_LIBRARY = {
    'Poppins': [
        { label: 'Black', weight: '900', style: 'normal' },
        { label: 'Black Italic', weight: '900', style: 'italic' },
        { label: 'ExtraBold', weight: '800', style: 'normal' },
        { label: 'ExtraBold Italic', weight: '800', style: 'italic' },
        { label: 'Bold', weight: '700', style: 'normal' },
        { label: 'Bold Italic', weight: '700', style: 'italic' },
        { label: 'SemiBold', weight: '600', style: 'normal' },
        { label: 'SemiBold Italic', weight: '600', style: 'italic' },
        { label: 'Regular', weight: '400', style: 'normal' }
    ],
    'Inter': [
        { label: 'Bold', weight: '700', style: 'normal' },
        { label: 'Regular', weight: '400', style: 'normal' }
    ],
    'Impact': [{ label: 'Regular', weight: '400', style: 'normal' }],
    'Apple Garamond': [{ label: 'Regular', weight: '400', style: 'normal' }],
    'Times New Roman': [{ label: 'Regular', weight: '400', style: 'normal' }],
    'Helvetica': [{ label: 'Regular', weight: '400', style: 'normal' }],
    'Blacksword': [{ label: 'Regular', weight: 'normal', style: 'normal' }],
    'Coolvetica': [{ label: 'Regular', weight: 'normal', style: 'normal' }],
    'Open Sans': [
        { label: 'Bold', weight: '700', style: 'normal' },
        { label: 'Regular', weight: '400', style: 'normal' }
    ]
};

export default function TextStyles() {
    const activeEditorTab = useUIStore((state) => state.activeEditorTab);
    const setActiveEditorTab = useUIStore((state) => state.setActiveEditorTab);

    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isInactiveColorPickerOpen, setIsInactiveColorPickerOpen] = useState(false);
    const [isBgColorPickerOpen, setIsBgColorPickerOpen] = useState(false); // 🚨 ADDED THIS LINE

    const glassSliderClass = "w-full h-1.5 border border-white/60 rounded-lg appearance-none cursor-pointer shadow-inner [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-white/90 [&::-webkit-slider-thumb]:to-white/40 [&::-webkit-slider-thumb]:backdrop-blur-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/80 [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(255,255,255,0.9)] hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform";

    // 🚨 THE FIX: Dynamic helper to color the track green up to the thumb
    const getSliderStyle = (value, min, max) => {
        const percentage = ((value - min) / (max - min)) * 100;
        return {
            background: `linear-gradient(to right, #34C759 0%, #34C759 ${percentage}%, rgba(255, 255, 255, 0.55) ${percentage}%, rgba(255, 255, 255, 0.55) 100%)`
        };
    };
    
    const { 
        activeStyle, 
        updateStyle, 
        activeLineTarget, 
        setActiveLineTarget, 
        customFonts, 
        addCustomFont, 
        lineStyles 
    } = useEditorStore();

    const currentStyle = activeLineTarget === -1 
        ? activeStyle 
        : { ...activeStyle, ...(lineStyles[activeLineTarget] || {}) };

    const currentVariants = FONT_LIBRARY[currentStyle.fontFamily] || [];
    const isCustomFontSelected = customFonts.includes(currentStyle.fontFamily);

    const handleCustomFontUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
            const fontUrl = URL.createObjectURL(file);
            const customFontFace = new FontFace(fontName, `url(${fontUrl})`);
            await customFontFace.load();
            document.fonts.add(customFontFace);

            addCustomFont(fontName);
            updateStyle({ 
                fontFamily: fontName, 
                fontWeight: 'normal', 
                fontStyle: 'normal' 
            });
            console.log(`Successfully loaded custom font: ${fontName}`);
        } catch (error) {
            console.error("Failed to load custom font:", error);
            alert("Failed to load font file.");
        }
    };

    const tabs = [
        { id: 'text', label: 'Text' },
        { id: 'transitions', label: 'Transitions' }
    ];

    return (
        /* 🚨 THE LIQUID GLASS PANEL CONTAINER 🚨 */
        <div className="flex flex-col w-full h-full bg-white/55 backdrop-blur-xl border border-white/75 shadow-[0_8px_32px_rgba(180,100,140,0.08)] rounded-3xl text-slate-900 select-none overflow-hidden">
            
            {/* Top Tabs Navigation */}
            {/* 🚨 UPDATED: gap-12, pl-8, pr-2 🚨 */}
            <div className="flex items-center justify-start gap-12 pl-8 pr-2 pt-2 border-b border-white/55 bg-white/40 sticky top-0 z-10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveEditorTab(tab.id)}
                        /* 🚨 UPDATED: text-sm and font-bold for better readability 🚨 */
                        className={`px-3 py-3 text-xs font-bold transition-all border-b-2 relative ${
                            activeEditorTab === tab.id
                                ? 'border-[#34C759] text-slate-900'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Panel Content Area */}
            <div className="flex flex-col gap-6 p-5 overflow-y-auto custom-scrollbar">
                
                {/* ----------------- TAB 1: TEXT STYLES ----------------- */}
                {activeEditorTab === 'text' && (
                    <>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 uppercase">
                                    Target Line to Edit
                                </label>
                                <button 
                                    onClick={() => useEditorStore.getState().resetLinePositions()}
                                    className="text-[10px] text-[#FF2D92] font-bold tracking-[0.06em] hover:opacity-80 transition-opacity"
                                >
                                    RESET LAYOUT
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                <button
                                    onClick={() => setActiveLineTarget(-1)}
                                    className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-full transition-colors ${
                                        activeLineTarget === -1 
                                        ? 'bg-[#34C759] text-white shadow-sm' 
                                        : 'bg-white/45 text-neutral-600 hover:bg-white/70 border border-white/60'
                                    }`}
                                >
                                    All Lines
                                </button>
                                {Array.from({ length: activeStyle.maxLinesPerCard || 1 }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveLineTarget(index)}
                                        className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-full transition-colors ${
                                            activeLineTarget === index 
                                            ? 'bg-[#34C759] text-white shadow-sm' 
                                            : 'bg-white/45 text-neutral-600 hover:bg-white/70 border border-white/60'
                                        }`}
                                    >
                                        Line {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 🚨 CONDITIONAL RENDER: Only show Typography if "All Lines" (-1) is NOT selected 🚨 */}
                        {activeLineTarget !== -1 && (
                            <>
                                <hr className="border-white/55" />

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 uppercase">Typography</span>
                                    </div>

                                    {/* iOS Style Select Dropdowns */}
                                    <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                                        <span className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 uppercase">Fonts</span>
                                        <select 
                                            value={currentStyle.fontFamily}
                                            onChange={(e) => {
                                                const newFamily = e.target.value;
                                                const isCustom = customFonts.includes(newFamily);
                                                const firstVariant = !isCustom && FONT_LIBRARY[newFamily] ? FONT_LIBRARY[newFamily][0] : { weight: 'normal', style: 'normal' };
                                                updateStyle({ fontFamily: newFamily, fontWeight: firstVariant.weight, fontStyle: firstVariant.style });
                                            }}
                                            className="w-full px-2.5 py-1.5 text-[12px] font-semibold text-slate-900 bg-white/55 border border-white/70 rounded-lg hover:bg-white/70 focus:outline-none focus:border-[#34C759] transition-colors"
                                        >
                                            <optgroup label="Standard Fonts">
                                                {Object.keys(FONT_LIBRARY).map((familyName) => (
                                                    <option key={familyName} value={familyName}>{familyName}</option>
                                                ))}
                                            </optgroup>
                                            {customFonts.length > 0 && (
                                                <optgroup label="Your Uploaded Fonts">
                                                    {customFonts.map((font) => (
                                                        <option key={font} value={font}>{font} (Custom)</option>
                                                    ))}
                                                </optgroup>
                                            )}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                                        <span className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 uppercase">Font Face</span>
                                        <select 
                                            value={`${currentStyle.fontWeight}-${currentStyle.fontStyle}`}
                                            disabled={isCustomFontSelected}
                                            onChange={(e) => {
                                                const [weight, style] = e.target.value.split('-');
                                                updateStyle({ fontWeight: weight, fontStyle: style });
                                            }}
                                            className={`w-full px-2.5 py-1.5 text-[12px] font-semibold text-slate-900 bg-white/55 border border-white/70 rounded-lg hover:bg-white/70 focus:outline-none focus:border-[#34C759] transition-colors ${isCustomFontSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isCustomFontSelected ? (
                                                <option value="normal-normal">Custom Font Style</option>
                                            ) : (
                                                currentVariants.map((variant, idx) => (
                                                    <option key={idx} value={`${variant.weight}-${variant.style}`}>
                                                        {variant.label}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                                        <span className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 uppercase">Font Size</span>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="range" min="16" max="150" 
                                                value={currentStyle.fontSize || 32}
                                                onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                                                className={glassSliderClass}
                                                style={getSliderStyle(currentStyle.fontSize || 32, 16, 150)}
                                            />
                                            <input 
                                                type="number" value={currentStyle.fontSize || 32}
                                                onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                                                className="w-12 px-1 py-1.5 text-[12px] font-bold text-center text-slate-900 bg-white/55 border border-white/70 rounded-lg focus:outline-none focus:border-[#34C759]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <hr className="border-white/55" />

                        <div className="space-y-4">
                            {/* 🚨 CUSTOM GLASSY TEXT COLOR PICKER 🚨 */}
                            <div className="grid grid-cols-[1fr_2fr] items-center gap-4 relative">
                                <span className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 uppercase">Text Color</span>
                                
                                {/* Trigger Button & Input */}
                                <div className="flex flex-col relative">
                                    <div className="flex items-center gap-2 p-2 bg-white/60 backdrop-blur-md rounded-xl border border-white/70 shadow-sm w-fit">
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setIsColorPickerOpen(!isColorPickerOpen);
                                            }}
                                            className="w-8 h-8 rounded-lg cursor-pointer border border-white/70 shadow-inner p-0 transition-all hover:scale-105 active:scale-95 shrink-0"
                                            style={{ backgroundColor: currentStyle.fillColor || '#ffffff' }}
                                        />
                                        <input 
                                            type="text" 
                                            value={currentStyle.fillColor || '#ffffff'}
                                            onChange={(e) => updateStyle({ fillColor: e.target.value })}
                                            className="w-20 h-8 px-2 rounded-lg bg-white/80 border border-white/70 text-slate-900 text-[11px] font-semibold focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none shadow-sm uppercase tracking-wide"
                                            maxLength={7}
                                        />
                                        <Edit2 className="w-3.5 h-3.5 text-slate-500 ml-0.5 mr-1" />
                                    </div>

                                    {/* The Popup */}
                                    {isColorPickerOpen && (
                                        <>
                                            {/* Fullscreen overlay to capture outside clicks */}
                                            <div 
                                                className="fixed inset-0 z-50 cursor-default" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setIsColorPickerOpen(false);
                                                }}
                                            ></div>
                                            
                                            {/* Pink Glassy Wrapper */}
                                            <div className={`absolute ${activeLineTarget === -1 ? 'top-12' : 'bottom-12'} right-0 z-50 bg-gradient-to-br from-[#F2D5DA]/80 to-[#DEB7E0]/80 backdrop-blur-2xl rounded-xl shadow-[0_8px_32px_rgba(180,100,140,0.15)] border border-white/80 w-[220px] overflow-hidden flex flex-col`}>
                                                
                                                {/* Custom Top Bar */}
                                                <div className="flex items-center justify-between px-3 py-2 border-b border-white/60 bg-white/50">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-[4px] border border-slate-200 shadow-inner" style={{ backgroundColor: currentStyle.fillColor || '#ffffff' }} />
                                                        <span className="text-slate-800 text-[11px] font-bold font-mono tracking-wider">
                                                            # {(currentStyle.fillColor || '#ffffff').replace('#', '').toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateStyle({ fillColor: '#FFFFFF' });
                                                        }}
                                                        className="p-1 rounded hover:bg-white/60 transition-colors text-slate-400 hover:text-slate-900"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Native Library Injection */}
                                                <div className="p-3 pb-2
                                                    [&_.react-colorful]:w-full [&_.react-colorful]:h-auto [&_.react-colorful]:flex [&_.react-colorful]:flex-col [&_.react-colorful]:gap-0
                                                    [&_.react-colorful__saturation]:h-32 [&_.react-colorful__saturation]:rounded-t-lg [&_.react-colorful__saturation]:rounded-b-none [&_.react-colorful__saturation]:border-none
                                                    [&_.react-colorful__hue]:h-5 [&_.react-colorful__hue]:rounded-t-none [&_.react-colorful__hue]:rounded-b-lg [&_.react-colorful__hue]:mt-0 [&_.react-colorful__hue]:border-none
                                                    [&_.react-colorful__pointer]:!w-4 [&_.react-colorful__pointer]:!h-4 [&_.react-colorful__pointer]:!border-2 [&_.react-colorful__pointer]:border-white [&_.react-colorful__pointer]:shadow-[0_0_4px_rgba(0,0,0,0.5)]
                                                ">
                                                    <HexColorPicker 
                                                        color={currentStyle.fillColor || '#ffffff'} 
                                                        onChange={(newColor) => {
                                                            updateStyle({ fillColor: newColor });
                                                        }} 
                                                    />
                                                </div>

                                                {/* Custom Bottom Bar */}
                                                <div className="flex items-center justify-between px-3 py-2.5 bg-white/40 border-t border-white/50">
                                                    <div className="w-4 h-4 rounded-[4px] border border-slate-200 shadow-inner" style={{ backgroundColor: currentStyle.fillColor || '#ffffff' }} />
                                                    <span className="text-slate-500 font-bold text-[10px] font-mono tracking-wider">
                                                        {(currentStyle.fillColor || '#ffffff').toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* 🚨 NEW: BACKGROUND BOX SETTINGS 🚨 */}
                            <hr className="border-white/55 mt-4" />
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2 mt-4">
                                    <span className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 uppercase">Background Pill</span>
                                    {/* Glassy iOS-style Toggle Switch */}
                                    <button 
                                        onClick={() => updateStyle({ hasBackground: !(currentStyle.hasBackground) })}
                                        className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${currentStyle.hasBackground ? 'bg-[#34C759]' : 'bg-white/40 border border-white/60'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${currentStyle.hasBackground ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {/* Conditional Render: Only show color picker if Background is toggled ON */}
                                {currentStyle.hasBackground && (
                                    <div className="grid grid-cols-[1fr_2fr] items-center gap-4 relative">
                                        <span className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 uppercase">Pill Color</span>
                                        <div className="flex flex-col relative">
                                            <div className="flex items-center gap-2 p-2 bg-white/60 backdrop-blur-md rounded-xl border border-white/70 shadow-sm w-fit">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault(); e.stopPropagation();
                                                        setIsBgColorPickerOpen(!isBgColorPickerOpen);
                                                    }}
                                                    className="w-8 h-8 rounded-lg cursor-pointer border border-white/70 shadow-inner p-0 transition-all hover:scale-105 active:scale-95 shrink-0"
                                                    style={{ backgroundColor: currentStyle.backgroundColor || '#000000' }}
                                                />
                                                <input 
                                                    type="text" 
                                                    value={currentStyle.backgroundColor || '#000000'}
                                                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                                                    className="w-20 h-8 px-2 rounded-lg bg-white/80 border border-white/70 text-slate-900 text-[11px] font-semibold outline-none shadow-sm uppercase tracking-wide"
                                                    maxLength={7}
                                                />
                                                <Edit2 className="w-3.5 h-3.5 text-slate-500 ml-0.5 mr-1" />
                                            </div>

                                            {/* Background Color Popup */}
                                            {isBgColorPickerOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-50 cursor-default" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsBgColorPickerOpen(false); }}></div>
                                                    <div className={`absolute ${activeLineTarget === -1 ? 'top-12' : 'bottom-12'} right-0 z-50 bg-gradient-to-br from-[#F2D5DA]/80 to-[#DEB7E0]/80 backdrop-blur-2xl rounded-xl shadow-lg border border-white/80 w-[220px] overflow-hidden flex flex-col`}>
                                                        <div className="p-3 pb-2 [&_.react-colorful]:w-full [&_.react-colorful]:h-auto [&_.react-colorful__saturation]:h-32 [&_.react-colorful__saturation]:rounded-t-lg [&_.react-colorful__hue]:h-5 [&_.react-colorful__hue]:rounded-b-lg">
                                                            <HexColorPicker 
                                                                color={currentStyle.backgroundColor || '#000000'} 
                                                                onChange={(newColor) => updateStyle({ backgroundColor: newColor })} 
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                                <span className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 uppercase">Outline Width</span>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="range" min="0" max="15" 
                                        value={currentStyle.strokeWidth || 0}
                                        onChange={(e) => updateStyle({ strokeWidth: parseInt(e.target.value) })}
                                        className={glassSliderClass}
                                        style={getSliderStyle(currentStyle.strokeWidth || 0, 0, 15)}
                                    />
                                    <span className="text-[12px] font-bold text-[#34C759] w-6 text-right tabular-nums">{currentStyle.strokeWidth || 0}px</span>

                                </div>
                            </div>

                            {/* 🚨 UPDATED: DROP SHADOW INTENSITY SLIDER (Glass UI) */}
                            <div className="grid grid-cols-[1fr_2fr] items-center gap-4 mt-2">
                                <span className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 uppercase">Shadow Opacity</span>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="range" min="0" max="100" 
                                        value={currentStyle.shadowIntensity !== undefined ? currentStyle.shadowIntensity : (currentStyle.hasShadow !== false ? 80 : 0)}
                                        onChange={(e) => updateStyle({ shadowIntensity: parseInt(e.target.value), hasShadow: parseInt(e.target.value) > 0 })}
                                        className={glassSliderClass}
                                        style={getSliderStyle(currentStyle.shadowIntensity !== undefined ? currentStyle.shadowIntensity : (currentStyle.hasShadow !== false ? 80 : 0), 0, 100)}
                                    />
                                    <span className="text-[12px] font-bold text-[#34C759] w-8 text-right tabular-nums">
                                        {currentStyle.shadowIntensity !== undefined ? currentStyle.shadowIntensity : (currentStyle.hasShadow !== false ? 80 : 0)}%
                                    </span>
                                </div>
                            </div>

                            

                            {/* 🚨 NEW: DROP SHADOW SOFTNESS (BLUR) SLIDER */}
                            <div className="grid grid-cols-[1fr_2fr] items-center gap-4 mt-2">
                                <span className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 uppercase">Shadow Softness</span>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="range" min="0" max="50" 
                                        value={currentStyle.shadowBlur || 0}
                                        onChange={(e) => updateStyle({ shadowBlur: parseInt(e.target.value) })}
                                        className={glassSliderClass}
                                    />
                                    <span className="text-[12px] font-bold text-[#34C759] w-8 text-right tabular-nums">
                                        {currentStyle.shadowBlur || 0}px
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* 🚨 MOVED: LAYOUT SETTINGS - ONLY VISIBLE FOR "ALL LINES" (-1) 🚨 */}
                        {activeLineTarget === -1 && (
                            <>
                                <hr className="border-white/55 mt-6 mb-4" />
                                
                                {/* Changed from space-y-6 to space-y-4 to match Typography section */}
                                <div className="space-y-4"> 
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] tracking-[0.14em] font-bold text-[#34C759] uppercase">Layout Properties</span>
                                    </div>

                                    {/* Unified Grid Layout for Max Lines */}
                                    <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                                        <span className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 uppercase">Lines / Card</span>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="range" min="1" max="10" 
                                                value={activeStyle.maxLinesPerCard || 1}
                                                onChange={(e) => updateStyle({ maxLinesPerCard: parseInt(e.target.value) || 1 })}
                                                onPointerUp={() => useEditorStore.getState().bakeTimeline()}
                                                className={glassSliderClass}
                                                style={getSliderStyle(activeStyle.maxLinesPerCard || 1, 1, 10)}
                                            />
                                            {/* Matches the Font Size number input styling exactly */}
                                            <input 
                                                type="number" min="1" max="20"
                                                value={activeStyle.maxLinesPerCard || 1} 
                                                onChange={(e) => updateStyle({ maxLinesPerCard: parseInt(e.target.value) || 1 })}
                                                onBlur={() => useEditorStore.getState().bakeTimeline()}
                                                onKeyDown={(e) => e.key === 'Enter' && useEditorStore.getState().bakeTimeline()}
                                                className="w-12 px-1 py-1.5 text-[12px] font-bold text-center text-slate-900 bg-white/55 border border-white/70 rounded-lg focus:outline-none focus:border-[#34C759]"
                                            />
                                        </div>
                                    </div>

                                    {/* Unified Grid Layout for Max Chars */}
                                    <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                                        <span className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 uppercase">Chars / Line</span>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="range" min="5" max="40" 
                                                value={activeStyle.maxCharsPerLine || 20}
                                                onChange={(e) => updateStyle({ maxCharsPerLine: parseInt(e.target.value) })}
                                                onPointerUp={() => useEditorStore.getState().bakeTimeline()}
                                                className={glassSliderClass}
                                                style={getSliderStyle(activeStyle.maxCharsPerLine || 20, 5, 40)}
                                            />
                                            {/* Converted the static div into an editable input to match the rest of the UI */}
                                            <input 
                                                type="number" min="5" max="40"
                                                value={activeStyle.maxCharsPerLine || 20} 
                                                onChange={(e) => updateStyle({ maxCharsPerLine: parseInt(e.target.value) })}
                                                onBlur={() => useEditorStore.getState().bakeTimeline()}
                                                onKeyDown={(e) => e.key === 'Enter' && useEditorStore.getState().bakeTimeline()}
                                                className="w-12 px-1 py-1.5 text-[12px] font-bold text-center text-slate-900 bg-white/55 border border-white/70 rounded-lg focus:outline-none focus:border-[#34C759]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                    </>
                )}

                {/* ----------------- TAB 3: TRANSITIONS ----------------- */}

                
                {activeEditorTab === 'templates' && (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between p-3 border rounded-xl bg-white/55 border-white/70 shadow-sm">
                                <span className="text-sm font-semibold text-slate-800">Max lines per card</span>
                                <input 
                                    type="number" min="1" max="20"
                                    value={activeStyle.maxLinesPerCard || 1} 
                                    onChange={(e) => updateStyle({ maxLinesPerCard: parseInt(e.target.value) || 1 })}
                                    onBlur={() => useEditorStore.getState().bakeTimeline()}
                                    onKeyDown={(e) => e.key === 'Enter' && useEditorStore.getState().bakeTimeline()}
                                    className="w-12 h-8 text-sm font-bold text-center rounded-lg bg-white/80 border border-white/70 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#34C759]"
                                />
                            </div>
                            <input 
                                type="range" min="1" max="10" 
                                value={activeStyle.maxLinesPerCard || 1}
                                onChange={(e) => updateStyle({ maxLinesPerCard: parseInt(e.target.value) || 1 })}
                                onPointerUp={() => useEditorStore.getState().bakeTimeline()}
                                className={`${glassSliderClass} mt-2`}
                                style={getSliderStyle(activeStyle.maxLinesPerCard || 1, 1, 10)}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between p-3 border rounded-xl bg-white/55 border-white/70 shadow-sm">
                                <span className="text-sm font-semibold text-slate-800">Max chars per line</span>
                                <div className="flex items-center justify-center w-10 h-8 text-sm font-bold rounded-lg bg-white/80 border border-white/70 text-slate-900">
                                    {activeStyle.maxCharsPerLine}
                                </div>
                            </div>
                            <input 
                                type="range" min="5" max="40" 
                                value={activeStyle.maxCharsPerLine || 20}
                                onChange={(e) => updateStyle({ maxCharsPerLine: parseInt(e.target.value) })}
                                onPointerUp={() => useEditorStore.getState().bakeTimeline()}
                                className={`${glassSliderClass} mt-2`}
                                style={getSliderStyle(activeStyle.maxCharsPerLine || 20, 5, 40)}
                            />
                        </div>
                    </div>
                )}

                {/* ----------------- TAB 3: TRANSITIONS ----------------- */}
                {activeEditorTab === 'transitions' && (
                    <TransitionsPanel 
                        glassSliderClass={glassSliderClass} 
                        getSliderStyle={getSliderStyle} 
                    />
                )}
            </div>
        </div>
    );
}
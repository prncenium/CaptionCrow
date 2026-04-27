import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';

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
    'Impact': [
        { label: 'Regular', weight: '400', style: 'normal' }
    ],
    // NEW FONTS ADDED BELOW:
    'Apple Garamond': [
        { label: 'Regular', weight: '400', style: 'normal' }
    ],
    'Times New Roman': [
        { label: 'Regular', weight: '400', style: 'normal' }
    ],
    'Helvetica': [
        { label: 'Regular', weight: '400', style: 'normal' }
    ],
    'Blacksword': [
        { label: 'Regular', weight: 'normal', style: 'normal' }
    ],
    'Coolvetica': [
        { label: 'Regular', weight: 'normal', style: 'normal' }
    ],
    'Open Sans': [
        { label: 'Bold', weight: '700', style: 'normal' },
        { label: 'Regular', weight: '400', style: 'normal' }
    ]
};

export default function StyleSelector() {
    const { activeStyle, updateStyle, activeLineTarget, setActiveLineTarget, customFonts, addCustomFont, lineStyles } = useEditorStore();

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
            alert("Failed to load font file. Please ensure it is a valid .ttf or .otf file.");
        }
    };

    return (
        <div className="flex flex-col gap-5">

            
            
            <hr className="border-neutral-800" />
            
            {/* ... Your existing Target Line Selector code follows here ... */}
            
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                        Target Line to Edit
                    </label>
                    {/* NEW: Reset Layout Button */}
                    <button 
                        onClick={() => useEditorStore.getState().resetLinePositions()}
                        className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-wide"
                    >
                        Reset Layout
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveLineTarget(-1)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                            activeLineTarget === -1 ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                    >
                        All Lines
                    </button>
                    {Array.from({ length: activeStyle.maxLinesPerCard || 1 }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveLineTarget(index)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                                activeLineTarget === index ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                            }`}
                        >
                            Line {index + 1}
                        </button>
                    ))}
                </div>
            </div>

            <hr className="border-neutral-800" />

            <div className="flex flex-col gap-3 p-4 border rounded-md bg-neutral-900 border-neutral-800">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Typography</label>
                    <div>
                        <input 
                            type="file" 
                            id="font-upload" 
                            accept=".ttf,.otf,.woff" 
                            className="hidden" 
                            onChange={handleCustomFontUpload}
                        />
                        <label 
                            htmlFor="font-upload" 
                            className="px-2 py-1 text-xs font-semibold rounded cursor-pointer bg-neutral-800 text-emerald-500 hover:bg-neutral-700"
                        >
                            + Upload Font
                        </label>
                    </div>
                </div>

                <select 
                    value={currentStyle.fontFamily}
                    onChange={(e) => {
                        const newFamily = e.target.value;
                        const isCustom = customFonts.includes(newFamily);
                        
                        const firstVariant = !isCustom && FONT_LIBRARY[newFamily] 
                            ? FONT_LIBRARY[newFamily][0] 
                            : { weight: 'normal', style: 'normal' };

                        updateStyle({ 
                            fontFamily: newFamily,
                            fontWeight: firstVariant.weight,
                            fontStyle: firstVariant.style
                        });
                    }}
                    className="w-full p-2 text-sm text-white bg-black border border-neutral-700 rounded-md focus:outline-none focus:border-emerald-500"
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

                <select 
                    value={`${currentStyle.fontWeight}-${currentStyle.fontStyle}`}
                    disabled={isCustomFontSelected}
                    onChange={(e) => {
                        const [weight, style] = e.target.value.split('-');
                        updateStyle({ fontWeight: weight, fontStyle: style });
                    }}
                    className={`w-full p-2 text-sm text-white bg-black border border-neutral-700 rounded-md focus:outline-none focus:border-emerald-500 ${isCustomFontSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
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

            <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Text Color</label>
                <div className="flex items-center gap-3">
                    <input 
                        type="color" 
                        value={currentStyle.fillColor || '#ffffff'}
                        onChange={(e) => updateStyle({ fillColor: e.target.value })}
                        className="w-10 h-10 p-1 bg-neutral-900 border border-neutral-700 rounded cursor-pointer"
                    />
                    <span className="text-sm text-neutral-300 font-mono uppercase">{currentStyle.fillColor || '#FFFFFF'}</span>
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    <span>Font Size</span>
                    <span className="text-emerald-500">{currentStyle.fontSize}px</span>
                </div>
                <input 
                    type="range" min="16" max="150" 
                    value={currentStyle.fontSize}
                    onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
            </div>

            <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    <span>Outline Thickness</span>
                    <span className="text-emerald-500">{currentStyle.strokeWidth}px</span>
                </div>
                <input 
                    type="range" min="0" max="15" 
                    value={currentStyle.strokeWidth}
                    onChange={(e) => updateStyle({ strokeWidth: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
            </div>

            <hr className="border-neutral-800" />

            {/* The existing Entry Animation block */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    Entry Animation
                </label>
                <select 
                    value={currentStyle.animationStyle || 'none'}
                    onChange={(e) => updateStyle({ animationStyle: e.target.value })}
                    className="w-full p-2 text-sm text-white bg-neutral-900 border border-neutral-700 rounded-md focus:outline-none focus:border-emerald-500"
                >
                    <option value="none">None (Instant Cut)</option>
                    <option value="fadeIn">Fade In</option>
                    <option value="popIn">Pop In (Zoom)</option>
                    <option value="slideUp">Slide Up</option>
                    <option value="slideDown">Slide Down</option>
                    <option value="slideLeft">Slide from Right</option>
                    <option value="slideRight">Slide from Left</option>
                </select>
            </div>

            {/* NEW: Animation Speed/Duration Slider */}
            <div className="flex flex-col gap-2 mt-4">
                <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    <span>Animation Speed</span>
                    <span className="text-emerald-500">{currentStyle.animationDurationMs || 300}ms</span>
                </div>
                <input 
                    type="range" 
                    min="50"  
                    max="1500" 
                    step="50"  
                    value={currentStyle.animationDurationMs || 300}
                    onChange={(e) => updateStyle({ animationDurationMs: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
            </div>

            {/* The existing Motion Blur Slider */}
            <div className="flex flex-col gap-2 mt-4">
                <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    <span>Motion Blur Intensity</span>
                    <span className="text-emerald-500">{currentStyle.motionBlur || 0}%</span>
                </div>
                <input 
                    type="range" min="0" max="100" 
                    value={currentStyle.motionBlur || 0}
                    onChange={(e) => updateStyle({ motionBlur: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
            </div>

            <hr className="border-neutral-800 my-4" />

            {/* ... Global Layout Controls ... */}
            
            {/* NEW: Stagger Delay Slider */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-3 border rounded-md bg-neutral-900 border-neutral-800">
                    <span className="text-sm font-medium text-neutral-300">Line Stagger Delay</span>
                    <div className="flex items-center justify-center w-12 h-8 text-sm font-bold rounded bg-neutral-800 text-neutral-200">
                        {activeStyle.staggerDelayMs || 0}ms
                    </div>
                </div>
                <input 
                    type="range" min="0" max="1000" step="50"
                    value={activeStyle.staggerDelayMs || 0}
                    onChange={(e) => updateStyle({ staggerDelayMs: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
            </div>

           {/* Existing Max chars per line */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-3 border rounded-md bg-neutral-900 border-neutral-800">
                    <span className="text-sm font-medium text-neutral-300">Max chars per line</span>
                    <div className="flex items-center justify-center w-10 h-8 text-sm font-bold rounded bg-neutral-800 text-neutral-200">
                        {activeStyle.maxCharsPerLine}
                    </div>
                </div>
                <input 
                    type="range" min="5" max="40" 
                    value={activeStyle.maxCharsPerLine}
                    onChange={(e) => updateStyle({ maxCharsPerLine: parseInt(e.target.value) })}
                    onPointerUp={() => useEditorStore.getState().bakeTimeline()}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-3 border rounded-md bg-neutral-900 border-neutral-800">
                    <span className="text-sm font-medium text-neutral-300">Max lines per card</span>
                    <input 
                        type="number" min="1" max="20"
                        value={activeStyle.maxLinesPerCard || 1} 
                        onChange={(e) => updateStyle({ maxLinesPerCard: parseInt(e.target.value) || 1 })}
                        
                        // 👇 ADD THESE TWO LINES FOR THE NUMBER BOX 👇
                        onBlur={() => useEditorStore.getState().bakeTimeline()}
                        onKeyDown={(e) => e.key === 'Enter' && useEditorStore.getState().bakeTimeline()}

                        className="w-12 h-8 text-sm font-bold text-center rounded bg-neutral-800 text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                </div>
                <input 
                    type="range" min="1" max="10" 
                    value={activeStyle.maxLinesPerCard || 1}
                    onChange={(e) => updateStyle({ maxLinesPerCard: parseInt(e.target.value) || 1 })}
                    
                    // 👇 ADD THIS EXACT LINE FOR THE SLIDER 👇
                    onPointerUp={() => useEditorStore.getState().bakeTimeline()}

                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
            </div>
        </div>
    );
}
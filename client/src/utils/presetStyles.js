/**
 * PRESET_STYLES
 * This dictionary maps the preset IDs from the Dashboard to the exact
 * typography, color, and animation math required by the EditorStore and FFmpeg.
 */

export const PRESET_STYLES = {
    'slide-up': {
        id: 'slide-up',
        name: 'Viral Slide Up',
        
        // Global / Line 1 defaults
        fontFamily: 'Poppins',
        fontFace: 'SemiBold', // 🚨 ADDED: Forces the UI dropdown to select 'SemiBold'
        fontWeight: '600', 
        fontStyle: 'normal',
        fontSize: 48,
        fillColor: '#FFFFFF',
        strokeColor: 'transparent',
        strokeWidth: 0,
        shadowColor: '#000000',
        hasShadow: true,
        shadowOpacity: 70,     // Drop shadow, on by default (toggle in the UI)
        shadowIntensity: 70,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        shadowBlur: 5,
        wordStagger: true,
        animationStyle: 'slideUp',
        animationDurationMs: 300,
        staggerDelayMs: 150,
        motionBlur: 1,
        linesPerCard: 2,      // 🚨 FIXED KEY: Connects to the Layout Slider
        charsPerLine: 14,     // 🚨 FIXED KEY: Connects to the Layout Slider
        
        // Line-specific overrides
        lineStyles: {
            0: { // Line 1
                fontFamily: 'Poppins',
                fontFace: 'SemiBold', // 🚨 ADDED
                fontWeight: '600',
                fontSize: 48,
                fillColor: '#FFFFFF',
            },
            1: { // Line 2
                fontFamily: 'Poppins',
                fontFace: 'Bold',     // 🚨 ADDED: Forces Line 2 dropdown to 'Bold'
                fontWeight: '700',
                fontSize: 100,
                fillColor: '#FFFF3D',
            }
        }
    },
    
    'cinematic': {
        id: 'cinematic',
        name: 'Cinematic', 
        
        // Global / Fallback defaults
        fontFamily: 'Poppins',
        fontFace: 'SemiBold',
        fontWeight: '600', 
        fontStyle: 'normal',
        fontSize: 48,
        fillColor: '#000000',
        inactiveColor: '#A0A0A0',
        hasBackground: true,        // 🚨 ADDED: Maps to the "Background Pill" toggle
        backgroundColor: '#FFFFFF', // 🚨 ADDED: Maps to the "Pill Color" picker
        strokeColor: 'transparent',
        strokeWidth: 0,
        shadowColor: '#000000',
        hasShadow: true,
        shadowOpacity: 70,     // Drop shadow, on by default (toggle in the UI)
        shadowIntensity: 70,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        shadowBlur: 5,
        wordStagger: true,
        animationStyle: 'none',
        animationDurationMs: 300,
        staggerDelayMs: 300,  
        motionBlur: 0,
        linesPerCard: 1,      // Maps to Layout Properties -> Lines / Card
        charsPerLine: 19,     // Maps to Layout Properties -> Chars / Line
        maxLinesPerCard: 1,   // (Kept for compatibility with your chunking math)
        maxCharsPerLine: 19,  // (Kept for compatibility with your chunking math)
        
        // Line-specific overrides
        // Removed lines 1 and 2 since the layout is now strictly 1 Line / Card
        lineStyles: {
            0: { // Line 1
                fontFamily: 'Poppins',
                fontFace: 'SemiBold',
                fontWeight: '600',
                fontSize: 48,
                fillColor: '#000000',
                hasBackground: true,
                backgroundColor: '#FFFFFF',
                staggerDelayMs: 300
            }
        }
    },
    
    'minimalist': {
        id: 'minimalist',
        name: 'Minimalist',
        // Global defaults (All Lines)
        fontFamily: 'Coolvetica Regular',
fontFace: 'Regular',
fontWeight: '400',
fontStyle: 'normal',
        fontSize: 44,
        fillColor: '#FFFFFF',
        strokeColor: 'transparent',
        strokeWidth: 0,
        shadowColor: '#000000',
        hasShadow: true,
        shadowOpacity: 70,     // Drop shadow, on by default (toggle in the UI)
        shadowIntensity: 70,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        shadowBlur: 5,
        wordStagger: false,
        animationStyle: 'none',
        animationDurationMs: 0,
        staggerDelayMs: 0,
        motionBlur: 0,
        maxLinesPerCard: 1, 
        maxCharsPerLine: 6,     
        
        // Emphasis: yellow + Apple Garamond Bold Italic
        emphasisColor: '#FFFF3D',
        emphasisFontSize: 58,
        emphasisFontFamily: 'Apple Garamond',
        emphasisFontFace: 'BoldItalic',
        emphasisFontWeight: '700',
        emphasisFontStyle: 'italic',

        // Line-specific overrides
        lineStyles: {
            0: {
                fontFamily: 'Coolvetica Regular',
                fontFace: 'Regular',
                fontWeight: '400',
                fontSize: 44,
                fillColor: '#FFFFFF',
                emphasisColor: '#FFFF3D',
                emphasisFontSize: 58,
                emphasisFontFamily: 'Apple Garamond',
                emphasisFontFace: 'BoldItalic',
                emphasisFontWeight: '700',
                emphasisFontStyle: 'italic',
            }
        }
    },
    
    'neon': {
        id: 'neon',
        name: 'Creator Neon',
        fontFamily: 'Inter',
        fontFace: 'Bold',
        fontWeight: '700',
        fontStyle: 'normal',
        fontSize: 48,
        fillColor: '#FFFFFF',
        strokeColor: 'transparent',
        strokeWidth: 0,
        shadowColor: '#000000',
        hasShadow: true,
        shadowOpacity: 70,     // Drop shadow, on by default (toggle in the UI)
        shadowIntensity: 70,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        shadowBlur: 5,

        // Y-axis bounce word by word — words rise from below to baseline
        wordStagger: true,
        animationStyle: 'bounce',  // Y-axis: rise from +38px below, overshoot above, spring settle
        animationDurationMs: 300,  // Snappy bounce per word
        staggerDelayMs: 55,        // Very tight cascade — words bounce nearly simultaneously
        motionBlur: 0,

        // Single-line layout — no second line, no yellow emphasis
        maxLinesPerCard: 1,
        maxCharsPerLine: 20,
        charsPerLine: 20,
    },

    'viral-pop': {
        id: 'viral-pop',
        name: 'Viral Pop',

        // Global / base word defaults — small, white
        fontFamily: 'Poppins',
        fontFace: 'Bold',
        fontWeight: '700',
        fontStyle: 'normal',
        fontSize: 42,
        fillColor: '#FFFFFF',
        strokeColor: 'transparent',
        strokeWidth: 0,
        shadowColor: '#000000',
        hasShadow: true,
        shadowOpacity: 70,
        shadowIntensity: 70,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        shadowBlur: 5,

        // Word-by-word pop-in (scale up + fade, slight overshoot)
        wordStagger: true,
        animationStyle: 'popin',
        animationDurationMs: 350,
        staggerDelayMs: 140,
        motionBlur: 0,

        // Stacked layout — multi-word lines (up to 3 words), AI decides 2 or 3 lines/card
        linesPerCard: 3,
        charsPerLine: 18,
        maxLinesPerCard: 3,
        maxCharsPerLine: 18,

        // Per-line styling — the SECOND line is the big yellow emphasis line;
        // lines 1 and 3 are smaller and white.
        lineStyles: {
            0: { // Line 1 — small, white
                fontFamily: 'Poppins', fontFace: 'Bold', fontWeight: '700',
                fontSize: 42, fillColor: '#FFFFFF',
            },
            1: { // Line 2 — BIG, yellow
                fontFamily: 'Poppins', fontFace: 'Bold', fontWeight: '700',
                fontSize: 82, fillColor: '#FFFF3D',
            },
            2: { // Line 3 — small, white
                fontFamily: 'Poppins', fontFace: 'Bold', fontWeight: '700',
                fontSize: 42, fillColor: '#FFFFFF',
            },
        },
    },


};
/**
 * Calculates the exact X, Y, Opacity, Scale, and Blur of a caption block based on the video's current time.
 * @param {Number} currentTime - The current millisecond of the video
 * @param {Number} chunkStart - The exact time the caption block begins
 * @param {String} animationStyle - The type of animation (slideUp, slideLeft, popIn, none)
 * @param {Object} dimensions - The width and height of the canvas to calculate off-screen offsets
 * @param {Number} customDurationMs - The custom duration of the animation in milliseconds
 * @returns {Object} { offsetX, offsetY, opacity, scale, blur, progress }
 */
export const calculateAnimation = (currentTime, chunkStart, animationStyle, dimensions, customDurationMs = 220) => {
    const introDuration = customDurationMs / 1000; 
    const elapsed = currentTime - chunkStart;

    // 1. Move the style matching UP here so we know if it's a "popin" BEFORE it starts
    const styleStr = String(animationStyle || 'none').toLowerCase().replace(/\s+/g, '');
    let normalizedStyle = 'none';
    if (styleStr.includes('up')) normalizedStyle = 'slideup';
    else if (styleStr.includes('down')) normalizedStyle = 'slidedown';
    else if (styleStr.includes('fromright') || styleStr === 'slideright') normalizedStyle = 'slideright';
    else if (styleStr.includes('fromleft') || styleStr === 'slideleft') normalizedStyle = 'slideleft';
    else if (styleStr.includes('pop')) normalizedStyle = 'popin';
    else if (styleStr.includes('bounce')) normalizedStyle = 'bounce';
    else if (styleStr.includes('fade')) normalizedStyle = 'fadein';

    const initialScale =
        normalizedStyle === 'bounce' ? 0.90  // bounce: start slightly small (above baseline)
        : normalizedStyle === 'popin'  ? 0.5  // popin: start small
        : 0.8;                                // slides: near full size

    const initialOffsetY =
        normalizedStyle === 'bounce'  ? 38   // bounce: start 38px BELOW target (rises up)
        : normalizedStyle === 'popin' ? 0
        : normalizedStyle === 'none'  ? 0   // none/karaoke: no Y displacement (fixes Cinematic)
        : normalizedStyle === 'fadein'? 0
        : 40;                               // slide styles only

    // 3. Apply the correct starting state
    if (elapsed < 0) return { offsetX: 0, offsetY: initialOffsetY, opacity: 0, scale: initialScale, blur: 0, progress: 0 };

    const linearProgress = Math.min(elapsed / introDuration, 1);
    
    // 🚨 OPACITY DELAY MATH: Stays 0 for the first 15% of the animation, then fades smoothly
    const opacityProgress = Math.min(1, Math.max(0, (linearProgress - 0.15) / 0.85));

    // 🚨 THE HORMOZI CURVE (Cubic Ease-Out)
    const progress = 1 - Math.pow(1 - linearProgress, 3); // Position curve
    const hormoziScale = 0.8 + (0.2 * progress); // Scale curve

    // Set blur to 0 globally for frontend performance
    let state = { offsetX: 0, offsetY: 0, opacity: 1, scale: 1, blur: 0, progress: progress };

    if (progress === 1) return state;

    

    switch (normalizedStyle) {
        case 'slideup': {
            state.offsetY = 40 - (40 * progress);
            state.opacity = opacityProgress;
            state.scale = hormoziScale;
            break;
        }
        case 'slidedown': {
            state.offsetY = -40 + (40 * progress); 
            state.opacity = opacityProgress;
            state.scale = hormoziScale;
            break;
        }
        case 'slideright': {
            state.offsetX = 100 - (100 * progress);
            state.opacity = opacityProgress;
            state.scale = hormoziScale;
            break;
        }
        case 'slideleft': {
            state.offsetX = -100 + (100 * progress); 
            state.opacity = opacityProgress;
            state.scale = hormoziScale;
            break;
        }
        case 'popin': { // 🚨 Added {
            let bounceScale = 1;
            if (linearProgress < 0.4) {
                const p = linearProgress / 0.4;
                bounceScale = 0.5 + (0.65 * (1 - Math.pow(1 - p, 3))); 
            } else {
                const p = (linearProgress - 0.4) / 0.6;
                bounceScale = 1.15 - (0.15 * (1 - Math.pow(1 - p, 2))); 
            }
            state.scale = bounceScale; 
            state.opacity = opacityProgress;
            break;
        } 

        case 'bounce': {
            // Smooth underdamped spring — single continuous function, no phase breaks.
            // y(t) = 38·e^(−5.5t)·cos(10.5t): starts +38px below baseline, overshoots above, settles at 0.
            // scale(t) = 1 − 0.10·e^(−5.5t)·cos(10.5t): mirrors y, starts at 0.90, settles at 1.0.
            // Both functions share the same envelope so velocity is always continuous — no jerks.
            const A     = 38;
            const decay = 5.5;
            const freq  = 10.5;
            const env   = Math.exp(-decay * linearProgress) * Math.cos(freq * linearProgress);

            state.offsetY = A * env;              // +38 → oscillates → 0
            state.scale   = 1.0 - 0.10 * env;    // 0.90 → oscillates around 1 → 1.0
            state.opacity = Math.min(1, linearProgress / 0.20);
            break;
        }
        case 'fadein': {
            state.opacity = opacityProgress;
            break;
        }
    }

    return state;
};
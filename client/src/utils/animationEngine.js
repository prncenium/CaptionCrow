/**
 * Calculates the exact X, Y, Opacity, and Scale of a caption block based on the video's current time.
 * @param {Number} currentTime - The current millisecond of the video
 * @param {Number} chunkStart - The exact time the caption block begins
 * @param {String} animationStyle - The type of animation (slideUp, slideLeft, popIn, none)
 * @param {Object} dimensions - The width and height of the canvas to calculate off-screen offsets
 * @param {Number} customDurationMs - The custom duration of the animation in milliseconds
 * @returns {Object} { offsetX, offsetY, opacity, scale, progress }
 */
export const calculateAnimation = (currentTime, chunkStart, animationStyle, dimensions, customDurationMs = 300) => {
    // Convert the user's millisecond choice (e.g., 300) into seconds for the math (e.g., 0.3)
    const introDuration = customDurationMs / 1000; 
    
    // Calculate how many seconds we are into this specific word/chunk
    const elapsed = currentTime - chunkStart;

    // If the text hasn't started yet, hide it completely
    if (elapsed < 0) return { offsetX: 0, offsetY: 0, opacity: 0, scale: 1, progress: 0 };

    // Calculate progress from 0.0 to 1.0 (e.g., 0.5 means the animation is 50% finished)
    // Using easeOut effect so it snaps in fast and settles smoothly
    const linearProgress = Math.min(elapsed / introDuration, 1);
    const progress = 1 - Math.pow(1 - linearProgress, 3); // Cubic Ease-Out math

    // Default state (fully visible, centered) exporting progress for the Motion Blur engine
    let state = { offsetX: 0, offsetY: 0, opacity: 1, scale: 1, progress: progress };

    // If the animation is already 100% done, just return the default state immediately to save CPU
    if (progress === 1) return state;

    // Apply the math based on the chosen style
    switch (animationStyle) {
        case 'slideUp':
            state.offsetY = 50 - (50 * progress); // Starts 50px lower, moves up to 0
            state.opacity = progress;
            break;
        case 'slideDown':
            state.offsetY = -50 + (50 * progress); // Starts 50px higher, moves down to 0
            state.opacity = progress;
            break;
        case 'slideLeft':
            state.offsetX = 100 - (100 * progress); // Starts 100px right, moves left to 0
            state.opacity = progress;
            break;
        case 'slideRight':
            state.offsetX = -100 + (100 * progress); // Starts 100px left, moves right to 0
            state.opacity = progress;
            break;
        case 'popIn':
            state.scale = 0.5 + (0.5 * progress); // Starts at 50% size, grows to 100%
            state.opacity = progress;
            break;
        case 'fadeIn':
            state.opacity = progress;
            break;
        default:
            // 'none'
            break;
    }

    return state;
};
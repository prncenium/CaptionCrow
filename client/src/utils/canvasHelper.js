/**
 * Global canvas context used for off-screen text measurement.
 * This prevents creating thousands of canvas elements in memory.
 */
let measurementContext = null;

const getMeasurementContext = () => {
    if (!measurementContext) {
        const canvas = document.createElement('canvas');
        measurementContext = canvas.getContext('2d');
    }
    return measurementContext;
};

/**
 * Measures the exact width of a string of text based on the current style.
 * Essential for centering and bounding box calculations.
 */
export const measureTextWidth = (text, style) => {
    const ctx = getMeasurementContext();
    if (!ctx) return 0;

    // Set font style exactly as it appears in the editor
    const fontStyle = style.fontStyle || 'normal';
    const fontWeight = style.fontWeight || 'normal';
    const fontSize = style.fontSize || 32;
    const fontFamily = style.fontFamily || 'Inter';

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    
    const metrics = ctx.measureText(text);
    return metrics.width;
};

/**
 * Calculates the bounding box for a multi-line caption block.
 */
export const calculateBlockBounds = (lines, activeStyle) => {
    let maxWidth = 0;
    let totalHeight = 0;

    lines.forEach((line) => {
        const width = measureTextWidth(line, activeStyle);
        if (width > maxWidth) maxWidth = width;
        totalHeight += activeStyle.fontSize * 1.2; // Including leading/line-height
    });

    return { width: maxWidth, height: totalHeight };
};
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

export const burnSubtitles = (inputVideoPath, assFilePath, outputVideoPath) => {
    return new Promise((resolve, reject) => {
        
        // Windows requires escaping the backslashes in the absolute path for the FFmpeg filter
        const escapedAssPath = assFilePath.replace(/\\/g, '\\\\').replace(/:/g, '\\:');

        ffmpeg(inputVideoPath)
            // Use the video filter to burn the Advanced SubStation Alpha file
            .videoFilters(`subtitles='${escapedAssPath}'`)
            .outputOptions([
                '-c:v libx264',    // Standard widely-supported video codec
                '-preset fast',    // Balance between encoding speed and file size
                '-crf 23',         // Constant Rate Factor (Quality) - 23 is a solid default
                '-c:a copy'        // Copy the original audio track without re-encoding it
            ])
            .output(outputVideoPath)
            .on('start', (commandLine) => {
                console.log('[Render Started] FFmpeg Command:', commandLine);
            })
            .on('progress', (progress) => {
                // In a production app, you'd send this to the frontend via WebSockets
                console.log(`[Render Progress] ${Math.round(progress.percent || 0)}% done`);
            })
            .on('end', () => {
                console.log('[Render Complete] Video exported successfully.');
                resolve(outputVideoPath);
            })
            .on('error', (err) => {
                console.error('[Render Error] Failed to burn subtitles:', err);
                reject(err);
            })
            .run();
    });
};
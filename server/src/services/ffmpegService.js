import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';

// CRITICAL WINDOWS FIX: Explicitly tell fluent-ffmpeg where the engine is
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const extractOptimizedAudio = (videoPath) => {
    return new Promise((resolve, reject) => {
        const audioPath = videoPath.replace(path.extname(videoPath), '.mp3');

        ffmpeg(videoPath)
            .noVideo() 
            .audioChannels(1) 
            .audioFrequency(16000) 
            .audioBitrate('32k') 
            .output(audioPath)
            .on('end', () => resolve(audioPath))
            .on('error', (err) => {
                console.error('[FFmpeg Process Error]', err);
                reject(err);
            })
            .run();
    });
};

// NEW: The Final Render Engine
export const renderFinalVideo = (inputVideoPath, subtitleFilePath, outputVideoPath) => {
    return new Promise((resolve, reject) => {
        
        // We must escape the path for FFmpeg filters to work correctly, especially on Windows
        const escapedSubtitlePath = subtitleFilePath.replace(/\\/g, '/').replace(/:/g, '\\:');

        console.log(`Starting final render. Burning ${escapedSubtitlePath} into ${inputVideoPath}...`);

        ffmpeg(inputVideoPath)
            // The 'ass' or 'subtitles' filter burns the text directly into the video stream
            .videoFilters(`ass='${escapedSubtitlePath}'`)
            // Copy the original audio so we don't lose it
            .outputOptions([
                '-c:a copy', // Copy original audio codec
                '-c:v libx264', // Ensure standard H.264 video output
                '-preset fast', // Encoding speed
                '-crf 22' // Quality (lower is better, 18-28 is standard)
            ])
            .output(outputVideoPath)
            .on('start', (commandLine) => {
                console.log('Spawned FFmpeg with command: ' + commandLine);
            })
            .on('end', () => {
                console.log('Final video successfully rendered!');
                resolve(outputVideoPath);
            })
            .on('error', (err) => {
                console.error('[FFmpeg Render Error]', err);
                reject(err);
            })
            .run();
    });
};
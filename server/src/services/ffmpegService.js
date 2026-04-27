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
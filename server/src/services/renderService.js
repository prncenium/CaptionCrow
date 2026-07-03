import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always point fluent-ffmpeg at the bundled binary (works on all platforms)
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// ── Probe original video for bitrate + resolution ───────────────────────────
const probeVideo = (videoPath) =>
  new Promise((resolve) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.warn('[FFprobe] Could not probe video, falling back to CRF mode:', err.message);
        resolve({ bitrate: 0, width: 0, height: 0 });
        return;
      }
      const vStream = metadata.streams?.find((s) => s.codec_type === 'video');
      // Prefer stream-level bitrate; fall back to container-level
      const bitrate = parseInt(vStream?.bit_rate || metadata.format?.bit_rate || 0, 10);
      const width = parseInt(vStream?.width || 0, 10);
      const height = parseInt(vStream?.height || 0, 10);
      console.log(`[FFprobe] Detected video bitrate: ${Math.round(bitrate / 1000)} kbps, resolution: ${width}x${height}`);
      resolve({ bitrate, width, height });
    });
  });

// ── Main render function ─────────────────────────────────────────────────────
export const burnSubtitles = async (inputVideoPath, assFilePath, outputVideoPath) => {

  // 1. Detect the original video's bitrate + resolution
  const { bitrate, width, height } = await probeVideo(inputVideoPath);
  if (width > 0 && height > 0) {
    console.log(`[Render] Preserving native input resolution: ${width}x${height} (no downscale — e.g. 4K in stays 4K out).`);
  }

  // 2. Build encoding options that match original quality
  //    If probe succeeded → use the exact bitrate (same quality, similar file size)
  //    If probe failed    → fall back to CRF 16 (very high quality)
  const encodeOptions = [
    '-c:v libx264',
    '-preset medium',
    '-movflags +faststart',
    '-c:a copy',          // never re-encode audio
  ];

  if (bitrate > 0) {
    const kbps    = Math.round(bitrate / 1000);
    const maxKbps = Math.round(kbps * 1.5);  // allow short bursts up to 1.5×
    const bufKbps = kbps * 2;
    encodeOptions.push(`-b:v ${kbps}k`);
    encodeOptions.push(`-maxrate ${maxKbps}k`);
    encodeOptions.push(`-bufsize ${bufKbps}k`);
    console.log(`[Render] Encoding at original bitrate: ${kbps} kbps`);
  } else {
    encodeOptions.push('-crf 16');
    console.log('[Render] Bitrate unknown — encoding with CRF 16 (high quality fallback)');
  }

  // 3. Escape ASS path for FFmpeg filter string (Windows-safe)
  const normalizedAssPath = path.resolve(assFilePath).replace(/\\/g, '/');
  const escapedAssPath    = normalizedAssPath.replace(/:/g, '\\:').replace(/ /g, '\\ ');
  const fontsDir          = path.resolve('./fonts').replace(/\\/g, '/').replace(':', '\\:');

  // 4. Run FFmpeg
  return new Promise((resolve, reject) => {
    ffmpeg(inputVideoPath)
      .videoFilters([
        // Explicit no-op scale (output = input pixel dimensions) so the encode
        // resolution is a guaranteed match to the source, not just "whatever
        // ffmpeg defaults to" — a 4K input must stay 4K, never get downscaled.
        'scale=iw:ih',
        // Keep original frame rate — do NOT force fps=60 (doubles file size)
        'format=yuv420p',
        `ass='${escapedAssPath}':fontsdir='${fontsDir}'`,
      ])
      .outputOptions(encodeOptions)
      .output(outputVideoPath)
      .on('start', (cmd) => console.log('[Render Started] FFmpeg command:', cmd))
      .on('end', ()  => {
        console.log('[Render] Complete:', outputVideoPath);
        resolve(outputVideoPath);
      })
      .on('error', (err) => {
        console.error('[Render Error]', err.message);
        reject(err);
      })
      .run();
  });
};

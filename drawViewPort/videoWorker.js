import { config } from '../Config.js';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { drawViewPort } from './drawView.js';
import { parentPort, workerData } from 'worker_threads';

const { outputPath } = workerData;

const ffmpeg = spawn(ffmpegPath, [
    '-y',
    '-loglevel', 'error',
    '-f', 'rawvideo',
    '-pix_fmt', 'rgba',
    '-s', `${config.killCamResolution}x${config.killCamResolution}`,
    '-r', '20',
    '-i', 'pipe:0',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '32',
    '-pix_fmt', 'yuv420p',
    '-movflags', 'faststart',
    outputPath
]);

ffmpeg.stderr.on('data', data => console.error('[ffmpeg]', data.toString()));
ffmpeg.on('close', code => {
    if (code !== 0) console.error(`FFmpeg exited with code ${code}`);
    parentPort.postMessage('done');
});

parentPort.on('message', async msg => {
    if (msg.done) {
        ffmpeg.stdin.end();
        return;
    }

    const { snapshot, myPlayerId, frameIndex } = msg;

    try {
        const buffer = await drawViewPort(snapshot, snapshot.get(myPlayerId));
        if (!ffmpeg.stdin.write(buffer)) await new Promise(res => ffmpeg.stdin.once('drain', res));
        parentPort.postMessage({ frameIndex });
    } catch (err) {
        console.error('Frame generation error:', err);
    }
});

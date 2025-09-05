import fs from 'fs';
import os from 'node:os';
import path from 'node:path';
import player from 'play-sound';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isPlaying = false;

const playAudio = async (fileName = 'alarmsSessionSaver.mp3') => {
    if (isPlaying) return;

    const filePath = path.join(__dirname, fileName); 
    const platform = os.platform();

    if (!fs.existsSync(filePath)) {
        console.error("Audio file not found:", filePath);
        return;
    }

    if (platform === 'win32') {
        isPlaying = true;
        const wavFile = path.join(__dirname, 'temp_audio.wav');

        const ffmpegProcess = spawn(ffmpegPath, [
            '-y',
            '-i', filePath,
            wavFile
        ]);

        ffmpegProcess.on('exit', (code) => {
            const psProcess = spawn('powershell.exe', [
                '-c',
                `(New-Object Media.SoundPlayer "${wavFile}").PlaySync()`
            ], { stdio: 'inherit' });

            psProcess.on('exit', () => {
                fs.unlinkSync(wavFile);
                isPlaying = false;
            });
        });
    } else {
        isPlaying = true;
        const audioPlayer = player({ player: platform === "darwin" ? "afplay" : 'mpg123' });

        audioPlayer.play(filePath, (err) => {
            if (err) {
                console.error("Playback failed:", err);
            }
            isPlaying = false;
        });
    }
};

export { playAudio };

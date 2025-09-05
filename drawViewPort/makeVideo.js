import path from 'path';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import { Worker } from 'worker_threads';
import { AttachmentBuilder } from 'discord.js';
import { webhookClient } from "../utils/Webhook.js";

let isMaking = false;
let startedGeneration = Date.now();
const MAX_DISCORD_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
const sleep = ms => new Promise(res => setTimeout(res, ms));

async function makeVideo(snapshots, myPlayerId) {
    if (!webhookClient) return console.log("Webhook not set up.");
    if (isMaking) return console.log("Video already being generated.");

    const tempDir = path.join(tmpdir(), `frames-${Math.random().toString(36).slice(2,10)}`);
    await fs.mkdir(tempDir, { recursive: true });
    const outputPath = path.join(tempDir, 'output.mp4');

    try {
        const worker = new Worker(new URL('./videoWorker.js', import.meta.url), {
            workerData: { outputPath }
        });

        worker.on('error', err => { throw err; });
        worker.on('exit', code => {
            if (code !== 0) console.error(`Worker exited with code ${code}`);
        });

        isMaking = true;
        startedGeneration = Date.now();

        for (let i = 0; i < snapshots.length; i++) {
            await new Promise(resolve => {
                worker.once('message', msg => {
                    if (msg.frameIndex === i) resolve();
                });
                worker.postMessage({ snapshot: snapshots[i], myPlayerId, frameIndex: i });
            });
            console.log(`[FRAME] ${i}/${snapshots.length}`);
            await sleep(50);
        }

        worker.postMessage({ done: true });

        console.log(`Frame generation completed in ${((Date.now() - startedGeneration) / 1000).toFixed(3)}seconds`);

        startedGeneration = Date.now();

        await new Promise(resolve => worker.once('message', msg => {
            if (msg === 'done') resolve();
        }));

        console.log(`Video generation completed in ${((Date.now() - startedGeneration) / 1000).toFixed(3)}seconds`);

        const buffer = await fs.readFile(outputPath);

        if (buffer.length > MAX_DISCORD_FILE_SIZE) {
            console.log(`File size is too big, you can find the video in ${outputPath}`);
        } else {
            const attachment = new AttachmentBuilder(buffer, { name: 'killcam.mp4' });
            await webhookClient.send({ 
                username: "Skk",
                files: [attachment],
                content: 'Here is how you died.',  
                avatarURL: "https://cdn.wallpapersafari.com/64/11/WkyqrX.jpg", 
            });
        }
    } catch (err) {
        console.error('Error creating or sending video:', err);
    } finally {
        try {
            const files = await fs.readdir(tempDir);
            await Promise.all(files.map(f => fs.unlink(path.join(tempDir, f))));
            await fs.rmdir(tempDir);
        } catch (cleanupErr) {
            console.error('Error cleaning temp directory:', cleanupErr);
        }
        isMaking = false;
    }
}

export { makeVideo };

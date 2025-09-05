import { config } from "../Config.js";
import { playAudio } from "../utils/Alarms.js";
import { makeVideo } from "../drawViewPort/makeVideo.js";

const processedStash = new Set();

const KILL_CAM_PERCENTAGE = 30;
const STASH_HEALTH_PERCENTAGE = 100;
const KILL_CAM_COOLDOWN_TICKS = config.killCamLength * 320;

function recordVideo(building) {
    if (building.model !== 'GoldStash') return;

    const percentage = (building.health / building.maxHealth) * 100;

    // Stash hit alarms
    if (percentage < STASH_HEALTH_PERCENTAGE && this.scripts.stashHealthAlarm) {
        playAudio();
    }
    // Kill cam logic
    if (processedStash.has(building.uid)) return;

    if (percentage <= KILL_CAM_PERCENTAGE) { 
        // get video of (killCam length)/10 seconds before the incident
        this.waitTicks(config.killCamLength * 2, () => makeVideo(structuredClone(this.snapShots), this.myPlayer.uid));

        // mark this stash as processed
        processedStash.add(building.uid);

        // reset after cooldown
        this.waitTicks(Math.max(200, KILL_CAM_COOLDOWN_TICKS), () => {
            processedStash.delete(building.uid);
        });
    }
}

function killCam() {
    if (this.killCamEvent) return;
    
    this.killCamEvent = true;
    this.emitter.on('buildingHealth', building => recordVideo.call(this, building));
}

export { killCam };

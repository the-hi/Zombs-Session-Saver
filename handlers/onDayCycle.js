import { CLIENT_OPCODES } from '../Start.js';

function onDayCycle(data) {
    this.syncNeeds.dayCycle = data;

    if (!this.myPlayer.uid) return;
    if (!this.scripts.scoreLogs) return;

    // score logs
    if (!data.response.isDay) {
        const newScore = this.myPlayer.score;
        const spw = newScore - this.lastScore;

        this.lastScore = newScore;
        !this.lastWave && (this.lastWave = 0);

        if (this.myPlayer.wave !== 0 && this.lastWave !== this.myPlayer.wave) {
            // partially add the data for calculating aspw, hspw
            this.syncNeeds.scoreLogs.push([this.myPlayer.wave, this.myPlayer.score, spw]);

            const highestSpw = this.syncNeeds.scoreLogs.reduce((max, row) => Math.max(max, row[2]), 0);
            const aspw = this.syncNeeds.scoreLogs.slice(-20).reduce((sum, row) => sum + row[2], 0) / Math.min(this.syncNeeds.scoreLogs.length, 20);
            // add full data 
            const entry = [this.myPlayer.wave, Math.floor(this.myPlayer.score), Math.floor(spw), Math.floor(aspw), Math.floor(highestSpw)];
            const lastIndex = this.syncNeeds.scoreLogs.length - 1;
            this.syncNeeds.scoreLogs[lastIndex] = entry;
            // broadcast to client
            this.broadCastPacket(CLIENT_OPCODES.SCORE_LOGS, [
                ...new TextEncoder().encode(JSON.stringify({ wave: entry[0], score: entry[1], spw: entry[2], aspw: entry[3], highestSpw: entry[4] }))
            ])
        }

        this.lastWave = this.myPlayer.wave;
    }
}

export { onDayCycle };
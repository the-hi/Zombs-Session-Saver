const ZOMBIES_STOP_SPAWN_SECONDS = 19;
const ZOMBIES_START_SPAWN_SECONDS = 0;

function playerTrick() {
    if (!this.scripts.playerTrick || !this.scripts.playerTrickPsk) return;
    
    if (!this.syncNeeds.dayCycle.response.isDay) {
        const psk = this.syncNeeds.psk.response.partyShareKey;
        const timePassedSinceStart = (this.ticks - this.syncNeeds.dayCycle.response.cycleStartTick) / 20;
        
        if (timePassedSinceStart > ZOMBIES_STOP_SPAWN_SECONDS) {
            if (this.scripts.playerTrickType === 'normal') {
                if (this.scripts.playerTrickPsk === psk) this.sendRpc({ name: "LeaveParty" });
                return;
            }
            if (this.scripts.playerTrickPsk !== psk) this.sendRpc({ name: "JoinPartyByShareKey", partyShareKey: this.scripts.playerTrickPsk });
        } else if(timePassedSinceStart > ZOMBIES_START_SPAWN_SECONDS && timePassedSinceStart < ZOMBIES_STOP_SPAWN_SECONDS) {
            if (this.scripts.playerTrickType === 'normal') {
                if (psk !== this.scripts.playerTrickPsk) this.sendRpc({ name: "JoinPartyByShareKey", partyShareKey: this.scripts.playerTrickPsk });
                return;
            }
            if (psk === this.scripts.playerTrickPsk) this.sendRpc({ name: "LeaveParty" });
        }
    }
};

export { playerTrick };
import { CLIENT_OPCODES } from "../Start.js";

function autoAim() {
    if (!this.scripts.autoAim) return;

    if (this.ticks) {
        const nearestEnemy = this.getNearestEnemy(this.scripts.autoAimTarget);
        if (!nearestEnemy) return;
        /*
        const lastTick = this.snapShots[this.snapShots.length - 2];
        const lastTickEnemy = lastTick.get(nearestEnemy.uid);
        if (!lastTickEnemy) return;

        const dx = nearestEnemy.position.x - lastTickEnemy.x;
        const dy = nearestEnemy.position.y - lastTickEnemy.y;
        
        const predictedPosition = {
            x: nearestEnemy.position.x + dx * 8,
            y: nearestEnemy.position.y + dy * 8
        }*/

        if (this.nearestDist <= this.scripts.autoAttackDistance) {
            const angle = this.getAngleTo(nearestEnemy.position);

            this.angle = angle;
            this.sendInput({ mouseMoved: angle });
            this.broadCastPacket(CLIENT_OPCODES.SYNC_AIM, [...new TextEncoder().encode(angle)])
        }
    }
};

export { autoAim };
const POSITION_LOCK_DISTANCE_THRESHOLD = 48;

function positionLock() {
    if (!this.scripts.positionLock) return;

    if (this.getDistance(this.scripts.lockAt) > POSITION_LOCK_DISTANCE_THRESHOLD) {
        const yaw = Math.round(this.getAngleTo(this.scripts.lockAt) / 45) * 45 % 360
        const movementPacket = this.getMovementPacket(yaw);
        this.sendInput(movementPacket);
    } else {
        this.sendInput({ up: 0, down: 0, right: 0, left: 0 });
    }
}
export { positionLock }
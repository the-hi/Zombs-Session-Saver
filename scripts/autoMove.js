const AUTO_MOVE_TOLERANCE = 24;
function autoMove() {
    if (!this.scripts.autoMove) return;
    if (this.scripts.autoMovePoints.length === 0) return;

    const targetPosition = this.scripts.autoMovePoints[0];
    if (this.getDistance(targetPosition) > AUTO_MOVE_TOLERANCE) {
        const yaw = Math.round(this.getAngleTo(targetPosition) / 45) * 45 % 360
        const movementPacket = this.getMovementPacket(yaw);
        this.sendInput(movementPacket);
    } else {
        this.scripts.autoMovePoints.push(this.scripts.autoMovePoints.shift())
    }
};

export { autoMove };
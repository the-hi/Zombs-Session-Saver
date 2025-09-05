function autoFollow() {
    if (!this.scripts.autoFollow) return;

    const nearestEnemy = this.getNearestEnemy();
    if (!nearestEnemy) return;
    // last tick of the entity
    const lastTick = this.snapShots[this.snapShots.length - 2];
    const lastTickEnemy = lastTick.get(nearestEnemy.uid);
    // if the entity wasnt in the last tick then dont auto follow
    if (!lastTickEnemy) return;
    const displacement = Math.hypot(lastTickEnemy.x - nearestEnemy.position.x, lastTickEnemy.y - nearestEnemy.position.y);

    if (displacement < 10 && this.nearestDist <= 55) {
        this.sendInput({ up: 0, down: 0, right: 0, left: 0 })
        return;
    };

    this.yaw = this.nearestDist > 50 ? Math.round(this.getAngleTo(nearestEnemy.position) / 45) * 45 % 360 : nearestEnemy?.yaw;

    const movementPacket = this.getMovementPacket(this.yaw);
    this.sendInput(movementPacket);
};

export { autoFollow };
function autoAttack() {
    if (!this.scripts.autoAttack) return;

    this.getNearestEnemy(this.scripts.autoAimTarget);

    if (this.nearestDist > this.scripts.autoAttackDistance) {
        if (this.wasAttacking) {
            this.wasAttacking = false;
            this.sendInput({ mouseUp: 1 })
        }
    };
    
    if (this.nearestDist > this.scripts.autoAttackDistance) return;

    if (this.ticks % Math.floor(1000 / this.myPlayer.msBetweenFires)) {
        if (this.myPlayer.weaponName === 'Bow') {
            this.sendInput({ space: 0 })
            this.sendInput({ space: 1 })
        } else {
            this.wasAttacking = true;
            if (Math.abs(this.ticks - this.myPlayer.firingTick) > Math.ceil(1000 / this.myPlayer.msBetweenFires) + 2) {
                this.sendInput({ mouseDown: this.angle ?? this.myPlayer.aimingYaw });
            }
        }
    }
};

export { autoAttack }
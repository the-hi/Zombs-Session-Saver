const processedTowers = new Set();

const MAX_UPGRADE_DISTANCE = 768;
const AUTO_UPGRADE_COOLDOWN_TICKS = 10;

function autoUpgrade() {
    if (!this.myStash || !this.scripts.autoUpgrade) return;

    this.missingAutoUpgradeBuildings.forEach(building => {
        if (processedTowers.has(building.uid)) return;
        // if the tower is supposed to be upgraded to the stash tier then dont delay upgrades
        const originalBuilding = this.autoUpgradeBuildings.get(`${building.x - this.myStash.x},${building.y - this.myStash.y},${building.type}`);
        if (this.getDistance(building) < MAX_UPGRADE_DISTANCE && (originalBuilding.tier === this.myStash.tier ? 20 : this.ticks + this.bumpUp) % 20 === 0) {
            // add the building to a set so multiple alts dont autoUpgrade if the building tier is lower than stash tier
            if (originalBuilding.tier !== this.myStash.tier) {
                processedTowers.add(building.uid)
                this.waitTicks(AUTO_UPGRADE_COOLDOWN_TICKS, () => processedTowers.delete(building.uid))
            }
            // upgrade the building
            this.upgradeBuilding(building.uid)
        }
    })
};

export { autoUpgrade };

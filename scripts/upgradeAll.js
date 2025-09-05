const MAX_STASH_TIER = 8;
const MAX_UPGRADE_DISTANCE = 768;

function upgradeAll() {
    if (!this.myStash || !this.scripts.upgradeAll) return;

    if (this.ticks % 50 !== 0) return;
    
    this.buildings.forEach((building) => { // upgrade all towers and harvesters every 2.5 seconds.
        if (!building.type.includes("Tower") && !['Harvester', 'GoldStash', 'GoldMine'].includes(building.type)) return;

        if (this.getDistance(building) <= MAX_UPGRADE_DISTANCE && building.tier < MAX_STASH_TIER) {
            if (building.tier === this.myStash.tier && building.type !== 'GoldStash') return;

            this.upgradeBuilding(building.uid);
        }
    })
};

export { upgradeAll };
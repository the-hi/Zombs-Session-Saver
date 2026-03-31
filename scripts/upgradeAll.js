const MAX_STASH_TIER = 8;
const MAX_UPGRADE_DISTANCE = 768;

const stashCosts = [0, 5000, 10000, 16000, 20000, 32000, 100000, 400000];
const priority = ['GoldStash', "GoldMine", "Harvester", "MagicTower", "BombTower", "ArrowTower", "CannonTower", "MeleeTower", "Door", "Wall", "SlowTrap"];

function filterTowers() {
    // filter buildings that can be upgraded 
    const buildingsInRange = [];
    this.buildings.forEach((building) => {
        if (this.getDistance(building) <= MAX_UPGRADE_DISTANCE && building.tier < MAX_STASH_TIER) {
            // filter buildings out of range, max level buildings and if u dont have enough gold to upgrade stash;
            if (building.tier === this.myStash.tier && building.type !== 'GoldStash' && building.tier !== 8) return;
            if (building.type === 'GoldStash' && this.myPlayer.gold <= stashCosts[building.tier]) return;

            buildingsInRange.push(building);
        }
    })
    // filter buildings according to priority
    const sortedBuildings = buildingsInRange.sort((a, b) => {
        const priorityDiff = priority.indexOf(a.type) - priority.indexOf(b.type);

        if (priorityDiff === 0) return a.tier - b.tier;

        return priorityDiff;
    });
    return sortedBuildings;
}

function upgradeAll() {
    if (!this.myStash || !this.scripts.upgradeAll) return;

    if (this.ticks % 10 !== 0) return;

    const sortedBuildings = filterTowers.call(this);

    sortedBuildings.slice(0, 200).forEach(building => {
        this.upgradeBuilding(building.uid);
    })
};

export { upgradeAll };
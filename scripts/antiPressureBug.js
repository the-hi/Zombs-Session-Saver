const GRID_SIZE_PIXELS = 48;
const MAX_SELL_DISTANCE = 1152;
const BAND_START_DISTANCE = 240;

const inBand = (building, stash) => {
    const dist = Math.max(Math.abs(building.x - stash.x), Math.abs(building.y - stash.y));
    if (dist < BAND_START_DISTANCE) return false;

    const distFromStart = dist - BAND_START_DISTANCE;
    const bandNumber = Math.floor(distFromStart / GRID_SIZE_PIXELS);
    return bandNumber % 4 === 0 || bandNumber % 4 === 1;
}

const getBandBuildings = (buildings, stash) => {
    const bandBuildings = Array.from(buildings.values()).filter(building =>
        !["Harvester", "SlowTrap"].includes(building.type) && inBand(building, stash)
    );
    return bandBuildings;
}

function antiPressureBug() {
    this.wasSold ||= new Set();
    this.justSold ||= new Set();
    
    if (!this.myStash || !this.scripts.antiPressureBug) return;
    
    getBandBuildings(this.buildings, this.myStash).forEach(building => {
        if (!this.canSell) return; // return if the player doesnt have sell
        if (this.getDistance(building) > MAX_SELL_DISTANCE) return; // return if the player is too far

        // query the closest entity to the building assuming the enemy would be the closest entity to the building
        const nearestUid = this.SpatialHash.queryClosest(this.options.sessionId, building, 110);
        const nearestEnemy = this.enemies.get(nearestUid);

        if (!nearestEnemy) return;
        // sells towers if the enemy is either in the tower(for walls, door) or nearby(but still would need to put pressure on the building)
        // to trigger the APB.
        const width = ["Wall", "Door"].includes(building.type) ? 24 : 60;

        let inTower = true; // assume true until proven otherwise

        for (let i = Math.max(0, this.snapShots.length - 3); i < this.snapShots.length; i++) {
            const snapshot = this.snapShots[i];
            const player = snapshot.get(nearestEnemy.uid);
            if (!player || !this.checkInTower({ x: player.x, y: player.y }, building, width)) {
                inTower = false;
                break;
            }
        };

        // justSold and wasSold is to preventing instant replacement of the sold tower
        // this is to make it harder to pressure bug
        if (inTower && !this.justSold.has(`${building.x},${building.y}`)) {
            this.wasSold.add(`${building.x},${building.y}`);
            this.justSold.add(`${building.x},${building.y}`);

            this.sellBuilding(building.uid);

            this.waitTicks(200, () => this.justSold.delete(`${building.x},${building.y}`));
            this.waitTicks(1200, () => this.wasSold.delete(`${building.x},${building.y}`));
        }
    })
};

export { antiPressureBug };
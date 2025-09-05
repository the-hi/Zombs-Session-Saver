const MAX_PLACEMENT_DISTANCE = 576;
const PLACEMENT_PREVENTION_TICKS = 200;


function autoRebuild() {
    if (!this.myStash || !this.scripts.autoRebuild || this.missingAutoRebuildBuildings.size === 0) return;

    this.missingAutoRebuildBuildings.forEach(building => {
        const x = building.x + this.myStash.x;
        const y = building.y + this.myStash.y;

        if (this.getDistance({ x, y }) > MAX_PLACEMENT_DISTANCE) return;
        if (!this.enoughPartyMembers(building.type)) return;

        // if anti pressure bug is on and the tower was just sold due to pressure bug then dont instantly rebuild;
        if (this.scripts.antiPressureBug && this.justSold.has(`${x},${y}`)) return;
        // if the tower was sold due to anti pressure bug and theres a player close-by then dont rebuild.
        let canPlace = true;
        if (this.scripts.antiPressureBug && this.wasSold.has(`${x},${y}`)) {
            const width = ["Wall", "SlowTrap", "Door"].includes(building.type) ? 36 : 72;
            // the widths are tweaked a bit to make it harder to pressure bug
            const nearbyEntity = this.SpatialHash.queryClosest(this.options.sessionId, { x, y }, width);

            if (this.enemies.has(nearbyEntity)) canPlace = false;
        };
        // if theres a player nearby then dont rebuild towers sold by APB.
        if (!canPlace) {
            this.justSold.add(`${x},${y}`);
            this.waitTicks(PLACEMENT_PREVENTION_TICKS, () => this.justSold.delete(`${x},${y}`))
            return;
        };
        // if theres no players nearby and it wasnt sold by APB then rebuild(rebuild checks if the cells are unoccuped)
        this.makeBuilding(building.type, { x, y }, building.yaw);
    });
};

export { autoRebuild };
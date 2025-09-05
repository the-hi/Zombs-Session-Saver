import { playAudio } from "../utils/Alarms.js";

function onBuildingUpdate(data) {
    data.forEach(building => {
        const { uid, x, y, type, tier, dead } = building;

        if (!dead) {
            const stash = data.find(building => building.type == "GoldStash");
            if (stash) {
                this.myStash = stash;
            }

            const relX = x - this.myStash.x;
            const relY = y - this.myStash.y;
            const position = `${relX},${relY},${type}`;

            // prevents a zombs bug where you receive building upgrade updates after the building dies.
            /*
            Example:-
                Harvester upgraded to tier 1 {x: 10656, y: 2880, type: 'Harvester', dead: 0, uid: 1257322732} 
                Harvester upgraded to tier 2 {x: 10656, y: 2880, type: 'Harvester', dead: 0, uid: 1257322732} 
                Harvester died
                Harvester upgraded to tier 3 {x: 10656, y: 2880, type: 'Harvester', dead: 0, uid: 1257322732} 
            */
            if (!this.buildings.has(uid) && tier !== 1 && data.length === 1) {
                return;
            };

            this.buildings.set(uid, building);

            // If it's a stash, assign it and skip further processing to prevent auto building stash 
            if (type === 'GoldStash') return;

            if (type === 'Harvester') this.myHarvesters.set(uid, building);

            const target = this.autoUpgradeBuildings.get(position);

            if (target && tier < target.tier) {
                this.missingAutoUpgradeBuildings.set(uid, building);
            } else {
                this.missingAutoUpgradeBuildings.delete(uid);
            }

            if (this.missingAutoRebuildBuildings.has(position)) {
                this.missingAutoRebuildBuildings.delete(position);
            };
        } else {
            this.buildings.delete(uid);

            if (type === 'GoldStash') {
                this.myStash = undefined;
                this.lastStash = building;
                return;
            }

            if (this.scripts.towerDeathAlarm) {
                if (type.includes("Tower") || ["Harvester", "GoldMine"].includes(type)) {
                    playAudio();
                }
            }

            const stash = this.myStash ? this.myStash : this.lastStash;

            const relX = x - stash.x;
            const relY = y - stash.y;
            const position = `${relX},${relY},${type}`;

            if (this.myHarvesters.has(uid)) this.myHarvesters.delete(uid);

            // Add to missing rebuild list if the tower is in there
            if (this.autoRebuildBuildings.has(position)) {
                const { yaw } = this.autoRebuildBuildings.get(position);
                this.missingAutoRebuildBuildings.set(position, { x: relX, y: relY, type, yaw });
            }
        }
    });

    // Convert to an rpc
    this.syncNeeds.buildings = {
        name: "LocalBuilding",
        response: [...this.buildings.values()],
        opcode: 9
    };
}

export { onBuildingUpdate };

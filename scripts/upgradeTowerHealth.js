const processedTowers = new Set();
const UTH_HEALTH_PERCENTAGE = 30;
const MAX_UPGRADE_DISTANCE = 768;
const MAX_PLACEMENT_DISTANCE = 576;
const UTH_GLOBAL_COOLDOWN_TICKS = 5;
const REVERT_ENEMY_PROXIMITY_PIXELS = 192;

function upgradeTowerHealth() {
    if (!this.myStash || !this.scripts.upgradeTowerHealth) return;

    this.buildings.forEach(building => {
        const buildingEntity = this.entities.get(building.uid);

        if (!buildingEntity) return;
        const isEligible = this.getDistance(building) <= MAX_UPGRADE_DISTANCE && building.tier < this.myStash.tier; // bumpUp is to prevent all 4 sessions from upgrading at the same time.

        const { health, maxHealth, uid } = buildingEntity;

        if (isEligible && !processedTowers.has(uid)) { // uth
            if (health / maxHealth * 100 <= UTH_HEALTH_PERCENTAGE) {
                // add building to processedTowers
                processedTowers.add(uid)
                // upgrade the building.
                this.upgradeBuilding(uid)
                // delete the building uid from processedTowers
                this.waitTicks(UTH_GLOBAL_COOLDOWN_TICKS, () => processedTowers.delete(uid))
            }
        }

        if (!this.canSell) return; // return if the player doesnt have sell
        if (!this.enoughPartyMembers(building.type, true)) return;
        if (this.getDistance(building) > MAX_PLACEMENT_DISTANCE) return;
        if (!this.scripts.autoUpgrade) return; // revert, you need to have autoUpgrade enabled for revert to work.

        const _building = this.autoUpgradeBuildings.get(`${building.x - this.myStash.x},${building.y - this.myStash.y},${building.type}`);

        if (!_building) return;
            
        if (building.tier > _building.tier) {
            // query all nearby entities
            const nearbyEntities = this.SpatialHash.query(this.options.sessionId, building, REVERT_ENEMY_PROXIMITY_PIXELS);
            // if a enemy is there nearby then dont try revert
            let inProximity = false;
            nearbyEntities.forEach(uid => {
                const isEnemy = this.enemies.get(uid);
                if (!isEnemy) return;
                    
                inProximity = this.checkForCollision(isEnemy.position, building, REVERT_ENEMY_PROXIMITY_PIXELS);
            })
            // if no player in proximity then rebuild, wait 2 ticks cuz of some gay ass delay
            if (!inProximity) {
                this.sellBuilding(building.uid);
                // replace the building
                this.waitTicks(2, () => this.makeBuilding(building.type, building, buildingEntity.yaw));
            }
        }
    })
};

export { upgradeTowerHealth }
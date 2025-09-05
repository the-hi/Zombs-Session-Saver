import { CLIENT_OPCODES } from "../Start.js";

const PLAYER_AND_TOWER_COLLISION_PIXELS = 96;
const ANTI_BLOCK_ENEMY_PROXIMITY_PIXELS = 110;

function antiBlock() {
    if (this.enemies.size === 0 || !this.myStash || this.missingAutoRebuildBuildings.size === 0) return;

    let nearestDist = Infinity;
    let nearestCollidingEnemy = undefined;

    this.missingAutoRebuildBuildings.forEach(building => {
        if (!building.type.includes("Tower") && !["GoldMine", "GoldStash"].includes(building.type)) return;

        const x = building.x + this.myStash.x;
        const y = building.y + this.myStash.y;

        const nearbyEntities = this.SpatialHash.query(this.options.sessionId, building, ANTI_BLOCK_ENEMY_PROXIMITY_PIXELS);
        
        nearbyEntities.forEach(uid => {
            const isEnemy = this.enemies.get(uid);
            if (!isEnemy) return;

            const distanceFromPlayer = this.getDistance(isEnemy.position);
            const isColliding = this.checkForCollision(isEnemy.position, { x, y }, PLAYER_AND_TOWER_COLLISION_PIXELS);
        
            if (isColliding) {
                if (distanceFromPlayer < nearestDist) {
                    nearestDist = distanceFromPlayer;
                    nearestCollidingEnemy = isEnemy.position;
                }
            }
        })
    })

    if (nearestDist === Infinity) return;

    const weapon = nearestDist < 280 ? "Bomb" : "Bow";

    // equip weapon
    if (this.myPlayer.weaponName !== weapon) {
        if (!this.syncNeeds.inventory[weapon]) {
            this.buyItem(weapon, 1);
        } else {
            this.equipItem(weapon);
        }
    }

    // auto attack + auto aim
    const angle = this.getAngleTo(nearestCollidingEnemy);
    if (this.myPlayer.weaponName === 'Bow') {
        this.sendInput({ mouseMoved: angle });
        this.broadCastPacket(CLIENT_OPCODES.SYNC_AIM, [...new TextEncoder().encode(angle)])

        this.sendInput({ space: 0 });
        this.sendInput({ space: 1 });
    } else {
        this.sendInput({ mouseDown: angle });
        
        if (!this.attackingPlayer) {
            this.attackingPlayer = true;
            this.waitTicks(30, () => {
                this.attackingPlayer = false;
                this.sendInput({ mouseUp: 1 });
            })
        }
    }
};

export { antiBlock };
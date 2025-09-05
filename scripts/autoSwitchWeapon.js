const SPEAR_MAX_RANGE = 100;
const BOW_MINIMUM_RANGE = 300;
const BOMB_MINIMUM_RANGE = 100;

function autoSwitchWeapon() {
    if (!this.scripts.autoSwitchWeapon) return;

    const nearestEnemy = this.getNearestEnemy();
    if (!nearestEnemy) return; // if no enemy return

    const inventory = this.syncNeeds.inventory;

    if (this.nearestDist > BOW_MINIMUM_RANGE && this.myPlayer.weaponName !== "Bow" && inventory['Bow']) {
        this.equipItem("Bow");
    } else if (this.nearestDist <= BOW_MINIMUM_RANGE && this.nearestDist > BOMB_MINIMUM_RANGE && this.myPlayer.weaponName !== "Bomb" && inventory['Bomb']) {
        this.equipItem("Bomb");
    } else if (this.nearestDist <= SPEAR_MAX_RANGE && this.myPlayer.weaponName !== "Spear" && inventory['Spear']) {
        this.equipItem("Spear");
    }
};

export { autoSwitchWeapon };
const HEAL_SPELL_PRICE = 100;
const AUTO_HEAL_PERCENTAGE = 15;
const HEALTH_POT_COOLDOWN_TICKS = 10;

function autoHeal() {
    if (!this.scripts.autoHeal) return;

    if (this.myPlayer.dead) return;

    if (!this.syncNeeds.inventory["HealthPotion"] && this.myPlayer.gold >= HEAL_SPELL_PRICE) {
        this.buyItem("HealthPotion", 1);
    }

    if (this.myPlayer.health / this.myPlayer.maxHealth * 100 <= AUTO_HEAL_PERCENTAGE && !this.autoHealTimeout) { // at 15% health
        this.equipItem("HealthPotion");

        this.autoHealTimeout = true;

        this.waitTicks(HEALTH_POT_COOLDOWN_TICKS, () => {
            this.autoHealTimeout = false;
        })
    }
};

export { autoHeal };
const HEAL_TOWERS_PERCENTAGE = 30;
const TOWER_SPELL_COOLDOWN = 12000;
const MAX_TOWER_SPELL_DISTANCE = 1000;

function healTower(building) {
    if (!this.scripts.autoHealSpell) return;

    const isEligible = !this.healSpellTimeout && building.model.includes('Tower') && this.getDistance(building.position) <= MAX_TOWER_SPELL_DISTANCE;

    if (isEligible) { // check if entity is near enough
        const { health, maxHealth } = building;

        if (health / maxHealth * 100 <= HEAL_TOWERS_PERCENTAGE) {
            this.sendRpc({ name: "CastSpell", spell: "HealTowersSpell", x:  building.position.x, y: building.position.y, tier: 1 });
                
            this.healSpellTimeout = true;
            this.waitTicks(TOWER_SPELL_COOLDOWN, () => this.healSpellTimeout = false)
        }
    }
}

function autoHealSpell() {
    if (this.AHSevent) return;

    this.AHSevent = true;
    this.emitter.on('buildingHealth', building => healTower.call(this, building));
};

export { autoHealSpell };
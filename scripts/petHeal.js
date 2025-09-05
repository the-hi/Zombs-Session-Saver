const PET_HEAL_PERCENTAGE = 30;
function petHeal() {
    if (!this.scripts.petHeal) return;
    
    if (this.myPet && this.myPet.health / this.myPet.maxHealth * 100 <= PET_HEAL_PERCENTAGE) { // 30%
        this.buyItem("PetHealthPotion", 1);
        this.equipItem("PetHealthPotion");
    }
};

export { petHeal };
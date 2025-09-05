const petTiers = [9, 17, 25, 33, 49, 65, 97];
function petEvolve() {
    if (!this.scripts.petEvolve) return;

    if (this.myPet && petTiers.includes(this.myPet.experience / 100 + 1)) {
        this.buyItem(this.myPet.model, this.myPet.tier + 1);
    }
};

export { petEvolve };
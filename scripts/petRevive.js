function petRevive() {
    if (!this.scripts.petRevive) return;
    
    if (this.petActivated && this.myPlayer.petUid === 0) {
        this.buyItem("PetRevive", 1);
        this.equipItem("PetRevive");
    }
};

export { petRevive };
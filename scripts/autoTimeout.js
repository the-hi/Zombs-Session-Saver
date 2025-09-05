const TIMEOUT_PRICE = 10000;

function autoTimeout() {
    if (!this.myStash) return;
    if (!this.scripts.autoTimeout) return;
    
    if (!this.myPlayer.isPaused && this.myPlayer.gold >= TIMEOUT_PRICE && this.ticks % 2 === 0) {
       this.sendRpc({ name: "BuyItem", itemName: "Pause", tier: 1 });
    }
};

export { autoTimeout };
function onInventoryUpdate(data) {
    const itemName = data.response.itemName;
    this.syncNeeds.inventory[itemName] = data;

    if (!data.response.stacks) {
        delete this.syncNeeds.inventory[itemName];
    }
    
    if (itemName === "ZombieShield" && data.response.stacks) {
        this.equipItem("ZombieShield");
    }
};

export { onInventoryUpdate };
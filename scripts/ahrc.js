const harvesterTicks = [31, 29, 27, 24, 22, 20, 18, 16];

function ahrc() {
    if (!this.scripts.ahrc || !this.myStash) return;

    this.myHarvesters.forEach(harvester => {
        const { uid, tier } = harvester;
        const harvEntity = this.entities.get(uid);

        if (!harvEntity) return;

        const harvesterTick = this.ticks % harvesterTicks[tier - 1];

        if (harvesterTick === 1) this.sendRpc({ name: "CollectHarvester", uid });
        if (harvesterTick === 0) this.sendRpc({ name: "AddDepositToHarvester", uid, deposit: harvEntity.depositMax * 0.00025 });        
    })
};

export { ahrc };
import { config } from "../Config.js";
import { modelToNumber } from "../utils/Models.js";

const essentialAttributes = ["name","position", "tier", "yaw", "aimingYaw", "health", "model", "weaponName", "weaponTier"];

function onEntity(data) {
    data.entities.forEach((entity, key) => {
        const Zombie = this.zombies.get(key);
        const Player = this.players.get(key);
        const Entity = this.entities.get(key);

        if (!Entity) {
            this.entities.set(key, entity);

            if (entity.model.includes("Projectile")) return;
            if (entity.model === 'GamePlayer') this.players.set(key, entity);
            if (entity.model.startsWith('Zombie')) this.zombies.set(key, entity);
            
            const size = entity.collisionRadius !== 0 ? entity.collisionRadius : entity.width / 2;
            this.SpatialHash.addEntity(this.options.sessionId, entity.uid, entity.position, size);
        } else {
            for (const attribute in entity) {
                Entity[attribute] = entity[attribute];
                if (Player) Player[attribute] = entity[attribute];
                if (Zombie) Zombie[attribute] = entity[attribute];

                if (this.buildings.has(key)) {
                    if (attribute === 'health') {
                        this.emitter.emit('buildingHealth', Entity);
                    }
                }

                if (attribute === 'position' && !Entity.model.includes("Projectile")) {
                    this.SpatialHash.updateEntity(this.options.sessionId, key, entity[attribute]);
                }
            }
        }
    });

    this.entities.forEach(entity => {
        if (!data.entities.has(entity.uid)) {
            this.players.delete(entity.uid);
            this.zombies.delete(entity.uid);
            this.entities.delete(entity.uid);
            if (!entity.model.includes("Projectile")) this.SpatialHash.deleteEntity(this.options.sessionId, entity.uid);
        }
    })

    this.ticks = data.tick;
    this.myPlayer = this.entities.get(this.playerUid);
    this.myPet = this.entities.get(this.myPlayer.petUid);

    this.enemies = new Map(
        [...this.players.entries()].filter(([_, player]) => !player.dead && player.partyId !== this.myPlayer.partyId)
    );

    if (this.myPet) this.petActivated = true;
    
    if (this.tickCallBacks[this.ticks]) {
        this.tickCallBacks[this.ticks].forEach(callback_func => {
            callback_func.call(this);
        })
    }

    this.scriptFunctions.forEach((script_callback, key) => {
        if (this.options.type === 'filler') return; // if the session is a filler session, we don't need to do anything else
        
        try {
            if (script_callback) script_callback.call(this);
        } catch (err) {
            this.scriptFunctions.delete(key);
            console.log(`Error with module: ${key}, ${err}`)
        }
    })

    // Create a snapshot (the code is ass lmfao)
    const entityEssentials = new Map();

    structuredClone(this.entities).forEach(entity => {
        const _entity = {};
        for (let attribute in entity) {
             let property = entity[attribute]; 
             if (essentialAttributes.includes(attribute)) {
                if (attribute === "health") {
                    if (entity.maxHealth === entity.health) continue;

                    property = entity.health / entity.maxHealth;
                }
                if (attribute === "position") {
                    _entity.x = entity.position.x;
                    _entity.y = entity.position.y;
                    continue;
                }
                if (attribute === "tier" && entity.tier === 8) {
                    continue;
                }
                if (attribute === "yaw" && entity.model !== "MeleeTower" && entity.model.includes("Tower")) {
                    property = entity.towerYaw;
                }
                if (attribute === "yaw" && property === 0) continue;
                if (attribute === 'model') {
                    if (entity.model.includes("ZombieBoss")) {
                        entity.model = "ZombieBossTier1";  // if its a boss just assign it as tier 1
                    }
                    if (modelToNumber[entity.model]) {
                        property = modelToNumber[entity.model];
                    } else {
                        console.log(entity.model)
                    }
                };
                _entity[attribute] = property;
             }
        }
        entityEssentials.set(entity.uid, _entity);
    })

    this.snapShots.push(entityEssentials);
    if (this.snapShots.length > config.killCamLength * 20) {
        this.snapShots.shift(); // remove oldest snapshot
    };
};

export { onEntity };
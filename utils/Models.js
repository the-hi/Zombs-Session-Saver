const modelToNumber = { 
    "Stone": 1, 
    "Tree": 2, 
    "GamePlayer": 3,
    "NeutralTier1": 4,
    "NeutralCamp": 5, 
    "PetMiner": 6,
    "Wall": 7,
    "GoldMine": 8,
    "ArrowTower": 9,
    "MagicTower": 10,
    "CannonTower": 11,
    "BombTower": 12,
    "ArrowProjectile": 13,
    "BombProjectile": 14,
    "SlowTrap": 15,
    "Door": 16,
    "Harvester": 17,
    "GoldStash": 18,
    "CannonProjectile": 19,
    "FireballProjectile": 20,
    "BowProjectile": 21,
    "MeleeTower": 22,
    "ZombieBossTier1": 23, 
    "PetCARL": 24, 
    "HealTowersSpell": 25 
}

let num = 25;
["Blue", "Green", "Orange", "Purple", "Red", "Yellow"].forEach(color => {
    for(let i = 1; i < 11; i++) {
        modelToNumber[`Zombie${color}Tier${i}`] = ++num;
    }
})

const numberToModel =  Object.fromEntries(Object.entries(modelToNumber).map(([key, value]) => [value, key]));

export { numberToModel, modelToNumber };
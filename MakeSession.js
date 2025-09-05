import WebSocket from 'ws';
import { servers } from './ServerList.js';
import BinCodec from './utils/BinCodec.js';
import { onClose } from './handlers/onClose.js';
import { onMessage } from './handlers/onMessage.js';

const SESSIONS = new Map();

class Scripts {
    constructor() {
        return {
            ahrc: false,
            petHeal: true,
            autoHeal: true,
            autoAim: false,
            petEvolve: true,
            petRevive: true,
            autoAttack: false,
            upgradeAll: false,
            autoFollow: false,
            autoRespawn: false,
            autoRebuild: false,
            autoUpgrade: false,
            playerTrick: false,
            autoTimeout: false,
            autoHealSpell: false,
            autoReconnect: false,
            antiPressureBug: false,
            serverFullAlarm: false,
            towerDeathAlarm: false,
            disconnectAlarm: false,
            stashHealthAlarm: false,
            autoSwitchWeapon: false,
            autoAimTarget: 'player',
            upgradeTowerHealth: false,
            playerTrickType: 'normal',
            autoAttackDistance: Infinity,
            lockAt: { x: 12000, y: 12000 },
        }
    }
};

const SAFE_SESSION_LIMIT = 12;

class Session {
    constructor({ server = 'v1003', type = 'filler', psk = '', name = 'The_hi.', sessionName }) {
        this.options = { server, type, psk, name, sessionName };

        if (!servers[server]) return console.error(`Server ${server} not found`);
        if (SESSIONS.size === SAFE_SESSION_LIMIT) return console.error(`Reached maximum safe limit, Cant send more alts.`);

        this.hostname = servers[server].hostname;
        this.ipAddress = servers[server].ipAddress;
        this.ws = Object.assign(new WebSocket(`wss://${this.hostname}:443`, { headers: { "Origin": "", "User-Agent": "" } }), { binaryType: "arraybuffer" });


        this.myPlayer = {};
        this.snapShots = [];
        this.buildingInfo = {};
        this.tickCallBacks = {};
        this.players = new Map();
        this.zombies = new Map();
        this.clients = new Map();
        this.entities = new Map();
        this.buildings = new Map();
        this.codec = new BinCodec();
        this.scripts = new Scripts();
        this.myHarvesters = new Map();
        this.autoRebuildBuildings = new Map();
        this.autoUpgradeBuildings = new Map();
        this.missingAutoRebuildBuildings = new Map();
        this.missingAutoUpgradeBuildings = new Map();
        this.syncNeeds = { messages: [], inventory: {}, buildings: {} };

        this.ws.onerror = () => { }
        this.ws.onclose = onClose.bind(this);
        this.ws.onmessage = onMessage.bind(this);
    }

    broadCastPacket(opcode, packet, excludeId) {
        this.clients.forEach(client => {
            if (excludeId && client.id === excludeId) return;
            if (client.readyState === 1) client.sendPacket([opcode, ...packet]);
        })
    }

    sendPacket(event, data) {
        if (this.ws.readyState === 1) {
            this.ws.send(this.codec.encode(event, data));
        }
    }

    sendInput(data) {
        this.sendPacket(3, data);
    }

    sendRpc(data) {
        this.sendPacket(9, data);
    }

    upgradeBuilding(uid) {
        const building = this.buildings.get(uid);

        if (building) this.sendRpc({ name: "UpgradeBuilding", uid });
    }

    sellBuilding(uid) {
        this.sendRpc({ name: "DeleteBuilding", uid });
    }

    buyItem(itemName, tier) {
        this.sendRpc({ name: "BuyItem", itemName, tier });
    }

    equipItem(itemName) {
        const item = this.syncNeeds.inventory[itemName];
        if (item) {
            this.sendRpc({ name: "EquipItem", itemName, tier: item.response.tier });
        }
    }

    getMovementPacket(yaw) {
        const movementPacket = {
            up: +[0, 45, 315].includes(yaw),
            down: +[135, 180, 225].includes(yaw),
            right: +[45, 90, 135].includes(yaw),
            left: +[225, 270, 315].includes(yaw)
        };
        return movementPacket;
    }

    getMaxBuildingPerPlayer(type) {
        const buildingCount = {
            "Door": 40,
            "Wall": 250,
            "GoldMine": 8,
            "Harvester": 2,
            "SlowTrap": 12,
        }
        return buildingCount[type] || 6;
    }

    enoughPartyMembers(type, willDie) {
        const maxBuildingsPerPlayer = this.getMaxBuildingPerPlayer(type);
        const currentMaxBuildings = this.syncNeeds.partyInfo.response.length * (maxBuildingsPerPlayer);
        const currentBuildingCount = [...this.buildings.values()].filter(building => building.type === type).length;
        // check if theres enough players to place one more building.
        return ((currentBuildingCount + (willDie ? 0 : 1)) / currentMaxBuildings) <= 1;
    }

    makeBuilding(type, { x, y }, yaw) {
        const halfWidth = ["Wall", "SlowTrap", "Door"].includes(type) ? 24 : 48;

        const occupiedCells = this.SpatialHash.queryOccupiedCells(this.options.sessionId, { x,y }, halfWidth - 1);

        if (!occupiedCells) this.sendRpc({ name: "MakeBuilding", type, x, y, yaw });
    }

    checkForCollision(player, { x, y }, towerSize, radius = 27) {
        const half = towerSize / 2;
        const closestX = Math.max(x - half, Math.min(player.x, x + half));
        const closestY = Math.max(y - half, Math.min(player.y, y + half));

        const distance = Math.hypot(player.x - closestX, player.y - closestY);

        return distance <= radius;  // 27 is the collision radius
    }

    checkInTower(player, building, width) {
        const inTower = (
            player.x >= building.x - width &&
            player.x <= building.x + width &&
            player.y >= building.y - width &&
            player.y <= building.y + width
        );
        return inTower;
    }

    setBuildingTier() {
        if (!this.myStash) return;
        this.buildings.forEach(buildingData => {
            if (buildingData.type === 'GoldStash') return;

            this.autoUpgradeBuildings.set(`${buildingData.x - this.myStash.x},${buildingData.y - this.myStash.y},${buildingData.type}`, buildingData);
        });
    }

    setBuildings() {
        if (!this.myStash) return;
        this.buildings.forEach(buildingData => {
            if (buildingData.type === 'GoldStash') return;

            const entity = this.entities.get(buildingData.uid);

            buildingData.yaw = entity?.yaw || 0;
            this.autoRebuildBuildings.set(`${buildingData.x - this.myStash.x},${buildingData.y - this.myStash.y},${buildingData.type}`, buildingData);
        });
    }

    getNearestEnemy(target = 'players') {
        if (target !== 'players' && target !== 'zombies') return undefined;
        if (this.lastEnemyCheck === this.ticks) return this.nearestEnemy;

        let nearestDist = Infinity;
        let nearestEnemy = undefined;
        this[target === 'players' ? 'enemies' : target].forEach(entity => {
            if (entity.partyId === this.myPlayer.partyId || entity.dead) return;

            const distance = this.getDistance(entity.position);
            if (distance < nearestDist) {
                nearestDist = distance;
                nearestEnemy = entity;
            }
        });

        this.nearestDist = nearestDist;
        this.lastEnemyCheck = this.ticks;
        this.nearestEnemy = nearestEnemy;

        return this.nearestEnemy;
    }

    getDistance(entity) {
        const dx = this.myPlayer.position.x - entity.x;
        const dy = this.myPlayer.position.y - entity.y;
        return Math.hypot(dx, dy) | 0;
    }

    getAngleTo(entity) {
        return (Math.atan2(entity.y - this.myPlayer.position.y, entity.x - this.myPlayer.position.x) * 180 / Math.PI + 450) % 360 | 0;
    }

    waitTicks(ticks, callbackFunc) {
        const atTick = this.ticks + Math.ceil(ticks);

        this.tickCallBacks[atTick] ||= [];
        this.tickCallBacks[atTick].push(callbackFunc);
    }

    loadLb() {
        this.sendPacket(7, {});
        
        for (let i = 0; i < 26; i++) this.sendInput({ up: 1, left: 1 });
        this.ws.send(new Uint8Array([9, 6, 0, 0, 0, 126, 8, 0, 0, 108, 27, 0, 0, 146, 23, 0, 0, 82, 23, 0, 0, 8, 91, 11, 0, 8, 91, 11, 0, 0, 0, 0, 0, 32, 78, 0, 0, 76, 79, 0, 0, 172, 38, 0, 0, 120, 155, 0, 0, 166, 39, 0, 0, 140, 35, 0, 0, 36, 44, 0, 0, 213, 37, 0, 0, 100, 0, 0, 0, 120, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 134, 6, 0, 0]));
    }
};

setInterval(() => {
    if (global.gc) global.gc()
    for (const server in servers) {
        if (servers[server].BreakIn) {
            const { name, psk } = servers[server];
            new Session({ server, type: 'normal', name, psk });
        }
    }
}, 5000);

export { Session, SESSIONS };
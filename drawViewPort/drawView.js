import { config } from '../Config.js';
import { drawTower } from './drawTower.js';
import { drawZombie } from './drawZombie.js';
import { drawPlayer } from './drawPlayer.js';
import { drawNeutral } from './drawNeutral.js';
import { createCanvas, loadImage } from 'canvas';
import { drawHarvester } from './drawHarvester.js';
import { numberToModel } from '../utils/Models.js';

const modelToSvg = {
    'GamePlayer': 'player-base',
    'Tree': 'map-tree',
    'Stone': 'map-stone',
    'NeutralCamp': 'neutral-camp-base',
    'NeutralTier1': 'neutral-t1-base',
    'CannonProjectile': 'cannon-tower-projectile',
    'ArrowProjectile': 'arrow-tower-projectile',
    'BombProjectile': 'bomb-tower-projectile',
    'FireballProjectile': 'mage-tower-projectile',
    'BowProjectile': 'arrow-tower-projectile'
};

function worldToCanvasCoords(entity, mainPlayer, scale) {
    const dx = (entity.x - mainPlayer.x) * scale;
    const dy = (entity.y - mainPlayer.y) * scale;

    return {
        x: Math.round((config.killCamResolution / 2) + dx),
        y: Math.round((config.killCamResolution / 2) + dy),
    };
}

const drawPriority = [
    'GamePlayer',
    'PetMiner',
    'PetCARL',
    'Zombie',
    'Neutral',
    'Stone',
    'Tree',
];

const imageCache = new Map();

async function getImage(filePath) {
    if (imageCache.has(filePath)) {
        return imageCache.get(filePath);
    }
    const img = await loadImage(filePath);
    imageCache.set(filePath, img);
    return img;
}

const drawViewPort = async (entities, myPlayer) => {
    if (!entities || !myPlayer) return;

    const canvas = createCanvas(config.killCamResolution, config.killCamResolution);
    const ctx = canvas.getContext('2d');

    const scale = config.killCamResolution / (50 * 48); // 720 / 2400 = 0.3

    ctx.fillStyle = '#689040';
    ctx.fillRect(0, 0, config.killCamResolution, config.killCamResolution);

    const sortedEntities = Array.from(entities.values()).sort((a, b) => {
        if (numberToModel[a.model]) a.model = numberToModel[a.model];
        if (numberToModel[b.model]) b.model = numberToModel[b.model];

        const pa = drawPriority.includes(a.model.includes('Zombie') || a.model.includes('Neutral') ? 'Zombie' : a.model) ? drawPriority.indexOf(a.model) : Infinity;
        const pb = drawPriority.includes(b.model.includes('Zombie') || b.model.includes('Neutral') ? 'Zombie' : b.model) ? drawPriority.indexOf(b.model) : Infinity;
        return pb - pa;
    });

    for (const entity of sortedEntities) {
        if (typeof entity.model !== 'string') continue;
        if (entity.yaw === undefined) entity.yaw = 0;
        if (entity.tier === undefined) entity.tier = 8;
        if (entity.health === undefined) entity.health = 1;

        const { x, y } = worldToCanvasCoords(entity, myPlayer, scale);

        if (entity.model.includes("Tower")) {
            await drawTower(ctx, entity, x, y, scale);
            continue;
        }

        if (entity.model.includes("Zombie")) {
            await drawZombie(ctx, entity, x, y, scale);
            continue;
        }

        switch (entity.model) {
            case 'GamePlayer':
                await drawPlayer(ctx, entity, x, y, scale);
                break;
            case 'PetCARL':
                const carlBase = await getImage(`./pictures/pet-carl-t${entity.tier}-base.svg`);
                const carlWeapon = await getImage(`./pictures/pet-carl-t${entity.tier}-weapon.svg`);
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(entity.yaw * Math.PI / 180);
                ctx.drawImage(carlWeapon, -carlWeapon.width/2 * scale, -carlWeapon.height/2 * scale - 12 * scale, carlWeapon.width * scale, carlWeapon.height * scale);
                ctx.drawImage(carlBase, -carlBase.width/2 * scale, -carlBase.height/2 * scale, carlBase.width * scale, carlBase.height * scale);
                ctx.restore();
                break;
            case 'PetMiner':
                const woodyBase = await getImage(`./pictures/pet-miner-t${entity.tier}-base.svg`);
                const woodyWeapon = await getImage(`./pictures/pet-miner-t${entity.tier}-weapon.svg`);
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(entity.yaw * Math.PI / 180);
                ctx.drawImage(woodyWeapon, -woodyWeapon.width/2 * scale, -woodyWeapon.height/2 * scale - 12 * scale, woodyWeapon.width * scale, woodyWeapon.height * scale);
                ctx.drawImage(woodyBase, -woodyBase.width/2 * scale, -woodyBase.height/2 * scale, woodyBase.width * scale, woodyBase.height * scale);
                ctx.restore();
                break;
            case 'Harvester':
                await drawHarvester(ctx, entity, x, y, scale);
                break;
            case 'NeutralTier1':
                await drawNeutral(ctx, entity, x, y, scale);
                break;
            case 'Door':
                const doorImg = await getImage(`./pictures/door-t${entity.tier}-base.svg`);
                ctx.drawImage(doorImg, x - doorImg.width/2 * scale, y - doorImg.height/2 * scale, doorImg.width * scale, doorImg.height * scale);
                break;
            case 'GoldMine':
                const mineBase = await getImage(`./pictures/gold-mine-t${entity.tier}-base.svg`);
                const mineHead = await getImage(`./pictures/gold-mine-t${entity.tier}-head.svg`);
                ctx.drawImage(mineBase, x - mineBase.width/2 * scale, y - mineBase.height/2 * scale, mineBase.width * scale, mineBase.height * scale);
                ctx.drawImage(mineHead, x - mineHead.width/2 * scale, y - mineHead.height/2 * scale, mineHead.width * scale, mineHead.height * scale);
                break;
            case 'GoldStash':
                const stashImg = await getImage(`./pictures/gold-stash-t${entity.tier}-base.svg`);
                ctx.drawImage(stashImg, x - stashImg.width/2 * scale, y - stashImg.height/2 * scale, stashImg.width * scale, stashImg.height * scale);
                break;
            case 'SlowTrap':
                const slowTrapImg = await getImage(`./pictures/slow-trap-t${entity.tier}-base.svg`);
                ctx.drawImage(slowTrapImg, x - slowTrapImg.width/2 * scale, y - slowTrapImg.height/2 * scale, slowTrapImg.width * scale, slowTrapImg.height * scale);
                break;
            case 'Wall':
                const wallImg = await getImage(`./pictures/wall-t${entity.tier}-base.svg`);
                ctx.drawImage(wallImg, x - wallImg.width/2 * scale, y - wallImg.height/2 * scale, wallImg.width * scale, wallImg.height * scale);
                break;
        }

        if (['Wall','SlowTrap','GoldStash','GoldMine','Door','Harvester'].includes(entity.model) && entity.health < 1) {
            const barSettings = {
                GoldStash: { width: 88, height: 15, offsetY: 26 },
                GoldMine: { width: 88, height: 15, offsetY: 26 },
                Harvester: { width: 88, height: 15, offsetY: 26 },
                Wall: { width: 35, height: 10, offsetY: 15 },
                Door: { width: 35, height: 10, offsetY: 15 },
                SlowTrap: { width: 35, height: 10, offsetY: 15 },
            };
            const { width, height, offsetY } = barSettings[entity.model];
            const filledWidth = Math.max(0, (width * scale) * entity.health);

            ctx.save();
            ctx.translate(x - (width/2)*scale, y + offsetY*scale);
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, width*scale, height*scale);
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(0, 0, filledWidth, height*scale);
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, width*scale, height*scale);
            ctx.restore();
        }

        if (modelToSvg[entity.model]) {
            const baseImg = await getImage(`./pictures/${modelToSvg[entity.model]}.svg`);
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(entity.yaw * Math.PI / 180);
            ctx.drawImage(baseImg, -baseImg.width/2*scale, -baseImg.height/2*scale, baseImg.width*scale, baseImg.height*scale);
            ctx.restore();
        }
    }

    return canvas.toBuffer('raw');
};

export { getImage, drawViewPort };

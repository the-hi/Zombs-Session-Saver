import { config } from '../Config.js';
import { getImage } from "./drawView.js";

async function drawZombie(ctx, entity, x, y, scale = 720 / config.killCamResolution) {
    const zombie = `zombie-${entity.model.split("Tier")[0].replace("Zombie", "").toLowerCase()}-t${entity.model.includes('ZombieBossTier') ? 1 : entity.model.split("Tier")[1]}`;
    const zombieBase = await getImage(`./pictures/${zombie}-base.svg`);
    const zombieWeapon = await getImage(`./pictures/${zombie}-weapon.svg`);

    ctx.save();
    ctx.translate(x, y);
    const radians = entity.yaw * Math.PI / 180;
    ctx.rotate(radians);

    ctx.drawImage(
        zombieWeapon,
        -zombieWeapon.width / 2 * scale,
        -zombieWeapon.height * scale,
        zombieWeapon.width * scale,
        zombieWeapon.height * scale
    );

    ctx.drawImage(
        zombieBase,
        -zombieBase.width / 2 * scale,
        -zombieBase.height / 2 * scale,
        zombieBase.width * scale,
        zombieBase.height * scale
    );
    ctx.restore();

    const barWidth = zombieBase.width * scale;
    const barHeight = 6 * scale;
    const filledWidth = Math.max(0, barWidth * entity.health);

    const barX = x;
    const barY = y + zombieBase.height / 2 * scale + 10 * scale;

    ctx.save();
    ctx.translate(barX, barY);

    ctx.fillStyle = '#222';
    ctx.fillRect(-barWidth / 2, 0, barWidth, barHeight);

    ctx.fillStyle = '#f44336';
    ctx.fillRect(-barWidth / 2, 0, filledWidth, barHeight);

    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(-barWidth / 2, 0, barWidth, barHeight);

    ctx.restore();
}

export { drawZombie };

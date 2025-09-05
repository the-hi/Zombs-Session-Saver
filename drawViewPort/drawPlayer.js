import { config } from '../Config.js';
import { getImage } from './drawView.js';

const drawPlayer = async (ctx, entity, x, y, scale = config.killCamResolution / 2400) => {
    const spriteSize = 48 * scale;

    const nameOffset = 1.2 * spriteSize;
    const healthBarOffset = 1.6 * spriteSize;

    ctx.save();
    ctx.font = `bold ${25 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 2 * scale;
    ctx.strokeStyle = 'rgb(51,51,51)';
    ctx.strokeText(entity.name, x, y - nameOffset);
    ctx.fillStyle = 'rgb(220,220,220)';
    ctx.fillText(entity.name, x, y - nameOffset);
    ctx.restore();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((entity.aimingYaw * Math.PI) / 180);

    const weaponPath = `./pictures/player-${entity.weaponName.toLowerCase()}-t${entity.weaponTier}.svg`;
    const weaponImg = await getImage(weaponPath);

    ctx.drawImage(
        weaponImg,
        -weaponImg.width / 2 * scale,
        -weaponImg.height * scale, 
        weaponImg.width * scale,
        weaponImg.height * scale
    );
    ctx.restore();

    const barWidth = spriteSize * 2; 
    const barHeight = 8 * scale;
    const filledWidth = Math.max(0, barWidth * entity.health);

    ctx.save();
    ctx.translate(x - barWidth / 2, y + healthBarOffset);
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, barWidth, barHeight);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(0, 0, filledWidth, barHeight);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(0, 0, barWidth, barHeight);
    ctx.restore();
};

export { drawPlayer };

import { config } from '../Config.js';
import { getImage } from './drawView.js';

async function drawHarvester(ctx, entity, x, y, scale = config.killCamResolution / 2400) {
    const baseImg = await getImage(`./pictures/cannon-tower-t${entity.tier}-base.svg`);
    const headImg = await getImage(`./pictures/harvester-t${entity.tier}-head.svg`);

    const yaw = (entity.yaw - 90) * Math.PI / 180;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(yaw);
    ctx.drawImage(
        baseImg,
        -baseImg.width / 2 * scale,
        -baseImg.height / 2 * scale,
        baseImg.width * scale,
        baseImg.height * scale
    );
    ctx.restore();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(yaw);
    
    const offsetX = -10 * scale;
    const offsetY = 0;
    ctx.translate(offsetX, offsetY);
    ctx.drawImage(
        headImg,
        -headImg.width / 2 * scale,
        -headImg.height / 2 * scale,
        headImg.width * scale,
        headImg.height * scale
    );
    ctx.restore();
}

export { drawHarvester };

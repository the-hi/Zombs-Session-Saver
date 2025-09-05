import { config } from '../Config.js';
import { getImage } from './drawView.js';

const drawNeutral = async (ctx, entity, x, y, scale = config.killCamResolution / 2400) => {
    const weaponImg = await getImage('./pictures/neutral-t1-weapon.svg');

    ctx.save();
    ctx.translate(x, y);

    const radians = entity.yaw * Math.PI / 180;
    ctx.rotate(radians);

    ctx.drawImage(
        weaponImg,
        -weaponImg.width / 2 * scale,
        -weaponImg.height * scale,
        weaponImg.width * scale,
        weaponImg.height * scale
    );

    ctx.restore();
};

export { drawNeutral };

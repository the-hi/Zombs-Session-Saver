import { config } from '../Config.js';
import { getImage } from './drawView.js';

async function drawTower(ctx, tower, x, y, scale = 720 / config.killCamResolution) {
    if (tower.model.includes("Heal")) return;

    const base = await getImage(`./pictures/cannon-tower-t${tower.tier}-base.svg`);
    const headType = tower.model !== 'MagicTower' ? tower.model.replace('Tower', '').toLowerCase() : 'mage';
    const head = await getImage(`./pictures/${headType}-tower-t${tower.tier}-head.svg`);
    const middle = tower.model === "MeleeTower" ? await getImage(`./pictures/melee-tower-t${tower.tier}-middle.svg`) : undefined;

    ctx.save();
    ctx.translate(x, y);
    ctx.drawImage(base, -base.width / 2 * scale, -base.height / 2 * scale, base.width * scale, base.height * scale);
    ctx.restore();

    ctx.save();
    ctx.translate(x, y);
    const radians = (tower.yaw - 90) * Math.PI / 180;
    ctx.rotate(radians);

    if (middle) {
        ctx.drawImage(
            middle,
            (-middle.width / 2 + 22) * scale,
            ((-head.height / 2 + 36) - middle.height / 2) * scale,
            middle.width * scale,
            middle.height * scale
        );
    }

    ctx.drawImage(head, -head.width / 2 * scale, -head.height / 2 * scale, head.width * scale, head.height * scale);
    ctx.restore();

    if (tower.health < 1) {
        const barWidth = 88 * scale;
        const barHeight = 14 * scale;
        const offsetY = 28 * scale;
        const padding = 2 * scale;
        const innerR = 2 * scale;

        const filledWidth = Math.max(0, (barWidth - 2 * padding) * tower.health);

        const barColor = { r: 100, g: 161, b: 10 };
        const barFill = `rgb(${barColor.r}, ${barColor.g}, ${barColor.b})`;

        ctx.save();
        ctx.translate(x - barWidth / 2, y + offsetY);

        if (filledWidth > 0) {
            ctx.beginPath();
            const innerX = padding, innerY = padding;
            const innerW = filledWidth;
            const innerH = barHeight - 2 * padding;

            ctx.moveTo(innerX + innerR, innerY);
            ctx.lineTo(innerX + innerW - innerR, innerY);
            ctx.quadraticCurveTo(innerX + innerW, innerY, innerX + innerW, innerY + innerR);
            ctx.lineTo(innerX + innerW, innerY + innerH - innerR);
            ctx.quadraticCurveTo(innerX + innerW, innerY + innerH, innerX + innerW - innerR, innerY + innerH);
            ctx.lineTo(innerX + innerR, innerY + innerH);
            ctx.quadraticCurveTo(innerX, innerY + innerH, innerX, innerY + innerH - innerR);
            ctx.lineTo(innerX, innerY + innerR);
            ctx.quadraticCurveTo(innerX, innerY, innerX + innerR, innerY);
            ctx.closePath();
            ctx.fillStyle = barFill;
            ctx.fill();
        }

        ctx.restore();
    }
}

export { drawTower };

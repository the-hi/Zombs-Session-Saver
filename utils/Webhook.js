import { config } from '../Config.js';
import { WebhookClient } from 'discord.js';

let webhook;

if (config.id !== '' && config.token !== '') {
    webhook = new WebhookClient({ id: config.id, token: config.token });

    // Check if webhook actually exists
    try {
        await webhook.send({
            content: "Webhook connection initiated, Xperience likes smelly toes",
            username: "Skk",
            avatarURL: "https://cdn.wallpapersafari.com/64/11/WkyqrX.jpg"
        });
        console.log('Webhook is set up');
    } catch {
        webhook = undefined;
        console.log("Webhook credentials are incorrect.");
    }
} else {
    console.log("Webhook isn't set up yet.");
}

const sendMessage = async (content, files = []) => {
    if (webhook) {
        await webhook.send({
            files,
            content,
            username: "Skk",
            avatarURL: "https://cdn.wallpapersafari.com/64/11/WkyqrX.jpg"
        });
    }
}

export { sendMessage, webhook };

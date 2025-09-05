import { config } from '../Config.js';
import { WebhookClient } from 'discord.js';

let webhookClient;

if (config.id !== '' && config.token !== '') {
    webhookClient = new WebhookClient({ id: config.id, token: config.token });

    // Check if webhook actually exists
    try {
        await webhookClient.send({
            content: "Webhook connection intiated 🦇",
            username: "Skk",
            avatarURL: "https://cdn.wallpapersafari.com/64/11/WkyqrX.jpg"
        });
    } catch {
        webhookClient = undefined;
        console.log("Webhook credentials are incorrect.");
    }
  } else {
    console.log("Webhook isn't set up yet.");
}

export { webhookClient };

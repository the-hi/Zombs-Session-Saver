import { config } from '../Config.js';
import { WebhookClient } from 'discord.js';

let webhookClient;
if (config.id && config.token) {
    webhookClient = new WebhookClient(config);
} else {
    console.log("Webhook isnt set up yet.")
}

export { webhookClient };
import { servers } from '../ServerList.js';
import { webhookClient } from "../utils/Webhook.js";


function onShutDown() {
    this.ws.send([]);
    if (webhookClient) webhookClient.send({ content: `Alt in ${this.options.server} got closed due to server reset.`})

    this.scripts.autoReconnect = false;
    servers[this.options.server].psks = new Set();
    servers[this.options.server].autoJoin = false;
    servers[this.options.server].autoFill = false;
};

export { onShutDown };
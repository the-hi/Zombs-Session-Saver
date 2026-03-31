import { servers } from '../ServerList.js';
import { sendMessage } from "../utils/Webhook.js";


function onShutDown() {
    this.ws.send([]);
    sendMessage(`Alt in ${this.options.server} with id ${this.options.sessionId} got closed due to server reset.`)

    this.scripts.autoReconnect = false;
    servers[this.options.server].psks.clear();
    servers[this.options.server].autoJoin = false;
    servers[this.options.server].autoFill = false;
};

export { onShutDown };
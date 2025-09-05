import { CLIENT_OPCODES } from "../Start.js";

function onFailure(response) {
    if (response.type === 'ping') {
        const ping = (Date.now() - this.lastPing) / 2;
        
        this.broadCastPacket(CLIENT_OPCODES.PING_TEST, [...new TextEncoder().encode(ping)])
    };
};

export { onFailure };
import { servers } from "../ServerList.js";

const TOGGLE_AUTO_BREAK_IN = (decodedMessage) => {
    const { toggle, serverId, name, psk } = JSON.parse(decodedMessage);
    const server = servers[serverId];
    
    if (server) {
        server.psk = psk;
        server.name = name;
        server.BreakIn = toggle;
    }
};

export { TOGGLE_AUTO_BREAK_IN };
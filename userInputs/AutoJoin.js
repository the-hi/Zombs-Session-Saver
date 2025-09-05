import { servers } from "../ServerList.js";
import { UPDATE_SESSION_LIST } from "../utils/UpdateList.js";

const TOGGLE_AUTO_JOIN = (decodedMessage) => {
    const { psk, toggle, serverId } = JSON.parse(decodedMessage);
    const server = servers[serverId];

    if (server) {
        server.psks ||= new Set();
        if (toggle === "add") {
            server.psks.add(psk);
        } else if (toggle === 'delete') {
            server.psks.delete(psk);
        } else {
            server.autoJoin = toggle;
        }
        UPDATE_SESSION_LIST();
    }
};

export { TOGGLE_AUTO_JOIN };
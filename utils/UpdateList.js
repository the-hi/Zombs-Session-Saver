import { servers } from "../ServerList.js";
import { SESSIONS } from "../MakeSession.js";
import { getEncodedJSON } from "./EncodeJSON.js";
import { CLIENTS, CLIENT_OPCODES } from "../Start.js";
import { EXTRACT_SESSION_INFO } from "./ExtractInfo.js";

const UPDATE_SESSION_LIST = (id) => {
    // get all sessions and their info
    const sessions = {};
    let autoFillPsks = new Set();

    SESSIONS.forEach((SESSION, sessionId) => {
        sessions[sessionId] = EXTRACT_SESSION_INFO(SESSION);
    })

    for (const server in servers) {
        if (servers[server].psks && servers[server].psks.size !== 0) {
            const moddedPsks = new Set([...servers[server].psks].map(psk => `${server}/${psk}`));

            autoFillPsks = new Set([...autoFillPsks, ...moddedPsks]);
        }
    }
    // send information to one or all clients
    if (CLIENTS.has(id)) {
        CLIENTS.get(id).sendPacket([CLIENT_OPCODES.SYNC_EXISTING_SESSIONS, ...getEncodedJSON({ sessions, psks: [...autoFillPsks] })]);
    } else {
        CLIENTS.forEach((CLIENT) => {
            if (CLIENT.IS_VERIFIED) {
                CLIENT.sendPacket([CLIENT_OPCODES.SYNC_EXISTING_SESSIONS, ...getEncodedJSON({ sessions, psks: [...autoFillPsks] })]);
            }
        })
    }
};

export { UPDATE_SESSION_LIST };
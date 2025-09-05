import { SESSIONS } from "../MakeSession.js";
import { CLIENT_OPCODES } from "../Start.js";
import { getEncodedJSON } from "../utils/EncodeJSON.js";

const JOIN_SESSION = (sessionId, CLIENT) => {
    const SELECTED_SESSION = SESSIONS.get(+sessionId);

    //  join only one session per connection
    if (CLIENT.IN_SESSION) {
        SESSIONS.forEach(session => {
            if (session.clients.has(CLIENT.id)) {
                session.clients.delete(CLIENT.id)
            }
        })
    }
    // join the session
    if (SELECTED_SESSION) {
        SELECTED_SESSION.clients.set(CLIENT.id, CLIENT);
        CLIENT.IN_SESSION = +sessionId;
        // send sync needs here
        CLIENT.sendPacket([CLIENT_OPCODES.CODEC, ...getEncodedJSON(SELECTED_SESSION.codec)]);
        // send buildingAttributes 
        CLIENT.sendPacket([CLIENT_OPCODES.JSONS, ...getEncodedJSON(SELECTED_SESSION.buildingInfo)]);
        // send syncNeeds
        CLIENT.sendPacket([CLIENT_OPCODES.SYNC_CLIENT, ...getEncodedJSON({
            ...SELECTED_SESSION.syncNeeds,
            options: SELECTED_SESSION.options,
            isPaused: SELECTED_SESSION.myPlayer.isPaused,
            isDead: SELECTED_SESSION.myPlayer.dead && { name: "Dead", response: { stashDied: 0 }, opcode: 9 },
            entities: { tick: SELECTED_SESSION.ticks, byteSize: 0, opcode: 0, entities: Object.fromEntries(SELECTED_SESSION.entities) },
        })]);
    };
};

export { JOIN_SESSION };
import { SESSIONS } from "../MakeSession.js";
import { CLIENT_OPCODES } from "../Start.js";

const SEND_PACKET = (packet, CLIENT) => {
    const SELECTED_SESSION = SESSIONS.get(CLIENT.IN_SESSION);
    if (SELECTED_SESSION) {
        SELECTED_SESSION.ws.send(packet);
        const decodedPacket = new TextDecoder().decode(packet.subarray(2));
        
        if (decodedPacket.includes("mouseMoved")) {
            const { mouseMoved } = JSON.parse(decodedPacket);
            SELECTED_SESSION.broadCastPacket(CLIENT_OPCODES.SYNC_AIM, [...new TextEncoder().encode(mouseMoved)], CLIENT.id)
        }
    }
};

export { SEND_PACKET };
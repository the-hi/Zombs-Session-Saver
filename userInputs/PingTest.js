import { SESSIONS } from "../MakeSession.js";

const PING_TEST = (decodedMessage, CLIENT) => {
    const SELECTED_SESSION = SESSIONS.get(CLIENT.IN_SESSION);
    if (SELECTED_SESSION) {
        SELECTED_SESSION.lastPing = Date.now();

        SELECTED_SESSION.makeBuilding("ping", { x: 0, y: 0 }, 0);
        return;
    }
};

export { PING_TEST };
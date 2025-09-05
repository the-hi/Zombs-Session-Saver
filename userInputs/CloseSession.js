import { SESSIONS } from "../MakeSession.js";
import { UPDATE_SESSION_LIST } from "../utils/UpdateList.js";

const CLOSE_SESSION = (decodedMessage) => {
    const SESSION_ID = +decodedMessage;
    const SELECTED_SESSION = SESSIONS.get(SESSION_ID);
    
    if (SELECTED_SESSION) {
        SELECTED_SESSION.ws.close();
        UPDATE_SESSION_LIST();
    }
};

export { CLOSE_SESSION };
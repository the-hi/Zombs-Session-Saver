import { SESSIONS } from "../MakeSession.js";
import { UPDATE_SESSION_LIST } from "../utils/UpdateList.js";

const CHANGE_SESSION_TYPE = (decodedMessage) => {
    const { sessionId, type } = JSON.parse(decodedMessage);
    
    const SELECTED_SESSION = SESSIONS.get(sessionId);
    if (SELECTED_SESSION) {
        SELECTED_SESSION.options.type = type;
        UPDATE_SESSION_LIST();
    }
}

export { CHANGE_SESSION_TYPE };
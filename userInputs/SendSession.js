import { Session } from "../MakeSession.js";

const SEND_SESSION = (decodedMessage) => {    
    const { serverId, type, psk, name, sessionName } = JSON.parse(decodedMessage);
    
    new Session({ server: serverId, type, psk, name, sessionName });
};

export { SEND_SESSION };
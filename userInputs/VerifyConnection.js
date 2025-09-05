import { config } from "../Config.js";
import { CLIENTS, CLIENT_OPCODES } from "../Start.js";
import { getEncodedJSON } from "../utils/EncodeJSON.js";
import { UPDATE_SESSION_LIST } from "../utils/UpdateList.js";

let clientId = 0;

const { sessionSaverVIEW, sessionSaverNORMAL, sessionSaverADMIN } = config;

const types = {
    "VIEW": sessionSaverVIEW,
    "ADMIN": sessionSaverADMIN,
    "NORMAL": sessionSaverNORMAL,
}

const VERIFY_CONNECTION = (decodedMessage, CLIENT) => {
    for (const type in types) { // check for all different types of passwords and give them corresponding attributes
        if (types[type] === decodedMessage) {
            CLIENT[type] = true;
            CLIENT.IS_VERIFIED = true;
            break;
        }
    };

    if (!CLIENT.IS_VERIFIED) {
        CLIENT.sendPacket([CLIENT_OPCODES.ACCESS_VERIFIED, ...getEncodedJSON({ verified: false })]);
    } else {
        CLIENT.sendPacket([CLIENT_OPCODES.ACCESS_VERIFIED, ...getEncodedJSON({ verified: true })]);

        // initialise a client
        CLIENT.id = ++clientId;
        CLIENTS.set(CLIENT.id, CLIENT)
        UPDATE_SESSION_LIST(CLIENT.id);
    }
};

export { VERIFY_CONNECTION };
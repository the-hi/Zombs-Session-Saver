import { extname } from 'path';
import { readdirSync } from 'fs';

const exportsMap = {};

const getExports = async () => {
    for (const file of readdirSync('./userInputs')) {
        if (extname(file) === '.js') {
            const module = await import('../userInputs/' + file);
            Object.assign(exportsMap, module);
        }
    }
}

getExports();

const OPCODES = {
    0: 'VERIFY_CONNECTION',
    1: 'SEND_SESSION',
    2: 'CLOSE_SESSION',
    3: 'TOGGLE_SCRIPTS',
    4: 'CHANGE_SESSION_TYPE',
    5: 'CHANGE_SESSION_NAME',
    6: 'GET_LEADERBOARDS',
    7: 'TOGGLE_AUTO_JOIN',
    8: 'TOGGLE_AUTO_FILL',
    9: 'SEND_PACKET',
    10: 'JOIN_SESSION',
    11: 'TOGGLE_AUTO_BREAK_IN',
    12: 'PING_TEST',
    13: 'CHANGE_PASSWORD'
}

const GET_MESSAGE_TYPE = (opcode) => OPCODES[opcode];
const decodeString = (buffer) => new TextDecoder().decode(buffer);

const HANDLE_MESSAGE = (msg, CLIENT) => {
    const MESSAGE_TYPE = GET_MESSAGE_TYPE(msg[0]);
    msg = msg.subarray(1)

    if (MESSAGE_TYPE !== 'JOIN_SESSION' && CLIENT['VIEW']) return;
    if (MESSAGE_TYPE !== 'VERIFY_CONNECTION' && !CLIENT.IS_VERIFIED) return;

    if (MESSAGE_TYPE === 'SEND_PACKET') {
        exportsMap.SEND_PACKET(msg, CLIENT);
        return;
    }

    if (MESSAGE_TYPE === 'TOGGLE_SCRIPTS') {
        exportsMap.TOGGLE_SCRIPTS(msg, CLIENT);
        return;
    }

    const decodedMessage = decodeString(msg);
    if (exportsMap[MESSAGE_TYPE]) {
        exportsMap[MESSAGE_TYPE](decodedMessage, CLIENT)
    };
};

export { HANDLE_MESSAGE };
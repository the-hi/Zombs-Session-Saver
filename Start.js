import { WebSocketServer } from "ws";
import { config } from "./Config.js";
import { SESSIONS } from "./MakeSession.js";
import { HANDLE_MESSAGE } from "./utils/HandleMessage.js";

const { PORT } = config;

const WEBSOCKET_SERVER = new WebSocketServer({
    port: PORT,
    perMessageDeflate: {
        threshold: 1024,
        zlibDeflateOptions: { level: 9 },
        zlibInflateOptions: { chunkSize: 32 * 1024 },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        concurrencyLimit: 10,
    }
});

console.log(`WebSocket server started on port ${PORT}`);

const CLIENT_OPCODES = {
    SYNC_CLIENT: 0,
    UPDATE_CLIENT: 1,
    UPDATE_SCRIPTS: 2,
    LEADERBOARD: 3,
    SYNC_AIM: 4,
    CODEC: 5,
    JSONS: 6,
    SYNC_EXISTING_SESSIONS: 7,
    ACCESS_VERIFIED: 8,
    PING_TEST: 9,
}

const CLIENTS = new Map();

WEBSOCKET_SERVER.on('connection', (CLIENT) => {
    CLIENT.sendPacket = (array) => {
        if (CLIENT.readyState === CLIENT.OPEN) {
            CLIENT.send(new Uint8Array(array));
        }
    };

    CLIENT.on('message', (msg) => {
        HANDLE_MESSAGE(msg, CLIENT)
    });

    CLIENT.on('close', () => {
        if (CLIENT.id) CLIENTS.delete(CLIENT.id);
        if (CLIENT.IN_SESSION) {
            const SESSION = SESSIONS.get(CLIENT.IN_SESSION);
            
            if (!SESSION) return;
            SESSION.clients.delete(CLIENT.id);
        }
    });
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled rejection:", reason);
});

export { CLIENT_OPCODES, CLIENTS };

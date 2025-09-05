import { SESSIONS } from "../MakeSession.js";
import { CLIENT_OPCODES } from "../Start.js";
import { getEncodedJSON } from "../utils/EncodeJSON.js";

const GET_LEADERBOARDS = (decodedMessage, CLIENT) => {
    const LEADERBOARDS = {};
    SESSIONS.forEach(session => {
        if (!LEADERBOARDS[session.options.server]) {
            LEADERBOARDS[session.options.server] = [];
        }
        if (!session.syncNeeds.leaderboard.response) return;
        session.syncNeeds.leaderboard.response.forEach((entry) => {
            if (!LEADERBOARDS[session.options.server].find(e => e.uid === entry.uid)) LEADERBOARDS[session.options.server].push(entry)
        })
    });
    // sort all the leaderboards
    for (const server in LEADERBOARDS) {
        LEADERBOARDS[server] = LEADERBOARDS[server].sort((a, b) => b.score - a.score);
    };
    const encodedLeaderboards = getEncodedJSON(LEADERBOARDS);
    CLIENT.sendPacket([CLIENT_OPCODES.LEADERBOARD, ...encodedLeaderboards])
};

export { GET_LEADERBOARDS };
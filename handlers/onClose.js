import { playAudio } from "../utils/Alarms.js";
import { webhookClient } from "../utils/Webhook.js";
import { SESSIONS, Session } from "../MakeSession.js";
import SpatialHash from "../utils/SpatialHashBlueLatios.js";
import { UPDATE_SESSION_LIST } from "../utils/UpdateList.js";

function onClose() {
    if (this.scripts.disconnectAlarm) playAudio();
    if (this.scripts.autoReconnect) new Session(this.options);

    if (this.options.sessionId) {
        this.emitter.removeAllListeners();
        SESSIONS.delete(this.options.sessionId);
        SpatialHash.deleteInstance(this.options.sessionId);

        this.clients.forEach(client => {
            client.IN_SESSION = null;
            client.close();
        });
        
        if (webhookClient) {
            webhookClient.send({ 
                username: "Skk",
                avatarURL: "https://cdn.wallpapersafari.com/64/11/WkyqrX.jpg",
                content: `Alt with id ${this.options.sessionId} in ${this.options.server} DCED AFTER: ${(this.ticks - this.syncNeeds.enterWorld.startingTick) / 20}seconds.`           
            })
        }
        UPDATE_SESSION_LIST();

        delete this;
        if (global.gc) global.gc(); // clean up the mess :vomit:
    }
};

export { onClose };

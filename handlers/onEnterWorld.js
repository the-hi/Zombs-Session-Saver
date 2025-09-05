import { EventEmitter } from 'events';
import { randomInt } from "node:crypto";
import { servers } from "../ServerList.js";
import { SESSIONS } from "../MakeSession.js";
import SpatialHash from "../utils/SpatialHashBlueLatios.js";
import { scriptFunctions } from "../utils/ReloadScripts.js";
import { UPDATE_SESSION_LIST } from "../utils/UpdateList.js";

let SESSION_ID = 0;

async function onEnterWorld(data) {
    if (!data.allowed) return;
    // set uid
    this.playerUid = data.uid;
    this.ticks = data.startingTick;
    this.SpatialHash = SpatialHash;

    this.enterWorld2 && this.ws.send(this.enterWorld2);

    this.loadLb();
    this.bumpUp = randomInt(0, 20);
    this.syncNeeds.enterWorld = data;
    this.scriptFunctions = scriptFunctions;
    servers[this.options.server].BreakIn = false;
    this.sendRpc({ name: "JoinPartyByShareKey", partyShareKey: this.options.psk });

    // set session details
    this.emitter = new EventEmitter();
    this.options.sessionId = ++SESSION_ID;
    SESSIONS.set(this.options.sessionId, this);
    this.SpatialHash.spawnInstance(this.options.sessionId);


    UPDATE_SESSION_LIST();
};

export { onEnterWorld };
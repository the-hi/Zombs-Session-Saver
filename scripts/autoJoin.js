import { servers } from '../ServerList.js';

function autoJoin() { // every 0.5 seconds
    const server = servers[this.options.server];

    if (!server.autoJoin) return;

    const psk = this.syncNeeds.psk.partyShareKey;

    if (server.psks.size !== 0 && !server.psks.has(psk) && this.ticks % 2 === 0) {
        server.psks.forEach(key => {
            this.sendRpc({ name: "JoinPartyByShareKey", partyShareKey: key });
        })
    }
};

export { autoJoin };
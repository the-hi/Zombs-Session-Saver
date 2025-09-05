import { SESSIONS } from '../MakeSession.js';

function onPartyInfo(data) {
    this.syncNeeds.partyInfo = data;
    const isLeader = data.response[0].playerUid === this.playerUid;

    this.canSell = true; // assume true until proven wrong
    data.response.forEach(teammate => {
        if (teammate.canSell) return;
        if (teammate.playerUid === this.playerUid) this.canSell = false;

        if (!isLeader) return;
        const isSession = [...SESSIONS.values()].find(session => teammate.playerUid === session.playerUid);
                
        if (isSession && isLeader) {
            this.sendRpc({ name: "SetPartyMemberCanSell", uid: teammate.playerUid, canSell: 1 });
        }
    });
}

export { onPartyInfo };
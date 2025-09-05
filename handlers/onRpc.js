import { onFailure } from './onFailure.js';
import { onShutDown } from './onShutDown.js';
import { onPartyInfo } from './onPartyInfo.js';
import { playAudio } from '../utils/Alarms.js';
import { onBuildingUpdate } from './onBuildingUpdate.js';
import { onInventoryUpdate } from './onInventoryUpdate.js';

function onRpc(data) {
    switch (data.name) {
        case 'Shutdown':
            onShutDown.call(this);
            break;
        case "PartyShareKey":
            this.syncNeeds.psk = data;
            break;
        case "PartyInfo":
            onPartyInfo.call(this, data);
            break;
        case "DayCycle":
            this.syncNeeds.dayCycle = data;
            break;
        case 'Leaderboard':
            this.syncNeeds.leaderboard = data;
            break;
        case "SetItem":
            onInventoryUpdate.call(this, data);
            break;
        case 'Failure':
            onFailure.call(this, data.response);
            break;
        case "CastSpellResponse":
            this.castSpellResponse = data.response;
            break;
        case 'LocalBuilding':
            onBuildingUpdate.call(this, data.response);
            break;
        case 'BuildingShopPrices':
            this.buildingInfo[data.name] = data.response;
            break;
        case 'ItemShopPrices':
            this.buildingInfo[data.name] = data.response;
            break;
        case 'Spells':
            this.buildingInfo[data.name] = data.response;
            break;
        case 'Dead':
            if (this.scripts.autoRespawn) {
                this.sendInput({ respawn: 1 });
            }
            break;
        case "SetPartyList":
            this.syncNeeds.parties = data;

            this.pop = 0;
            data.response.forEach((party) => this.pop += party.memberCount);

            if (this.scripts.serverFullAlarm && this.pop === 32) playAudio();
            break;
        case "ReceiveChatMessage":
            this.syncNeeds.messages.push(data);
            if (this.syncNeeds.messages.length > 100) this.syncNeeds.messages.shift(); // remove the first element
            break;
    }
};

export { onRpc };
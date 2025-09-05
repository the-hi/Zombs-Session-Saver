import { SESSIONS } from "../MakeSession.js";
import { CLIENT_OPCODES } from "../Start.js";
import { getEncodedJSON } from "../utils/EncodeJSON.js";

const SCRIPT_OPCODES = {
    0: 'ahrc',
    1: 'petHeal',
    2: 'autoHeal',
    3: 'autoAim',
    4: 'petEvolve',
    5: 'petRevive',
    6: 'autoAttack',
    7: 'autoRespawn',
    8: 'autoRebuild',
    9: 'autoUpgrade',
    10: 'autoReconnect',
    11: 'autoAttackDistance',
    12: 'antiPressureBug',
    13: 'autoAimTarget',
    14: 'playerTrickType',
    15: 'upgradeTowerHealth',
    16: 'autoHealSpell',
    17: 'autoFollow',
    18: 'playerTrick',
    19: 'autoUpgrade',
    20: 'autoTimeout',
    21: 'autoSwitchWeapon',
    22: 'positionLock',
    23: 'upgradeAll',
    24: 'towerDeathAlarm',
    25: 'stashHealthAlarm',
    26: 'disconnectAlarm',
    27: 'serverFullAlarm'
}

const TOGGLE_SCRIPTS = (msg, CLIENT) => {
    const SCRIPT_TYPE = SCRIPT_OPCODES[msg[0]];

    if (!SCRIPT_TYPE) return;

    const json = JSON.parse(new TextDecoder().decode(msg.subarray(1)));

    const { toggle, sessionId } = json;
    const SELECTED_SESSION = SESSIONS.get(sessionId || CLIENT.IN_SESSION);

    if (SELECTED_SESSION) {
        switch (SCRIPT_TYPE) {
            case 'autoUpgrade':
                SELECTED_SESSION.scripts[SCRIPT_TYPE] = toggle;
                SELECTED_SESSION.setBuildingTier();
                if (!toggle) {
                    SELECTED_SESSION.autoUpgradeBuildings.clear();
                    SELECTED_SESSION.missingAutoUpgradeBuildings.clear();
                }
                break;
            case 'autoAimTarget':
                if (!["players", "zombies"].includes(json.target)) return;

                SELECTED_SESSION.scripts[SCRIPT_TYPE] = json.target;
                break;   
            case 'playerTrickType':
                if (!["normal", "reverse"].includes(json.type)) return;

                SELECTED_SESSION.scripts[SCRIPT_TYPE] = json.type;
                break;
            case 'autoAttackDistance':
                if (typeof json.distance !== 'number') return;

                SELECTED_SESSION.scripts[SCRIPT_TYPE] = json.distance;  
                break;
            case 'playerTrick':
                SELECTED_SESSION.scripts[SCRIPT_TYPE] = toggle;
                SELECTED_SESSION.scripts.playerTrickPsk = json.psk;
                break;
            case 'positionLock':
                SELECTED_SESSION.scripts.lockAt = SELECTED_SESSION.myPlayer.position;
                SELECTED_SESSION.scripts[SCRIPT_TYPE] = toggle;
                break;
            case 'autoRebuild':
                SELECTED_SESSION.setBuildings();
                if (!toggle) {
                    SELECTED_SESSION.autoRebuildBuildings.clear();
                    SELECTED_SESSION.missingAutoRebuildBuildings.clear();
                }
            default:
                SELECTED_SESSION.scripts[SCRIPT_TYPE] = toggle;
        }
        SELECTED_SESSION.broadCastPacket(CLIENT_OPCODES.UPDATE_SCRIPTS, getEncodedJSON({ script: SCRIPT_TYPE, json: json }));
    }
};

export { TOGGLE_SCRIPTS };
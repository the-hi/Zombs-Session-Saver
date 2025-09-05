// ==UserScript==
// @name         Session-Saver v2
// @version      1
// @description  Session-Saver
// @author       Skk(Batman)
// @run-at       document-idle
// @match        *://zombs.io/*
// @match        *://localhost/*
// @grant        none
// ==/UserScript==

const serverList = {
    'Localhost': { url: 'ws://localhost:8080', password: 'JKING_IS_A_SKID' }, // add more servers here with the same format  'ServerName': { url: 'url', password: 'password' }
}

const CLIENT_OPCODES = {
    0: 'SYNC_CLIENT',
    1: 'UPDATE_CLIENT',
    2: 'UPDATE_SCRIPTS',
    3: 'LEADERBOARD',
    4: 'SYNC_AIM',
    5: 'CODEC',
    6: 'JSON',
    7: 'SYNC_EXISTING_SESSIONS',
    8: 'ACCESS_VERIFIED',
    9: 'PING_TEST',
};

const OPCODES = {
    'VERIFY_CONNECTION': 0,
    'SEND_SESSION': 1,
    'CLOSE_SESSION': 2,
    'TOGGLE_SCRIPTS': 3,
    'CHANGE_SESSION_TYPE': 4,
    'CHANGE_SESSION_NAME': 5,
    'GET_LEADERBOARDS': 6,
    'TOGGLE_AUTO_JOIN': 7,
    'TOGGLE_AUTO_FILL': 8,
    'SEND_PACKET': 9,
    'JOIN_SESSION': 10,
    'TOGGLE_AUTO_BREAK_IN': 11,
    'PING_TEST': 12,
    'CHANGE_PASSWORD': 13,
};

const BINCODEC_PACKETS = {
    9: 'PACKET_RPC',
    0: 'PACKET_ENTITY_UPDATE',
    4: 'PACKET_ENTER_WORLD',
}

document.querySelector('.hud-intro-left').innerHTML = `<div class="ad-unit ad-unit-medrec ad-unit-medrec-atf" style="width: auto; height: auto;" bis_skin_checked="1"><div class="session_saver"></div></div>`;
document.getElementsByClassName("hud-intro-guide")[0].style.width = "300px";
document.getElementsByClassName("hud-intro-guide")[0].style.height = "282px";
document.getElementsByClassName('hud-intro-form')[0].getElementsByTagName('label')[0].remove();
document.getElementsByClassName("session_saver")[0].innerHTML = `
    <h3>SESSION SAVER</h3>
    <h5></h5>
    <input class="SessionName" type="text" placeholder="Enter Session Name" maxlength="20">
    <input class="PlayerName" type="text" placeholder="Enter player name">
    <input class="ServerId" type="text" placeholder="Enter server id">
    <input class="SessionPSK" type="text" placeholder="Enter party key" maxlength="20">
    <input class="CloseSessionInput" type="text" placeholder="SessionId">
    <button class="CloseSession" style="width: 45%">Close Session</button>
    <button class="BreakInOn" style="width: 22%">Enable Break In</button>
    <button class="FillerOn" style="width: 22%" >Enable Server Filler</button>
    <button class="EnableAutoJoin" style="width: 22%">Enable Party Filler</button>
    <button class="AddAutoJoinPSK" style="width: 22%">Add Party Key</button>
    <button class="BreakInOff" style="width: 22%">Disable Break In</button>
    <button class="FillerOff" style="width: 22%"">Disable Server Filler</button>
    <button class="DisableAutoJoin" style="width: 22%">Disable Party Filler</button>
    <button class="DeleteAutoJoinPSK" style="width: 22%">Delete Party Key</button>
    `;

document.getElementsByClassName("hud-intro-guide")[0].innerHTML = `
    <hr>
    <input class="SessionId" type="number" placeholder="Enter Session Id">
    <input class="SessionName" type="text" placeholder="Enter new name or type">
    <div class="change-session-controls">
        <button class="ChangeSessionName">Change Session Name</button>
        <button class="ChangeSessionName">Change Session Type</button>
    </div>
    <div class="server-controls">
        <select class='serverList'></select>
        <select class='typeList'><option>all</option></select>
        <button class='ChangeServer'>Change Server</button>
    </div>
    <p class="savedsessions"></p>
    <hr>
    `;

document.getElementsByClassName("hud-intro-corner-bottom-left")[0].remove();
document.getElementsByClassName("hud-intro-corner-bottom-right")[0].remove();
document.getElementsByClassName("hud-intro-form")[0].insertAdjacentHTML("beforeend", `<button class="btn btn-green hud-intro-play">Send Session</button>`);
document.getElementsByClassName("hud-intro-left")[0].setAttribute("style", "width: 370px; height: 300px;");

const cssStyles = `
    .session_saver, .hud-intro-guide {
        background-color: #2c3e50;
        border-radius: 8px;
        text-color: #ecf0f1;
    }

    .session_saver {
        text-align: center;
    }

    hr {
        border: none;
        height: 1px;
        background-color: #34495e;
    }

    .change-session-controls {
        display: flex;
        gap: 2px;
    }

    .ChangeSessionName {
        display: inline-block;
        font-size: 12px;
    }

    .hud-intro-main select, .hud-intro-main input {
        width: 45%;
        padding: 12px;
        background-color: #34495e;
        border: 2px solid transparent;
        border-radius: 5px;
        color: #ecf0f1;
        font-size: 14px;
        box-sizing: border-box;
        transition: border-color 0.3s ease;
    }

    .hud-party-icons {
        transform: translate(-30px, 15px);
        z-index: 12;
    }

    .hud-intro-main input::placeholder {
        color: #95a5a6;
    }

    .hud-intro-main input:focus, select:focus {
        outline: none;
        border-color: #3498db;
    }

    .session_saver h5 {
        margin: 0px;
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
        user-select: text;
    }

    .session_saver button, .hud-intro-guide button {
        padding: 8px 8px;
        border: none;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        cursor: pointer;
        text-transform: uppercase;
        font-size: 13px;
        letter-spacing: 0.5px;
        transition: all 0.2s ease;
        min-height: 44px;
    }

    .hud-intro-guide {
        min-height: 0;
    }

    .session_saver button:hover, .hud-intro-guide button:hover {
        filter: brightness(0.5);
    }

    .session_saver h3 {
        color: #ffffff;
        font-size: 1.2em;
        margin-bottom: 0px;
        margin-top: 0px;
        padding: 10px;
        letter-spacing: 1px;
    }

    .hud-intro-guide > input, .hud-intro-guide > button {
        width: 100%;
    }

    .server-controls {
        display: flex;
        gap: 5px;
        margin-top: 12px;
    }

    .server-controls select {
        flex-grow: 1;
        margin-bottom: 0;
    }

    .hud-intro .hud-intro-main .hud-intro-left, .hud-intro .hud-intro-main .hud-intro-form, .hud-intro .hud-intro-main .hud-intro-guide {
        transform: translateX(-35px);
    }

    .server-controls button {
        margin-bottom: 0;
    }

    .savedsessions {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        justify-content: center;
    }

    .BreakInOn, .FillerOn, .EnableAutoJoin, .AddAutoJoinPSK, .hud-intro-play, .ChangeSessionName, .ChangeServer, .sessions {
        background-color: #27ae60;
    }

    .sessions {
        white-space: normal;
        word-break: break-word;
        flex: 1 1 calc(50% - 20px);
        box-sizing: border-box;
        text-align: center;
    }

    .sessions:hover {
        background-color: #3498db;
    }

    .CloseSession, .DeleteAutoJoinPSK, .BreakInOff, .FillerOff, .DisableAutoJoin {
        background-color: #c0392b;
    }
    .typeList {
        width: auto;
    }
`;

// Create and inject the stylesheet
const styleSheet = document.createElement("style");
styleSheet.innerText = cssStyles;
document.head.appendChild(styleSheet);
document.getElementsByClassName('hud-intro-server')[0].style.backgroundColor = '#34495e'
document.getElementsByClassName('hud-intro-name')[0].style.backgroundColor = '#34495e'


window.$ = (name) => document.getElementsByClassName(name);

// send session
$('btn btn-green hud-intro-play')[1].onclick = () => {
    const psk = $('SessionPSK')[0].value;
    const name = $('PlayerName')[0].value === '' ? $('hud-intro-name')[0].value : $('PlayerName')[0].value;
    const serverId = $('ServerId')[0].value === '' ? $('hud-intro-server')[0].value : $('ServerId')[0].value;
    const sessionName = $('SessionName')[0].value == '' ? undefined : $('SessionName')[0].value;

    window.client.sendSession({ name, serverId, type: 'normal', sessionName, psk })
}

// change session name
$("ChangeSessionName")[0].onclick = () => {
    const sessionId = parseInt($("SessionId")[0].value) || undefined;
    const name = $("SessionName")[1].value === '' ? undefined : $("SessionName")[1].value;

    if (!window.client) return;
    window.client.changeSessionName({ name, sessionId })
};
// change session type
$("ChangeSessionName")[1].onclick = () => {
    const sessionId = parseInt($("SessionId")[0].value) || undefined;
    const type = $("SessionName")[1].value === '' ? undefined : $("SessionName")[1].value;

    if (!window.client) return;
    window.client.changeSessionType({ type, sessionId })
};

// switch servers
$('ChangeServer')[0].onclick = () => {
    if (window.client) window.client.ws.close();
    new Client();
}

// close a session
$('CloseSession')[0].onclick = () => {
    const sessionId = parseInt($('CloseSessionInput')[0].value) || undefined;
    window.client.closeSession(sessionId)
}

// break in
$('BreakInOn')[0].onclick = () => {
    const psk = $('SessionPSK')[0].value;
    const name = $('PlayerName')[0].value;
    const serverId = $('ServerId')[0].value;

    window.client.toggleBreakIn({ toggle: true, serverId, name, psk })
}

$('BreakInOff')[0].onclick = () => {
    const name = $('PlayerName')[0].value;
    const serverId = $('ServerId')[0].value;

    window.client.toggleBreakIn({ toggle: false, serverId, name })
}

// filler
$('FillerOn')[0].onclick = () => {
    const psk = $('SessionPSK')[0].value;
    const name = $('PlayerName')[0].value;
    const serverId = $('ServerId')[0].value;

    window.client.toggleAutoFill({ toggle: true, serverId, name, psk })
}

$('FillerOff')[0].onclick = () => {
    const serverId = $('ServerId')[0].value;

    window.client.toggleAutoFill({ toggle: false, serverId })
}

// party filler
$('EnableAutoJoin')[0].onclick = () => {
    const serverId = $('ServerId')[0].value;

    window.client.toggleAutoJoin({ toggle: true, serverId })
}

$('DisableAutoJoin')[0].onclick = () => {
    const serverId = $('ServerId')[0].value;
    window.client.toggleAutoJoin({ toggle: false, serverId })
}

$('AddAutoJoinPSK')[0].onclick = () => {
    const psk = $('SessionPSK')[0].value;
    const serverId = $('ServerId')[0].value;

    window.client.toggleAutoJoin({ toggle: 'add', serverId, psk })
}

$('DeleteAutoJoinPSK')[0].onclick = () => {
    const psk = $('SessionPSK')[0].value;
    const serverId = $('ServerId')[0].value;

    window.client.toggleAutoJoin({ toggle: 'delete', serverId, psk })
}


for (const server in serverList) {
    document.getElementsByClassName("serverList")[0].innerHTML += `<option>${server}</option>`
};

// prevent mouse down when clicking on party members
game.inputManager.mouseUpHook = game.inputManager._events.mouseUp[1];
game.inputManager.mouseDownHook = game.inputManager._events.mouseDown[1];
game.inputManager._events.mouseDown[1] = function(event) {
    if (event.srcElement.innerText === "PL") return;
    game.inputManager.mouseDownHook(event)
}
game.inputManager._events.mouseUp[1] = function(event) {
    if (event.srcElement.innerText === "PL") return;
    game.inputManager.mouseUpHook(event)
}

// show intro to switch between sessions faster
document.getElementsByClassName("hud-settings-grid")[0].innerHTML += `<a class="show-intro btn btn-green">Show Intro</a>`;
document.getElementsByClassName("show-intro")[0].onclick = () => {
    if (!game.ui.getPlayerTick()) return;
    if (!window.client || !window.client.sessions) return;
    if (Object.values(window.client?.sessions).length === 0) return;
    const isSession = Object.values(client.sessions).find(session => session.uid === game.ui.playerTick.uid);

    if (isSession) {
        game.ui.components.Intro.show()
    }
}

// switch to  party members session by clicking on the party member icon
const partyMemberIcons = Array.from(document.getElementById("hud-party-icons").children);
for (let i = 0; i < partyMemberIcons.length; i++) {
     partyMemberIcons[i].addEventListener("click", (e) => {
        if (!window.client || !window.client.sessions) return;

        const isMyPlayerSession = Object.values(client.sessions).find(session => session.uid === game.ui.playerTick.uid);
        if (!isMyPlayerSession) return;

         const isSession = Object.values(client.sessions).find(session => session.uid === game.ui.playerPartyMembers[i].playerUid);
         if (isSession) {
             client.joinSession(isSession.sessionId)
         }
     })
}

let dimension = 1;

const onWindowResize = () => {
    const renderer = Game.currentGame.renderer;
    let canvasWidth = window.innerWidth * window.devicePixelRatio;
    let canvasHeight = window.innerHeight * window.devicePixelRatio;
    let ratio = Math.max(canvasWidth / (1920 * dimension), canvasHeight / (1080 * dimension));
    renderer.scale = ratio;
    renderer.entities.setScale(ratio);
    renderer.ui.setScale(ratio);
    renderer.renderer.resize(canvasWidth, canvasHeight);
    renderer.viewport.width = renderer.renderer.width / renderer.scale + 2 * renderer.viewportPadding;
    renderer.viewport.height = renderer.renderer.height / renderer.scale + 2 * renderer.viewportPadding;
}

onWindowResize();

window.onresize = onWindowResize;

window.onwheel = e => {
    if (e.deltaY > 0) {
        dimension = Math.min(2, dimension + 0.1);
        onWindowResize();
    } else if (e.deltaY < 0) {
        dimension = Math.max(0.1, dimension - 0.1);
        onWindowResize();
    }
}

const SCRIPT_OPCODES = {
    'ahrc': 0,
    'petHeal': 1,
    'autoHeal': 2,
    'autoAim': 3,
    'petEvolve': 4,
    'petRevive': 5,
    'autoAttack': 6,
    'autoRespawn': 7,
    'autoRebuild': 8,
    'autoUpgrade': 9,
    'autoReconnect': 10,
    'autoAimDistance': 11,
    'antiPressureBug': 12,
    'autoAimTarget': 13,
    'playerTrickType': 14,
    'upgradeTowerHealth': 15,
    'autoHealSpell': 16,
    'autoFollow': 17,
    'playerTrick': 18,
    'autoUpgrade': 19,
    'autoTimeout': 20,
    'autoSwitchWeapon': 21,
    'positionLock': 22,
    'upgradeAll': 23,
    'towerDeathAlarm': 24,
    'stashHealthAlarm': 25,
    'disconnectAlarm': 26,
    'serverFullAlarm': 27
};

const scriptToggles = {
    ahrc: "autoharvest",
    petHeal: "ph",
    autoAim: "aa",
    autoHeal: "ah",
    petEvolve: "pe",
    petRevive: "pr",
    autoFollow: "af",
    upgradeAll: "ua",
    autoRespawn: "ar",
    autoUpgrade: "au",
    playerTrick: "pt",
    autoRebuild: "arb",
    autoTimeout: "aito",
    autoAttack: "space",
    positionLock: "pos",
    autoReconnect: "arc",
    autoAimTarget: "aat",
    autoHealSpell: "ahs",
    disconnectAlarm: "da",
    autoAimDistance: "aad",
    antiPressureBug: "apb",
    playerTrickType: "ptt",
    towerDeathAlarm: "tda",
    serverFullAlarm: "sfa",
    autoSwitchWeapon: "aws",
    stashHealthAlarm: "sha",
    upgradeTowerHealth: "uth",
};

const scriptMap = Object.fromEntries(
    Object.entries(scriptToggles).flatMap(([scriptName, acronym]) => {
        return [acronym, scriptName].map(alias => [alias.toLowerCase(), scriptName]);
    })
);

function getAcronym(acronym) {
    return scriptMap[acronym.toLowerCase()];
}

let autoFollow = false;
document.addEventListener("keypress", key => {
    if (document.activeElement.tagName.toLowerCase() == "textbox" || document.activeElement.tagName.toLowerCase() == "input" || !game.world.inWorld) return;
    if(key.code == "KeyG" && window.client?.in_session) client.toggleScript("autoFollow", { toggle: (autoFollow = !autoFollow) })
})

const handleChatMessage = (message, packet) => {
    const toggle = message.split("!").length === 2;

    const split = message.split(" ");
    const scriptName = getAcronym(split[0].replaceAll("!", ""));

    if (message.toLowerCase() === "!ping") return client.getPing();
    if (split[0].toLowerCase() === "!leave") return game.network.sendPacket(9, {name: "LeaveParty"});
    if (split[0].toLowerCase() === "!join") return game.network.sendPacket(9, { name: "JoinPartyByShareKey", partyShareKey: split[1]});

    if (!scriptName) {
        client.sendPacket(OPCODES.SEND_PACKET, packet);
        return;
    };

    switch (scriptName) {
        case 'playerTrickType':
            client.toggleScript(scriptName, { type: split[1] })
            break;
        case 'autoAimDistance':
            client.toggleScript(scriptName, { distance: +split[1] });
            break;
        case 'autoAimTarget':
            client.toggleScript(scriptName, { target: split[1] });
            break;
        case 'playerTrick':
            client.toggleScript(scriptName, { toggle: toggle, psk: !split[1] ? game.ui.playerPartyShareKey :  split[1] })
            break;
        default:
            client.toggleScript(scriptName, { toggle: toggle })
    }
}

const filter = window.filterXSS ? window.filterXSS : Sanitize;

const changeTypeList = () => {
    $("savedsessions")[0].innerHTML = ``;
    Object.values(client.sessions).filter(session => $("typeList")[0].value === 'all' ? true : session.type === $("typeList")[0].value).forEach(e => {
        $("savedsessions")[0].innerHTML += `<button class='sessions' onclick="window.client.joinSession(${e.sessionId})">[${e.sessionId}] ${filter(e.sessionName)}</button>`;
    });
}

$("typeList")[0].addEventListener('change', changeTypeList);

const handleSessions = (sessions) => {
    $("typeList")[0].innerHTML = `<option>all</option>`;
    const types = [...new Set(Object.values(sessions).map(e => e.type))];
    types.forEach(type => $("typeList")[0].innerHTML += `<option>${type}</option>`);

    Object.values(sessions).forEach(e => {
        document.getElementsByClassName("savedsessions")[0].innerHTML += `<button class='sessions' onclick="window.client.joinSession(${e.sessionId})">[${e.sessionId}] ${filter(e.sessionName)}</button>`;
    });
};

class Client {
    constructor() {
        if (window.client) return;

        this.ws = new WebSocket(serverList[$("serverList")[0].value].url);
        this.ws.binaryType = 'arraybuffer';

        this.password = serverList[$("serverList")[0].value].password;
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        window.client = this
    }
    emitPacket(opcode, packet) {
        game.network.emitter.emit(opcode, packet);
    }
    syncClient(syncNeeds) {
        // just for cross compatibility with some scripts
        game.network.socket = { readyState: 1, send: () => {} };

        for (const rpc of ["enterWorld", "buildings", "entities", "dayCycle", "partyInfo", "leaderboard", "parties", "psk"]) {
            this.emitPacket(BINCODEC_PACKETS[syncNeeds[rpc].opcode], syncNeeds[rpc]);
        }
        for (const item in syncNeeds.inventory) {
            this.emitPacket(BINCODEC_PACKETS[9], syncNeeds.inventory[item]);
        }
        for (const message of syncNeeds.messages) {
            this.emitPacket(BINCODEC_PACKETS[9], message);
        }
        game.options.serverId = syncNeeds.options.server;
        setTimeout(() => {
            this.emitPacket(BINCODEC_PACKETS[9], syncNeeds.isDead);
            if (syncNeeds.isPaused) {
                game.ui.onLocalItemUpdate({ itemName: 'Pause', tier: 1, stacks: 1 });
                game.ui.emit('wavePaused');
            }
        }, 100);
        game.network.sendPacket = (opcode, packet) => {
            if (packet.name === 'Metrics') return;
            if (opcode === undefined || packet === undefined) return;

            const encoded = new Uint8Array(game.network.codec.encode(opcode, packet));

            if (packet.name === 'SendChatMessage') {
                packet.message.split(";").forEach(message => {
                   handleChatMessage(message.trim(), Array.from(encoded))
                })
                return;
            };

            this.sendPacket(OPCODES.SEND_PACKET, Array.from(encoded));
        };
        if (window.script && script.sendPacket) script.sendPacket = game.network.sendPacket;
    }
    onMessage(msg) {
        let data = new Uint8Array(msg.data);
        const OPCODE = CLIENT_OPCODES[data[0]];
        data = data.slice(1);

        if (OPCODE === 'UPDATE_CLIENT') {
            const decodedPacket = game.network.codec.decode(data);
            this.emitPacket(BINCODEC_PACKETS[data[0]], decodedPacket);
            if (decodedPacket.opcode === 0) game.network.ticks = decodedPacket.tick;
            return;
        }

        if (OPCODE == 'SYNC_AIM') {
            game.inputPacketCreator.lastAnyYaw = +new TextDecoder().decode(data);
            return;
        }

        data = JSON.parse(new TextDecoder().decode(data));
        switch (OPCODE) {
            case 'ACCESS_VERIFIED':
                if (!data.verified) console.error('ACCESS IS DENIED');
                break;
            case 'SYNC_EXISTING_SESSIONS':
                this.sessions = data.sessions ? data.sessions : data;

                if (data.psks){
                    $('session_saver')[0].getElementsByTagName('h5')[0].innerText = data.psks.join(", ")
                }
                $("savedsessions")[0].innerHTML = ``;
                $('session_saver')[0].getElementsByTagName('h3')[0].innerText = `SESSION SAVER [${Object.values(this.sessions).length} Sockets]`
                handleSessions(this.sessions);
                break;
            case 'SYNC_CLIENT':
                this.syncClient(data);
                this.in_session = true;
                break;
            case 'CODEC':
                for (const attr in data) game.network.codec[attr] = data[attr];
                break;
            case 'JSON':
                for (const json in data) this.emitPacket(BINCODEC_PACKETS[9], { response: data[json], opcode: 9, name: json });
                break;
            case 'UPDATE_SCRIPTS':
                game.ui.components.PopupOverlay.showHint(`${data.script} got changed with attributes ${JSON.stringify(data.json)}`, 5000);
                break;
            case 'PING_TEST':
                game.ui.components.PopupOverlay.showHint(`Ping is ${data}ms`, 1500);
                break;
            default:
                console.log(data);
        }
    }
    sendPacket(opcode, data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(new Uint8Array([opcode, ...data]));
        }
    }
    encode(string) {
        return new TextEncoder().encode(string);
    }
    encodeJSON(json) {
        return this.encode(JSON.stringify(json));
    }
    toggleAutoJoin({ toggle = false, psk = undefined, serverId = undefined }) {
        if (!serverId) return window.alert('Enter a valid ServerId')
        this.sendPacket(OPCODES.TOGGLE_AUTO_JOIN, this.encodeJSON({ toggle, serverId, psk }))
    }
    toggleAutoFill({ toggle = false, serverId = undefined, name = undefined, psk = '' }) {
        if (!serverId) return window.alert('Enter a valid ServerId')
        this.sendPacket(OPCODES.TOGGLE_AUTO_FILL, this.encodeJSON({ toggle, serverId, name, psk }))
    }
    toggleBreakIn({ toggle = false, serverId = undefined, name = undefined, psk = '' }) {
        if (!serverId) return window.alert('Enter a valid ServerId')

        this.sendPacket(OPCODES.TOGGLE_AUTO_BREAK_IN, this.encodeJSON({ toggle, serverId, name, psk }))
    }
    changePassword({changedPassword = undefined, type = 'normal' }) { // type = admin, normal, view. you need to use admin password when joining the game.
        this.sendPacket(OPCODES.CHANGE_PASSWORD, this.encodeJSON({ changedPassword, type }))
    }
    toggleScript(type, additional) {
        const script_opcode = SCRIPT_OPCODES[type];
        if (additional) {
            this.sendPacket(OPCODES.TOGGLE_SCRIPTS, [script_opcode, ...this.encode(JSON.stringify(additional))])
        }
    }
    getLeaderboard() {
        this.sendPacket(OPCODES.GET_LEADERBOARDS, [])
    }
    sendVerifyConnection() {
        this.sendPacket(OPCODES.VERIFY_CONNECTION, this.encode(this.password))
    }
    sendSession({ name = 'Player', serverId = undefined, type = 'normal', sessionName = undefined, psk = undefined }) {
        if (!serverId) return window.alert('Enter a valid ServerId')

        this.sendPacket(OPCODES.SEND_SESSION, this.encodeJSON({ name, serverId, type, sessionName, psk }))
    }
    getPing() {
        this.sendPacket(OPCODES.PING_TEST, [])
    }
    joinSession(sessionId) {
        this.sendPacket(OPCODES.JOIN_SESSION, this.encode(sessionId))
    }
    closeSession(sessionId) {
        if (!sessionId || sessionId == '') return window.alert('Enter a valid SessionId')

        this.sendPacket(OPCODES.CLOSE_SESSION, this.encode(sessionId))
    }
    changeSessionType({ type = 'filler', sessionId = undefined }) {
        if (!sessionId || sessionId == '') return window.alert('Enter a valid SessionId')

        this.sendPacket(OPCODES.CHANGE_SESSION_TYPE, this.encodeJSON({ type, sessionId }))
    }
    changeSessionName({ name = undefined, sessionId = undefined }) {
        if (!sessionId || sessionId == '') return window.alert('Enter a valid SessionId')

        this.sendPacket(OPCODES.CHANGE_SESSION_NAME, this.encodeJSON({ name, sessionId }))
    }
    onOpen() {
        this.sendVerifyConnection();
    }
    onClose() {
        window.client = undefined;
        $('session_saver')[0].getElementsByTagName('h3')[0].innerText = `SESSION SAVER`;
        document.getElementsByClassName("savedsessions")[0].innerHTML = ``;
        $('session_saver')[0].getElementsByTagName('h5')[0].innerText = ``;
        $("typeList")[0].innerHTML = `<option>all</option>`;
    }
}

setInterval(() => {
    if (!window.client) (window.client = new Client())
}, 2000)

import { servers } from '../ServerList.js';
import { Session, SESSIONS } from '../MakeSession.js';

const AUTO_FILL_COOLDOWN_TICKS = 90;

function autoFill() { // every 5 seconds
    const server = servers[this.options.server];

    if (!server.autoFill || server.fillTimeout) return;

    let count = 0;
    SESSIONS.forEach(session => {
        if (session.options.server === this.options.server) {
            count++;
        }
    });

    if (count === 9) return; // max 9 sessions per server

    if (this.ticks % 100 === 0 && (!this.syncNeeds.dayCycle.response.isDay && this.pop < 32)) {
        const { name, psk } = server;
        new Session({ server: this.options.server, name, psk });
        
        server.fillTimeout = true;
        this.waitTicks(AUTO_FILL_COOLDOWN_TICKS, () => {
            server.fillTimeout = false;
        })
    }
};

export { autoFill };
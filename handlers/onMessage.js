import { onRpc } from './onRpc.js';
import { onEntity } from './onEntity.js';
import { CLIENT_OPCODES } from '../Start.js';
import { onEnterWorld } from './onEnterWorld.js';
import { wasmmodule } from '../utils/WasmModule.js';

function onMessage(msg) {
    const opcode = new Uint8Array(msg.data);
    
    switch (opcode[0]) {
        case 9:
            onRpc.call(this, this.codec.decode(msg.data));
            break;
        case 0:
            onEntity.call(this, this.codec.decode(msg.data));
            break;
        case 4:
            onEnterWorld.call(this, this.codec.decode(msg.data));
            break;
        case 10:
            this.sendPacket(10, { extra: this.codec.decode(new Uint8Array(msg.data), this.Module).extra });
            return;
        case 5:
            wasmmodule(e => {
                this.sendPacket(4, { displayName: this.options.name, extra: e[5].extra });
                this.enterWorld2 = e[6];
                this.Module = e[10];
            }, opcode, this.ipAddress);
            return;
    }
    // broadcast only 4, 0, 9 opcode packets
    this.broadCastPacket(CLIENT_OPCODES.UPDATE_CLIENT, opcode)
}

export { onMessage };
// Bincodec for decoding packets
import ByteBuffer from "bytebuffer";

let PacketIds_1 = JSON.parse('{"default":{"0":"PACKET_ENTITY_UPDATE","1":"PACKET_PLAYER_COUNTER_UPDATE","2":"PACKET_SET_WORLD_DIMENSIONS","3":"PACKET_INPUT","4":"PACKET_ENTER_WORLD","5":"PACKET_PRE_ENTER_WORLD","6":"PACKET_ENTER_WORLD2","7":"PACKET_PING","9":"PACKET_RPC","10":"PACKET_BLEND","PACKET_PRE_ENTER_WORLD":5,"PACKET_ENTER_WORLD":4,"PACKET_ENTER_WORLD2":6,"PACKET_ENTITY_UPDATE":0,"PACKET_INPUT":3,"PACKET_PING":7,"PACKET_PLAYER_COUNTER_UPDATE":1,"PACKET_RPC":9,"PACKET_SET_WORLD_DIMENSIONS":2,"PACKET_BLEND":10}}');
let e_AttributeType = JSON.parse("{\"0\":\"Uninitialized\",\"1\":\"Uint32\",\"2\":\"Int32\",\"3\":\"Float\",\"4\":\"String\",\"5\":\"Vector2\",\"6\":\"EntityType\",\"7\":\"ArrayVector2\",\"8\":\"ArrayUint32\",\"9\":\"Uint16\",\"10\":\"Uint8\",\"11\":\"Int16\",\"12\":\"Int8\",\"13\":\"Uint64\",\"14\":\"Int64\",\"15\":\"Double\",\"Uninitialized\":0,\"Uint32\":1,\"Int32\":2,\"Float\":3,\"String\":4,\"Vector2\":5,\"EntityType\":6,\"ArrayVector2\":7,\"ArrayUint32\":8,\"Uint16\":9,\"Uint8\":10,\"Int16\":11,\"Int8\":12,\"Uint64\":13,\"Int64\":14,\"Double\":15}");
let e_ParameterType = JSON.parse("{\"0\":\"Uint32\",\"1\":\"Int32\",\"2\":\"Float\",\"3\":\"String\",\"4\":\"Uint64\",\"5\":\"Int64\",\"Uint32\":0,\"Int32\":1,\"Float\":2,\"String\":3,\"Uint64\":4,\"Int64\":5}");

class BinCodec {
    constructor() {
        this.attributeMaps = {};
        this.entityTypeNames = {};
        this.rpcMaps = [];
        this.rpcMapsByName = {};
        this.sortedUidsByType = {};
        this.removedEntities = {};
        this.absentEntitiesFlags = [];
        this.updatedEntityFlags = [];
        this.startedDecoding = Date.now();
    };
    encode(name, item, Module) {
        let buffer = new ByteBuffer(100, true);
        switch (name) {
            case PacketIds_1.default.PACKET_ENTER_WORLD:
                buffer.writeUint8(PacketIds_1.default.PACKET_ENTER_WORLD);
                this.encodeEnterWorld(buffer, item);
                break;
            case PacketIds_1.default.PACKET_ENTER_WORLD2:
                buffer.writeUint8(PacketIds_1.default.PACKET_ENTER_WORLD2);
                this.encodeEnterWorld2(buffer, Module);
                break;
            case PacketIds_1.default.PACKET_INPUT:
                buffer.writeUint8(PacketIds_1.default.PACKET_INPUT);
                this.encodeInput(buffer, item);
                break;
            case PacketIds_1.default.PACKET_PING:
                buffer.writeUint8(PacketIds_1.default.PACKET_PING);
                this.encodePing(buffer, item);
                break;
            case PacketIds_1.default.PACKET_RPC:
                buffer.writeUint8(PacketIds_1.default.PACKET_RPC);
                this.encodeRpc(buffer, item);
                break;
            case PacketIds_1.default.PACKET_BLEND:
                buffer.writeUint8(PacketIds_1.default.PACKET_BLEND);
                this.encodeBlend(buffer, item);
        };
        buffer.flip();
        buffer.compact();
        return buffer.toArrayBuffer(false);
    };
    decode(data, Module) {
        let buffer = ByteBuffer.wrap(data);
        buffer.littleEndian = true;
        let opcode = buffer.readUint8();
        let decoded;
        switch (opcode) {
            case PacketIds_1.default.PACKET_PRE_ENTER_WORLD:
                decoded = this.decodePreEnterWorldResponse(buffer, Module);
                break;
            case PacketIds_1.default.PACKET_ENTER_WORLD:
                decoded = this.decodeEnterWorldResponse(buffer);
                break;
            case PacketIds_1.default.PACKET_ENTITY_UPDATE:
                decoded = this.decodeEntityUpdate(buffer);
                break;
            case PacketIds_1.default.PACKET_PING:
                decoded = this.decodePing(buffer);
                break;
            case PacketIds_1.default.PACKET_RPC:
                decoded = this.decodeRpc(buffer);
                break;
            case PacketIds_1.default.PACKET_BLEND:
                decoded = this.decodeBlend(buffer, Module);
                break;
        };
        decoded.opcode = opcode;
        return decoded;
    };
    safeReadVString(buffer) {
        let offset = buffer.offset;
        let len = buffer.readVarint32(offset);
        try {
            var func = buffer.readUTF8String.bind(buffer);
            var str = func(len.value, "b", offset += len.length);
            offset += str.length;
            buffer.offset = offset;
            return str.string;
        } catch (e) {
            offset += len.value;
            buffer.offset = offset;
            return '?';
        };
    };
    decodePreEnterWorldResponse(buffer, Module) {
        Module._MakeBlendField(255, 140);
        var extraBuffers = this.decodeBlendInternal(buffer, Module);
        return {
            extra: extraBuffers
        };
    };
    decodeEnterWorldResponse(buffer) {
        let allowed = buffer.readUint32();
        let uid = buffer.readUint32();
        let startingTick = buffer.readUint32();
        let ret = {
            allowed: allowed,
            uid: uid,
            startingTick: startingTick,
            tickRate: buffer.readUint32(),
            effectiveTickRate: buffer.readUint32(),
            players: buffer.readUint32(),
            maxPlayers: buffer.readUint32(),
            chatChannel: buffer.readUint32(),
            effectiveDisplayName: this.safeReadVString(buffer),
            x1: buffer.readInt32(),
            y1: buffer.readInt32(),
            x2: buffer.readInt32(),
            y2: buffer.readInt32()
        };
        let attributeMapCount = buffer.readUint32();
        this.attributeMaps = {};
        this.entityTypeNames = {};
        for (let i = 0; i < attributeMapCount; i++) {
            let attributeMap = [];
            let entityType = buffer.readUint32();
            let entityTypeString = buffer.readVString();
            let attributeCount = buffer.readUint32();
            for (let j = 0; j < attributeCount; j++) {
                let name_1 = buffer.readVString();
                let type = buffer.readUint32();
                attributeMap.push({
                    name: name_1,
                    type: type
                });
            };
            this.attributeMaps[entityType] = attributeMap;
            this.entityTypeNames[entityType] = entityTypeString;
            this.sortedUidsByType[entityType] = [];
        };
        let rpcCount = buffer.readUint32();
        this.rpcMaps = [];
        this.rpcMapsByName = {};
        for (let i = 0; i < rpcCount; i++) {
            let rpcName = buffer.readVString();
            let paramCount = buffer.readUint8();
            let isArray = buffer.readUint8() != 0;
            let parameters = [];
            for (let j = 0; j < paramCount; j++) {
                let paramName = buffer.readVString();
                let paramType = buffer.readUint8();
                parameters.push({
                    name: paramName,
                    type: paramType
                });
            };
            let rpc = {
                name: rpcName,
                parameters: parameters,
                isArray: isArray,
                index: this.rpcMaps.length
            };
            this.rpcMaps.push(rpc);
            this.rpcMapsByName[rpcName] = rpc;
        };
        return ret;
    };
    decodeEntityUpdate(buffer) {
        let tick = buffer.readUint32();
        let removedEntityCount = buffer.readVarint32();
        const entityUpdateData = {};
        entityUpdateData.tick = tick;
        entityUpdateData.entities = new Map();
        let rE = Object.keys(this.removedEntities);
        for (let i = 0; i < rE.length; i++) {
            delete this.removedEntities[rE[i]];
        };
        for (let i = 0; i < removedEntityCount; i++) {
            var uid = buffer.readUint32();
            this.removedEntities[uid] = 1;
        };
        let brandNewEntityTypeCount = buffer.readVarint32();
        for (let i = 0; i < brandNewEntityTypeCount; i++) {
            var brandNewEntityCountForThisType = buffer.readVarint32();
            var brandNewEntityType = buffer.readUint32();
            for (var j = 0; j < brandNewEntityCountForThisType; j++) {
                var brandNewEntityUid = buffer.readUint32();
                this.sortedUidsByType[brandNewEntityType].push(brandNewEntityUid);
            };
        };
        let SUBT = Object.keys(this.sortedUidsByType);
        for (let i = 0; i < SUBT.length; i++) {
            let table = this.sortedUidsByType[SUBT[i]];
            let newEntityTable = [];
            for (let j = 0; j < table.length; j++) {
                let uid = table[j];
                if (!(uid in this.removedEntities)) {
                    newEntityTable.push(uid);
                };
            };
            newEntityTable.sort((a, b) => a - b);
            this.sortedUidsByType[SUBT[i]] = newEntityTable;
        };
        while (buffer.remaining()) {
            let entityType = buffer.readUint32();
            if (!(entityType in this.attributeMaps)) {
                throw new Error('Entity type is not in attribute map: ' + entityType);
            };
            let absentEntitiesFlagsLength = Math.floor((this.sortedUidsByType[entityType].length + 7) / 8);
            this.absentEntitiesFlags.length = 0;
            for (let i = 0; i < absentEntitiesFlagsLength; i++) {
                this.absentEntitiesFlags.push(buffer.readUint8());
            };
            let attributeMap = this.attributeMaps[entityType];
            for (let tableIndex = 0; tableIndex < this.sortedUidsByType[entityType].length; tableIndex++) {
                let uid = this.sortedUidsByType[entityType][tableIndex];
                if ((this.absentEntitiesFlags[Math.floor(tableIndex / 8)] & (1 << (tableIndex % 8))) !== 0) {
                    entityUpdateData.entities.set(uid, true);
                    continue;
                };
                var player = {
                    uid: uid
                };
                this.updatedEntityFlags.length = 0;
                for (let j = 0; j < Math.ceil(attributeMap.length / 8); j++) {
                    this.updatedEntityFlags.push(buffer.readUint8());
                };
                for (let j = 0; j < attributeMap.length; j++) {
                    let attribute = attributeMap[j];
                    let flagIndex = Math.floor(j / 8);
                    let bitIndex = j % 8;
                    let count = void 0;
                    let v = [];
                    if (this.updatedEntityFlags[flagIndex] & (1 << bitIndex)) {
                        switch (attribute.type) {
                            case e_AttributeType.Uint32:
                                player[attribute.name] = buffer.readUint32();
                                break;
                            case e_AttributeType.Int32:
                                player[attribute.name] = buffer.readInt32();
                                break;
                            case e_AttributeType.Float:
                                player[attribute.name] = buffer.readInt32() / 100;
                                break;
                            case e_AttributeType.String:
                                player[attribute.name] = this.safeReadVString(buffer);
                                break;
                            case e_AttributeType.Vector2:
                                var x = buffer.readInt32() / 100;
                                var y = buffer.readInt32() / 100;
                                player[attribute.name] = {
                                    x: x,
                                    y: y
                                };
                                break;
                            case e_AttributeType.ArrayVector2:
                                count = buffer.readInt32();
                                v = [];
                                for (let i = 0; i < count; i++) {
                                    let x_1 = buffer.readInt32() / 100;
                                    let y_1 = buffer.readInt32() / 100;
                                    v.push({
                                        x: x_1,
                                        y: y_1
                                    });
                                };
                                player[attribute.name] = v;
                                break;
                            case e_AttributeType.ArrayUint32:
                                count = buffer.readInt32();
                                v = [];
                                for (let i = 0; i < count; i++) {
                                    let element = buffer.readInt32();
                                    v.push(element);
                                };
                                player[attribute.name] = v;
                                break;
                            case e_AttributeType.Uint16:
                                player[attribute.name] = buffer.readUint16();
                                break;
                            case e_AttributeType.Uint8:
                                player[attribute.name] = buffer.readUint8();
                                break;
                            case e_AttributeType.Int16:
                                player[attribute.name] = buffer.readInt16();
                                break;
                            case e_AttributeType.Int8:
                                player[attribute.name] = buffer.readInt8();
                                break;
                            case e_AttributeType.Uint64:
                                player[attribute.name] = buffer.readUint32() + buffer.readUint32() * 4294967296;
                                break;
                            case e_AttributeType.Int64:
                                var s64 = buffer.readUint32();
                                var s642 = buffer.readInt32();
                                if (s642 < 0) {
                                    s64 *= -1;
                                };
                                s64 += s642 * 4294967296;
                                player[attribute.name] = s64;
                                break;
                            case e_AttributeType.Double:
                                var s64d = buffer.readUint32();
                                var s64d2 = buffer.readInt32();
                                if (s64d2 < 0) {
                                    s64d *= -1;
                                };
                                s64d += s64d2 * 4294967296;
                                s64d = s64d / 100;
                                player[attribute.name] = s64d;
                                break;
                            default:
                                throw new Error('Unsupported attribute type: ' + attribute.type);
                        };
                    };
                };
                entityUpdateData.entities.set(player.uid, player);
            };
        };
        entityUpdateData.byteSize = buffer.capacity();
        return entityUpdateData;
    };
    decodePing() {
        return {};
    };
    encodeRpc(buffer, item) {
        if (!(item.name in this.rpcMapsByName)) {
            throw new Error('RPC not in map: ' + item.name);
        };
        var rpc = this.rpcMapsByName[item.name];
        buffer.writeUint32(rpc.index);
        for (var i = 0; i < rpc.parameters.length; i++) {
            var param = item[rpc.parameters[i].name];
            switch (rpc.parameters[i].type) {
                case e_ParameterType.Float:
                    buffer.writeInt32(Math.floor(param * 100.0));
                    break;
                case e_ParameterType.Int32:
                    buffer.writeInt32(param);
                    break;
                case e_ParameterType.String:
                    buffer.writeVString(param);
                    break;
                case e_ParameterType.Uint32:
                    buffer.writeUint32(param);
                    break;
            };
        };
    };
    decodeBlend(buffer, Module) {
        var extraBuffers = this.decodeBlendInternal(buffer, Module);
        return {
            extra: extraBuffers
        };
    };
    decodeBlendInternal(buffer, Module) {
        Module._MakeBlendField(24, 132);
        for (let firstSync = Module._MakeBlendField(228, buffer.remaining()), i = 0; buffer.remaining();)
            Module.HEAPU8[firstSync + i] = buffer.readUint8(), i++;
        Module._MakeBlendField(172, 36);
        var extraBuffers = new ArrayBuffer(64);
        var exposedBuffers = new Uint8Array(extraBuffers);
        for (var secondSync = Module._MakeBlendField(4, 152), i = 0; i < 64; i++) {
            exposedBuffers[i] = Module.HEAPU8[secondSync + i];
        };
        return extraBuffers;
    };
    decodeRpcObject(buffer, parameters) {
        var result = {};
        for (var i = 0; i < parameters.length; i++) {
            switch (parameters[i].type) {
                case e_ParameterType.Uint32:
                    result[parameters[i].name] = buffer.readUint32();
                    break;
                case e_ParameterType.Int32:
                    result[parameters[i].name] = buffer.readInt32();
                    break;
                case e_ParameterType.Float:
                    result[parameters[i].name] = buffer.readInt32() / 100.0;
                    break;
                case e_ParameterType.String:
                    result[parameters[i].name] = this.safeReadVString(buffer);
                    break;
                case e_ParameterType.Uint64:
                    result[parameters[i].name] = buffer.readUint32() + buffer.readUint32() * 4294967296;
                    break;
            };
        };
        return result;
    };
    decodeRpc(buffer) {
        var rpcIndex = buffer.readUint32();
        var rpc = this.rpcMaps[rpcIndex];
        var result = {
            name: rpc.name,
            response: null
        };
        if (!rpc.isArray) {
            result.response = this.decodeRpcObject(buffer, rpc.parameters);
        } else {
            var response = [];
            var count = buffer.readUint16();
            for (var i = 0; i < count; i++) {
                response.push(this.decodeRpcObject(buffer, rpc.parameters));
            };
            result.response = response;
        };
        return result;
    };
    encodeBlend(buffer, item) {
        for (var e = new Uint8Array(item.extra), i = 0; i < item.extra.byteLength; i++)
            buffer.writeUint8(e[i]);
    };
    encodeEnterWorld(buffer, item) {
        buffer.writeVString(item.displayName);
        for (var e = new Uint8Array(item.extra), i = 0; i < item.extra.byteLength; i++)
            buffer.writeUint8(e[i]);
    };
    encodeEnterWorld2(buffer, Module) {
        var managementcommandsdns = Module._MakeBlendField(187, 22);
        for (var siteName = 0; siteName < 16; siteName++) {
            buffer.writeUint8(Module.HEAPU8[managementcommandsdns + siteName]);
        };
    };
    encodeInput(buffer, item) {
        buffer.writeVString(JSON.stringify(item));
    };
    encodePing(buffer) {
        buffer.writeUint8(0);
    };
};

export default BinCodec;

import fs from 'node:fs';
import BinCodec from './BinCodec.js';

const codec = new BinCodec();

let wasmbuffers = [];

fs.readFile('./zombs_wasm.wasm', (err, data) => {
    wasmbuffers = data;
})

const wasmmodule = (callback, data_12, hostname) => {
    function _0x364d84$jscomp$0(item, value, i) {
        var check = value + i;
        var input = value;
        for (; item[input] && !(input >= check);) {
            ++input;
        };
        if (input - value > 16 && item.subarray && _0x30c1b5$jscomp$0) {
            return _0x30c1b5$jscomp$0.decode(item.subarray(value, input));
        };
        var segmentedId = "";
        for (; value < input;) {
            let i = item[value++];
            if (128 & i) {
                var b1 = 63 & item[value++];
                if (192 != (224 & i)) {
                    var _0x4e8ea1 = 63 & item[value++];
                    if (i = 224 == (240 & i) ? (15 & i) << 12 | b1 << 6 | _0x4e8ea1 : (7 & i) << 18 | b1 << 12 | _0x4e8ea1 << 6 | 63 & item[value++], i < 65536) {
                        segmentedId = segmentedId + String.fromCharCode(i);
                    } else {
                        var snI = i - 65536;
                        segmentedId = segmentedId + String.fromCharCode(55296 | snI >> 10, 56320 | 1023 & snI);
                    };
                } else {
                    segmentedId = segmentedId + String.fromCharCode((31 & i) << 6 | b1);
                };
            } else {
                segmentedId = segmentedId + String.fromCharCode(i);
            };
        };
        return segmentedId;
    };
    function _0x18d59e$jscomp$0(value, left) {
        return value ? _0x364d84$jscomp$0(_0x2c159b$jscomp$0, value, left) : "";
    };
    function _0x710b07$jscomp$0(text, value, key, code) {
        if (!(code > 0)) {
            return 0;
        };
        var KEY0 = key;
        var c = key + code - 1;
        var i = 0;
        for (; i < text.length; ++i) {
            var character = text.charCodeAt(i);
            if (character >= 55296 && character <= 57343) {
                var _0x216e31 = text.charCodeAt(++i);
                character = 65536 + ((1023 & character) << 10) | 1023 & _0x216e31;
            };
            if (character <= 127) {
                if (key >= c) {
                    break;
                };
                value[key++] = character;
            } else {
                if (character <= 2047) {
                    if (key + 1 >= c) {
                        break;
                    };
                    value[key++] = 192 | character >> 6;
                    value[key++] = 128 | 63 & character;
                } else {
                    if (character <= 65535) {
                        if (key + 2 >= c) {
                            break;
                        };
                        value[key++] = 224 | character >> 12;
                        value[key++] = 128 | character >> 6 & 63;
                        value[key++] = 128 | 63 & character;
                    } else {
                        if (key + 3 >= c) {
                            break;
                        };
                        value[key++] = 240 | character >> 18;
                        value[key++] = 128 | character >> 12 & 63;
                        value[key++] = 128 | character >> 6 & 63;
                        value[key++] = 128 | 63 & character;
                    };
                };
            };
        };
        return value[key] = 0,
            key - KEY0;
    };
    function _0x36268d$jscomp$0(message, initialValue, params) {
        return _0x710b07$jscomp$0(message, _0x2c159b$jscomp$0, initialValue, params);
    };
    function _0xaf9b5$jscomp$0(text) {
        var _0x41d111 = 0;
        var i = 0;
        for (; i < text.length; ++i) {
            var $sendIcon = text.charCodeAt(i);
            if ($sendIcon >= 55296 && $sendIcon <= 57343) {
                $sendIcon = 65536 + ((1023 & $sendIcon) << 10) | 1023 & text.charCodeAt(++i);
            };
            if ($sendIcon <= 127) {
                ++_0x41d111;
            } else {
                _0x41d111 = _0x41d111 + ($sendIcon <= 2047 ? 2 : $sendIcon <= 65535 ? 3 : 4);
            };
        };
        return _0x41d111;
    };
    function _0x45ab50$jscomp$0(untypedElevationArray) {
        _0x4f7d64$jscomp$0.HEAP32 = _0x2917ec$jscomp$0 = new Int32Array(untypedElevationArray);
        _0x4f7d64$jscomp$0.HEAPU8 = _0x2c159b$jscomp$0 = new Uint8Array(untypedElevationArray);
    };
    function _0x55729a$jscomp$0() {
        function test(component) {
            _0x4f7d64$jscomp$0.asm = component.exports;
            _0x45ab50$jscomp$0(_0x4f7d64$jscomp$0.asm.g.buffer);
            _0x33e8b7$jscomp$0();
            _0x1e5f8d$jscomp$0();
        };
        function id(fn) {
            test(fn.instance);
        };
        function instantiate(id) {
            WebAssembly.instantiate(wasmbuffers, locals).then(fn => {
                id(fn);
                typeof callback === "function" && callback(_0x4f7d64$jscomp$0.decodeOpcode5(hostname, data_12));
            });
        };
        var locals = {
            "a": {
                "d": () => { },
                "e": () => { },
                "c": _0x2db992$jscomp$0,
                "f": () => { },
                "b": _0x1cbea8$jscomp$0,
                "a": () => { }
            }
        };
        if (_0x4f7d64$jscomp$0.instantiateWasm) {
            try {
                return _0x4f7d64$jscomp$0.instantiateWasm(locals, test);
            } catch (_0xe87ddd) {
                return console.log("Module.instantiateWasm callback failed with error: " + _0xe87ddd), false;
            };
        };
        instantiate(id);
        return {};
    };
    function _0x2db992$jscomp$0(_0x264e37$jscomp$0) {
        let e = _0x18d59e$jscomp$0(_0x264e37$jscomp$0);
        if (e.includes('typeof window === "undefined" ? 1 : 0;')) {
            return 0;
        };
        if (e.includes("typeof process !== 'undefined' ? 1 : 0;")) {
            return 0;
        };
        if (e.includes('Game.currentGame.network.connected ? 1 : 0')) {
            return 1;
        };
        if (e.includes('Game.currentGame.world.myUid === null ? 0 : Game.currentGame.world.myUid;')) {
            return 0;
        };
        if (e.includes('document.getElementById("hud").children.length;')) {
            return 24;
        };
        if (e.includes("hostname")) {
            return hostname;
        };
    };
    function _0x1cbea8$jscomp$0(_0xdcd74c$jscomp$0) {
        var _0x49bfc6$jscomp$0 = hostname;
        if (null == _0x49bfc6$jscomp$0) return 0;
        _0x49bfc6$jscomp$0 = String(_0x49bfc6$jscomp$0);
        var _0x1bcee7$jscomp$0 = _0x1cbea8$jscomp$0;
        var _0x5383b2$jscomp$0 = _0xaf9b5$jscomp$0(_0x49bfc6$jscomp$0);
        return (!_0x1bcee7$jscomp$0.bufferSize ||
            _0x1bcee7$jscomp$0.bufferSize < _0x5383b2$jscomp$0 + 1) &&
            (_0x1bcee7$jscomp$0.bufferSize &&
                _0x620aa9$jscomp$0(_0x1bcee7$jscomp$0.buffer),
                _0x1bcee7$jscomp$0.bufferSize = _0x5383b2$jscomp$0 + 1,
                _0x1bcee7$jscomp$0.buffer = _0x141790$jscomp$0(_0x1bcee7$jscomp$0.bufferSize)),
            _0x36268d$jscomp$0(_0x49bfc6$jscomp$0, _0x1bcee7$jscomp$0.buffer, _0x1bcee7$jscomp$0.bufferSize),
            _0x1bcee7$jscomp$0.buffer;
    };
    function _0x1e5f8d$jscomp$0() {
        _0x2917ec$jscomp$0[1328256] = 5313008;
        _0x2917ec$jscomp$0[1328257] = 0;
        try {
            _0x4f7d64$jscomp$0._main(1, 5313024);
        } finally { };
    };
    var _0x4f7d64$jscomp$0 = {};
    var _0x30c1b5$jscomp$0 = new TextDecoder("utf8");
    var _0x2c159b$jscomp$0;
    var _0x2917ec$jscomp$0;
    _0x55729a$jscomp$0();
    var _0x33e8b7$jscomp$0 = _0x4f7d64$jscomp$0.___wasm_call_ctors = function () {
        return (_0x33e8b7$jscomp$0 = _0x4f7d64$jscomp$0.___wasm_call_ctors = _0x4f7d64$jscomp$0.asm.h).apply(null, arguments);
    };
    var _0x6f9ca9$jscomp$0 = _0x4f7d64$jscomp$0._main = function () {
        return (_0x6f9ca9$jscomp$0 = _0x4f7d64$jscomp$0._main = _0x4f7d64$jscomp$0.asm.i).apply(null, arguments);
    };
    var _0x1d0522$jscomp$0 = _0x4f7d64$jscomp$0._MakeBlendField = function () {
        return (_0x1d0522$jscomp$0 = _0x4f7d64$jscomp$0._MakeBlendField = _0x4f7d64$jscomp$0.asm.j).apply(null, arguments);
    };
    var _0x141790$jscomp$0 = _0x4f7d64$jscomp$0._malloc = function () {
        return (_0x141790$jscomp$0 = _0x4f7d64$jscomp$0._malloc = _0x4f7d64$jscomp$0.asm.l).apply(null, arguments);
    };
    var _0x620aa9$jscomp$0 = _0x4f7d64$jscomp$0._free = function () {
        return (_0x620aa9$jscomp$0 = _0x4f7d64$jscomp$0._free = _0x4f7d64$jscomp$0.asm.m).apply(null, arguments);
    };
    _0x4f7d64$jscomp$0.decodeOpcode5 = function (hostname, extra) {
        _0x4f7d64$jscomp$0.hostname = hostname;
        let DecodedOpcode5 = codec.decode(new Uint8Array(extra), _0x4f7d64$jscomp$0);
        let EncodedEnterWorld2 = codec.encode(6, {}, _0x4f7d64$jscomp$0);
        return {
            5: DecodedOpcode5,
            6: EncodedEnterWorld2,
            10: _0x4f7d64$jscomp$0
        };
    };
    return _0x4f7d64$jscomp$0;
};

export { wasmmodule };
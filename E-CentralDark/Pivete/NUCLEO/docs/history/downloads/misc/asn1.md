# OUTRO - asn1.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\jose\dist\webapi\lib\asn1.js
**SHA:** 6cf78019642ea156
**Timestamp:** 2026-08-26T19:32:21.734285
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const algIdStart = state.pos;
- const algIdStart = state.pos;
- const spkiStart = state.pos;

### Ouro Bruto (primeiros 5000 chars)
```
import { invalidKeyInput } from './invalid_key_input.js';
import { encodeBase64, decodeBase64 } from '../lib/base64.js';
import { JOSENotSupported } from '../util/errors.js';
import { isCryptoKey, isKeyObject } from './is_key_like.js';
const formatPEM = (b64, descriptor) => {
    const newlined = (b64.match(/.{1,64}/g) || []).join('\n');
    return `-----BEGIN ${descriptor}-----\n${newlined}\n-----END ${descriptor}-----`;
};
const genericExport = async (keyType, keyFormat, key) => {
    if (isKeyObject(key)) {
        if (key.type !== keyType) {
            throw new TypeError(`key is not a ${keyType} key`);
        }
        return key.export({ format: 'pem', type: keyFormat });
    }
    if (!isCryptoKey(key)) {
        throw new TypeError(invalidKeyInput(key, 'CryptoKey', 'KeyObject'));
    }
    if (!key.extractable) {
        throw new TypeError('CryptoKey is not extractable');
    }
    if (key.type !== keyType) {
        throw new TypeError(`key is not a ${keyType} key`);
    }
    return formatPEM(encodeBase64(new Uint8Array(await crypto.subtle.exportKey(keyFormat, key))), `${keyType.toUpperCase()} KEY`);
};
export const toSPKI = (key) => genericExport('public', 'spki', key);
export const toPKCS8 = (key) => genericExport('private', 'pkcs8', key);
const bytesEqual = (a, b) => {
    if (a.byteLength !== b.length)
        return false;
    for (let i = 0; i < a.byteLength; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
};
const createASN1State = (data) => ({ data, pos: 0 });
const parseLength = (state) => {
    const first = state.data[state.pos++];
    if (first & 0x80) {
        const lengthOfLen = first & 0x7f;
        let length = 0;
        for (let i = 0; i < lengthOfLen; i++) {
            length = (length << 8) | state.data[state.pos++];
        }
        return length;
    }
    return first;
};
const skipElement = (state, count = 1) => {
    if (count <= 0)
        return;
    state.pos++;
    const length = parseLength(state);
    state.pos += length;
    if (count > 1) {
        skipElement(state, count - 1);
    }
};
const expectTag = (state, expectedTag, errorMessage) => {
    if (state.data[state.pos++] !== expectedTag) {
        throw new Error(errorMessage);
    }
};
const getSubarray = (state, length) => {
    const result = state.data.subarray(state.pos, state.pos + length);
    state.pos += length;
    return result;
};
const parseAlgorithmOID = (state) => {
    expectTag(state, 0x06, 'Expected algorithm OID');
    const oidLen = parseLength(state);
    return getSubarray(state, oidLen);
};
function parsePKCS8Header(state) {
    expectTag(state, 0x30, 'Invalid PKCS#8 structure');
    parseLength(state);
    expectTag(state, 0x02, 'Expected version field');
    const verLen = parseLength(state);
    state.pos += verLen;
    expectTag(state, 0x30, 'Expected algorithm identifier');
    const algIdLen = parseLength(state);
    const algIdStart = state.pos;
    return { algIdStart, algIdLength: algIdLen };
}
function parseSPKIHeader(state) {
    expectTag(state, 0x30, 'Invalid SPKI structure');
    parseLength(state);
    expectTag(state, 0x30, 'Expected algorithm identifier');
    const algIdLen = parseLength(state);
    const algIdStart = state.pos;
    return { algIdStart, algIdLength: algIdLen };
}
const parseECAlgorithmIdentifier = (state) => {
    const algOid = parseAlgorithmOID(state);
    if (bytesEqual(algOid, [0x2b, 0x65, 0x6e])) {
        return 'X25519';
    }
    if (!bytesEqual(algOid, [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01])) {
        throw new Error('Unsupported key algorithm');
    }
    expectTag(state, 0x06, 'Expected curve OID');
    const curveOidLen = parseLength(state);
    const curveOid = getSubarray(state, curveOidLen);
    for (const { name, oid } of [
        { name: 'P-256', oid: [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07] },
        { name: 'P-384', oid: [0x2b, 0x81, 0x04, 0x00, 0x22] },
        { name: 'P-521', oid: [0x2b, 0x81, 0x04, 0x00, 0x23] },
    ]) {
        if (bytesEqual(curveOid, oid)) {
            return name;
        }
    }
    throw new Error('Unsupported named curve');
};
const genericImport = async (keyFormat, keyData, alg, options) => {
    let algorithm;
    let keyUsages;
    const isPublic = keyFormat === 'spki';
    const getSigUsages = () => (isPublic ? ['verify'] : ['sign']);
    const getEncUsages = () => isPublic ? ['encrypt', 'wrapKey'] : ['decrypt', 'unwrapKey'];
    switch (alg) {
        case 'PS256':
        case 'PS384':
        case 'PS512':
            algorithm = { name: 'RSA-PSS', hash: `SHA-${alg.slice(-3)}` };
            keyUsages = getSigUsages();
            break;
        case 'RS256':
        case 'RS384':
        case 'RS512':
            algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: `SHA-${alg.slice(-3)}` };
            keyUsages = getSigUsages();
            break;
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-
```

---

# OUTRO - asn1.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\jose@6.2.10@@@1\dist\webapi\lib\asn1.js
**SHA:** 396dd811f6a8be03
**Timestamp:** 2026-08-28T02:24:43.843061
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const spkiStart = state.pos;

### Ouro Bruto (primeiros 5000 chars)
```
import { invalidKeyInput } from './invalid_key_input.js';
import { encodeBase64, decodeBase64 } from '../lib/base64.js';
import { JOSENotSupported } from '../util/errors.js';
import { keyAlgorithm, unsupportedAlg, algArgument } from './key_algorithm.js';
import { isCryptoKey, isKeyObject } from './is_key_like.js';
import { validateExtractableOption } from './key_options.js';
const formatPEM = (b64, descriptor) => {
    const newlined = (b64.match(/.{1,64}/g) || []).join('\n');
    return `-----BEGIN ${descriptor}-----\n${newlined}\n-----END ${descriptor}-----`;
};
const genericExport = async (keyType, keyFormat, key) => {
    if (isKeyObject(key)) {
        if (key.type !== keyType) {
            throw new TypeError(`key is not a ${keyType} key`);
        }
        return key.export({ format: 'pem', type: keyFormat });
    }
    if (!isCryptoKey(key)) {
        throw new TypeError(invalidKeyInput(key, 'CryptoKey', 'KeyObject'));
    }
    if (!key.extractable) {
        throw new TypeError('CryptoKey is not extractable');
    }
    if (key.type !== keyType) {
        throw new TypeError(`key is not a ${keyType} key`);
    }
    return formatPEM(encodeBase64(new Uint8Array(await crypto.subtle.exportKey(keyFormat, key))), `${keyType.toUpperCase()} KEY`);
};
export const toSPKI = (key) => genericExport('public', 'spki', key);
export const toPKCS8 = (key) => genericExport('private', 'pkcs8', key);
const bytesEqual = (a, b) => {
    if (a.byteLength !== b.length)
        return false;
    for (let i = 0; i < a.byteLength; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
};
const createASN1State = (data) => ({ data, pos: 0 });
const readByte = (state) => {
    const byte = state.data[state.pos++];
    if (byte === undefined) {
        throw new Error('Unexpected end of ASN.1 input');
    }
    return byte;
};
const parseLength = (state) => {
    const first = readByte(state);
    if (first & 0x80) {
        const lengthOfLen = first & 0x7f;
        let length = 0;
        for (let i = 0; i < lengthOfLen; i++) {
            length = (length << 8) | readByte(state);
        }
        return length;
    }
    return first;
};
const skipElement = (state, count = 1) => {
    while (count-- > 0) {
        state.pos++;
        const length = parseLength(state);
        state.pos += length;
    }
};
const expectTag = (state, expectedTag, errorMessage) => {
    if (readByte(state) !== expectedTag) {
        throw new Error(errorMessage);
    }
};
const getSubarray = (state, length) => {
    if (length < 0 || state.pos + length > state.data.length) {
        throw new Error('Unexpected end of ASN.1 input');
    }
    const result = state.data.subarray(state.pos, state.pos + length);
    state.pos += length;
    return result;
};
const parseAlgorithmOID = (state) => {
    expectTag(state, 0x06, 'Expected algorithm OID');
    const oidLen = parseLength(state);
    return getSubarray(state, oidLen);
};
function parseKeyHeader(state, keyFormat) {
    expectTag(state, 0x30, `Invalid ${keyFormat === 'spki' ? 'SPKI' : 'PKCS#8'} structure`);
    parseLength(state);
    if (keyFormat === 'pkcs8') {
        expectTag(state, 0x02, 'Expected version field');
        const length = parseLength(state);
        state.pos += length;
    }
    expectTag(state, 0x30, 'Expected algorithm identifier');
    parseLength(state);
}
const parseECAlgorithmIdentifier = (state) => {
    const algOid = parseAlgorithmOID(state);
    if (bytesEqual(algOid, [0x2b, 0x65, 0x6e])) {
        return 'X25519';
    }
    if (!bytesEqual(algOid, [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01])) {
        throw new Error('Unsupported key algorithm');
    }
    expectTag(state, 0x06, 'Expected curve OID');
    const curveOidLen = parseLength(state);
    const curveOid = getSubarray(state, curveOidLen);
    if (bytesEqual(curveOid, [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07]))
        return 'P-256';
    if (bytesEqual(curveOid, [0x2b, 0x81, 0x04, 0x00, 0x22]))
        return 'P-384';
    if (bytesEqual(curveOid, [0x2b, 0x81, 0x04, 0x00, 0x23]))
        return 'P-521';
    throw new Error('Unsupported named curve');
};
const genericImport = async (keyFormat, keyData, alg, options) => {
    const extractable = validateExtractableOption(options?.extractable);
    const entry = keyAlgorithm(alg, algArgument);
    if (entry.secret) {
        unsupportedAlg(algArgument);
    }
    const isPublic = keyFormat === 'spki';
    let algorithm;
    if (entry.resolve) {
        try {
            const state = createASN1State(keyData);
            parseKeyHeader(state, keyFormat);
            algorithm = entry.resolve({ crv: parseECAlgorithmIdentifier(state) });
        }
        catch {
            throw new JOSENotSupported('Invalid or unsupported key format');
        }
    }
    else {
        algorithm = entry.subtle;
    }
    return crypto.subtle.importKey(keyFormat, keyData, algorithm, extractable ?? isPublic, entry.usages[isPublic ? 0 :
```
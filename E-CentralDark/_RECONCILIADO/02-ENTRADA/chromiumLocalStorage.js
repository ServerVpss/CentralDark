/**
 * chromiumLocalStorage — leitor puro-JS (sem deps, sem Snappy) de UMA chave do
 * Local Storage de um app Chromium/Electron, lendo direto os arquivos .log do
 * leveldb. Usado na migração Electron→Tauri: o webview do Tauri tem localStorage
 * próprio (vazio), então o histórico de missões (Zustand persist
 * 'overclock-app-missions') é puxado do leveldb do Electron no 1º launch.
 *
 * Por que só os .log: o WAL (.log) guarda os valores NÃO-comprimidos; os .ldb
 * (sstables) são Snappy-comprimidos (precisariam de decompressor). localStorage
 * reescreve o blob inteiro a cada mudança → o valor mais recente está no .log.
 * `readFileSync` lê os bytes mesmo com o Electron aberto (o lock do leveldb é só
 * para writers). Se o valor tiver migrado pro .ldb e o .log rotacionado, retorna
 * null (degradação graciosa — sem migração, não corrompe nada).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const LOG_BLOCK = 32768;
const LOG_HEADER = 7; // crc32(4) + length(2) + type(1)
/** De-frame um arquivo de log do leveldb: remove os headers de record (que o
 * leveldb insere a cada bloco de 32KB) e concatena os payloads, reconstruindo o
 * stream contínuo do WriteBatch. */
function deframeLog(buf) {
    const out = [];
    for (let base = 0; base < buf.length; base += LOG_BLOCK) {
        let off = base;
        const blockEnd = Math.min(base + LOG_BLOCK, buf.length);
        while (off + LOG_HEADER <= blockEnd) {
            const len = buf.readUInt16LE(off + 4);
            const type = buf[off + 6];
            if (type === 0 && len === 0)
                break; // zero-padding no fim do bloco
            const dataStart = off + LOG_HEADER;
            const dataEnd = dataStart + len;
            if (dataEnd > buf.length)
                break;
            out.push(buf.subarray(dataStart, dataEnd));
            off = dataEnd;
        }
    }
    return Buffer.concat(out);
}
/** Lê um varint little-endian (base-128) a partir de `pos`. Retorna [valor, próximaPos]. */
function readVarint(buf, pos) {
    let result = 0;
    let shift = 0;
    let p = pos;
    while (p < buf.length) {
        const byte = buf[p];
        result |= (byte & 0x7f) << shift;
        p += 1;
        if ((byte & 0x80) === 0)
            break;
        shift += 7;
    }
    return [result >>> 0, p];
}
/**
 * Retorna o valor (string) de uma chave do localStorage, ou null se não achar.
 * @param leveldbDir diretório `.../Local Storage/leveldb`
 * @param storageKey nome da chave (ex.: 'overclock-app-missions')
 */
export function readLocalStorageValue(leveldbDir, storageKey) {
    let logs;
    try {
        logs = readdirSync(leveldbDir).filter((f) => f.endsWith('.log')).sort();
    }
    catch {
        return null;
    }
    if (logs.length === 0)
        return null;
    const keyBuf = Buffer.from(storageKey, 'latin1');
    let best = null;
    for (const f of logs) {
        let flat;
        try {
            flat = deframeLog(readFileSync(join(leveldbDir, f)));
        }
        catch {
            continue;
        }
        // Última ocorrência da chave = escrita mais recente.
        let idx = -1;
        let from = -1;
        while ((from = flat.indexOf(keyBuf, from + 1)) >= 0)
            idx = from;
        if (idx < 0)
            continue;
        const afterKey = idx + keyBuf.length;
        const [valueLen, vpos] = readVarint(flat, afterKey);
        if (valueLen <= 1 || vpos + valueLen > flat.length)
            continue;
        const version = flat[vpos];
        const data = flat.subarray(vpos + 1, vpos + valueLen); // valueLen inclui o version byte
        // Chromium: 0x00 = UTF-16LE, 0x01 = Latin-1 (1 byte/char). Fallback utf8.
        const decoded = version === 0 ? data.toString('utf16le') : version === 1 ? data.toString('latin1') : data.toString('utf8');
        // Sanidade: tem que parsear como JSON (o blob do Zustand persist).
        try {
            JSON.parse(decoded);
            best = decoded;
        }
        catch {
            // valor corrompido (write em andamento / framing) → ignora este .log
        }
    }
    return best;
}
//# sourceMappingURL=chromiumLocalStorage.js.map
# OUTRO - buffer.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@types\node\buffer.d.ts
**SHA:** 6a0cd27e5dc2cfbe
**Timestamp:** 2026-08-26T19:32:04.289492
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * @param [start=0] The byte offset to start decoding at.
- * @param [targetStart=0] The offset within `target` at which to begin comparison.
- * @param [sourceStart=0] The offset within `buf` at which to begin comparison.
- * @param [targetStart=0] The offset within `target` at which to begin writing.
- * @param [sourceStart=0] The offset within `buf` from which to begin copying.

### Ouro Bruto (primeiros 5000 chars)
```
// If lib.dom.d.ts or lib.webworker.d.ts is loaded, then use the global types.
// Otherwise, use the types from node.
type _Blob = typeof globalThis extends { onmessage: any; Blob: any } ? {} : import("buffer").Blob;
type _File = typeof globalThis extends { onmessage: any; File: any } ? {} : import("buffer").File;

/**
 * `Buffer` objects are used to represent a fixed-length sequence of bytes. Many
 * Node.js APIs support `Buffer`s.
 *
 * The `Buffer` class is a subclass of JavaScript's [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) class and
 * extends it with methods that cover additional use cases. Node.js APIs accept
 * plain [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) s wherever `Buffer`s are supported as well.
 *
 * While the `Buffer` class is available within the global scope, it is still
 * recommended to explicitly reference it via an import or require statement.
 *
 * ```js
 * import { Buffer } from 'node:buffer';
 *
 * // Creates a zero-filled Buffer of length 10.
 * const buf1 = Buffer.alloc(10);
 *
 * // Creates a Buffer of length 10,
 * // filled with bytes which all have the value `1`.
 * const buf2 = Buffer.alloc(10, 1);
 *
 * // Creates an uninitialized buffer of length 10.
 * // This is faster than calling Buffer.alloc() but the returned
 * // Buffer instance might contain old data that needs to be
 * // overwritten using fill(), write(), or other functions that fill the Buffer's
 * // contents.
 * const buf3 = Buffer.allocUnsafe(10);
 *
 * // Creates a Buffer containing the bytes [1, 2, 3].
 * const buf4 = Buffer.from([1, 2, 3]);
 *
 * // Creates a Buffer containing the bytes [1, 1, 1, 1] – the entries
 * // are all truncated using `(value &#x26; 255)` to fit into the range 0–255.
 * const buf5 = Buffer.from([257, 257.5, -255, '1']);
 *
 * // Creates a Buffer containing the UTF-8-encoded bytes for the string 'tést':
 * // [0x74, 0xc3, 0xa9, 0x73, 0x74] (in hexadecimal notation)
 * // [116, 195, 169, 115, 116] (in decimal notation)
 * const buf6 = Buffer.from('tést');
 *
 * // Creates a Buffer containing the Latin-1 bytes [0x74, 0xe9, 0x73, 0x74].
 * const buf7 = Buffer.from('tést', 'latin1');
 * ```
 * @see [source](https://github.com/nodejs/node/blob/v22.x/lib/buffer.js)
 */
declare module "buffer" {
    import { BinaryLike } from "node:crypto";
    import { ReadableStream as WebReadableStream } from "node:stream/web";
    /**
     * This function returns `true` if `input` contains only valid UTF-8-encoded data,
     * including the case in which `input` is empty.
     *
     * Throws if the `input` is a detached array buffer.
     * @since v19.4.0, v18.14.0
     * @param input The input to validate.
     */
    export function isUtf8(input: ArrayBuffer | NodeJS.TypedArray): boolean;
    /**
     * This function returns `true` if `input` contains only valid ASCII-encoded data,
     * including the case in which `input` is empty.
     *
     * Throws if the `input` is a detached array buffer.
     * @since v19.6.0, v18.15.0
     * @param input The input to validate.
     */
    export function isAscii(input: ArrayBuffer | NodeJS.TypedArray): boolean;
    export let INSPECT_MAX_BYTES: number;
    export const kMaxLength: number;
    export const kStringMaxLength: number;
    export const constants: {
        MAX_LENGTH: number;
        MAX_STRING_LENGTH: number;
    };
    export type TranscodeEncoding =
        | "ascii"
        | "utf8"
        | "utf-8"
        | "utf16le"
        | "utf-16le"
        | "ucs2"
        | "ucs-2"
        | "latin1"
        | "binary";
    /**
     * Re-encodes the given `Buffer` or `Uint8Array` instance from one character
     * encoding to another. Returns a new `Buffer` instance.
     *
     * Throws if the `fromEnc` or `toEnc` specify invalid character encodings or if
     * conversion from `fromEnc` to `toEnc` is not permitted.
     *
     * Encodings supported by `buffer.transcode()` are: `'ascii'`, `'utf8'`, `'utf16le'`, `'ucs2'`, `'latin1'`, and `'binary'`.
     *
     * The transcoding process will use substitution characters if a given byte
     * sequence cannot be adequately represented in the target encoding. For instance:
     *
     * ```js
     * import { Buffer, transcode } from 'node:buffer';
     *
     * const newBuf = transcode(Buffer.from('€'), 'utf8', 'ascii');
     * console.log(newBuf.toString('ascii'));
     * // Prints: '?'
     * ```
     *
     * Because the Euro (`€`) sign is not representable in US-ASCII, it is replaced
     * with `?` in the transcoded `Buffer`.
     * @since v7.1.0
     * @param source A `Buffer` or `Uint8Array` instance.
     * @param fromEnc The current encoding.
     * @param toEnc To target encoding.
     */
    export function transcode(
        source: Uint8Array,
        fromEnc: TranscodeEncoding,
        toEnc: TranscodeEncoding,
    ): NonSharedBuffer;
    /**
     * Resolve
```
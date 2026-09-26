# OUTRO - buffer.buffer.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@types\node\buffer.buffer.d.ts
**SHA:** 3af97acf03cc97de
**Timestamp:** 2026-08-26T19:32:04.240421
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * @param [start=0] Where the new `Buffer` will start.
- * @param [start=0] Where the new `Buffer` will start.

### Gaps
- // TODO: remove globals in future version

### Ouro Bruto (primeiros 5000 chars)
```
declare module "buffer" {
    type ImplicitArrayBuffer<T extends WithImplicitCoercion<ArrayBufferLike>> = T extends
        { valueOf(): infer V extends ArrayBufferLike } ? V : T;
    global {
        interface BufferConstructor {
            // see buffer.d.ts for implementation shared with all TypeScript versions

            /**
             * Allocates a new buffer containing the given {str}.
             *
             * @param str String to store in buffer.
             * @param encoding encoding to use, optional.  Default is 'utf8'
             * @deprecated since v10.0.0 - Use `Buffer.from(string[, encoding])` instead.
             */
            new(str: string, encoding?: BufferEncoding): Buffer<ArrayBuffer>;
            /**
             * Allocates a new buffer of {size} octets.
             *
             * @param size count of octets to allocate.
             * @deprecated since v10.0.0 - Use `Buffer.alloc()` instead (also see `Buffer.allocUnsafe()`).
             */
            new(size: number): Buffer<ArrayBuffer>;
            /**
             * Allocates a new buffer containing the given {array} of octets.
             *
             * @param array The octets to store.
             * @deprecated since v10.0.0 - Use `Buffer.from(array)` instead.
             */
            new(array: ArrayLike<number>): Buffer<ArrayBuffer>;
            /**
             * Produces a Buffer backed by the same allocated memory as
             * the given {ArrayBuffer}/{SharedArrayBuffer}.
             *
             * @param arrayBuffer The ArrayBuffer with which to share memory.
             * @deprecated since v10.0.0 - Use `Buffer.from(arrayBuffer[, byteOffset[, length]])` instead.
             */
            new<TArrayBuffer extends ArrayBufferLike = ArrayBuffer>(arrayBuffer: TArrayBuffer): Buffer<TArrayBuffer>;
            /**
             * Allocates a new `Buffer` using an `array` of bytes in the range `0` – `255`.
             * Array entries outside that range will be truncated to fit into it.
             *
             * ```js
             * import { Buffer } from 'node:buffer';
             *
             * // Creates a new Buffer containing the UTF-8 bytes of the string 'buffer'.
             * const buf = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
             * ```
             *
             * If `array` is an `Array`-like object (that is, one with a `length` property of
             * type `number`), it is treated as if it is an array, unless it is a `Buffer` or
             * a `Uint8Array`. This means all other `TypedArray` variants get treated as an
             * `Array`. To create a `Buffer` from the bytes backing a `TypedArray`, use
             * `Buffer.copyBytesFrom()`.
             *
             * A `TypeError` will be thrown if `array` is not an `Array` or another type
             * appropriate for `Buffer.from()` variants.
             *
             * `Buffer.from(array)` and `Buffer.from(string)` may also use the internal
             * `Buffer` pool like `Buffer.allocUnsafe()` does.
             * @since v5.10.0
             */
            from(array: WithImplicitCoercion<ArrayLike<number>>): Buffer<ArrayBuffer>;
            /**
             * This creates a view of the `ArrayBuffer` without copying the underlying
             * memory. For example, when passed a reference to the `.buffer` property of a
             * `TypedArray` instance, the newly created `Buffer` will share the same
             * allocated memory as the `TypedArray`'s underlying `ArrayBuffer`.
             *
             * ```js
             * import { Buffer } from 'node:buffer';
             *
             * const arr = new Uint16Array(2);
             *
             * arr[0] = 5000;
             * arr[1] = 4000;
             *
             * // Shares memory with `arr`.
             * const buf = Buffer.from(arr.buffer);
             *
             * console.log(buf);
             * // Prints: <Buffer 88 13 a0 0f>
             *
             * // Changing the original Uint16Array changes the Buffer also.
             * arr[1] = 6000;
             *
             * console.log(buf);
             * // Prints: <Buffer 88 13 70 17>
             * ```
             *
             * The optional `byteOffset` and `length` arguments specify a memory range within
             * the `arrayBuffer` that will be shared by the `Buffer`.
             *
             * ```js
             * import { Buffer } from 'node:buffer';
             *
             * const ab = new ArrayBuffer(10);
             * const buf = Buffer.from(ab, 0, 2);
             *
             * console.log(buf.length);
             * // Prints: 2
             * ```
             *
             * A `TypeError` will be thrown if `arrayBuffer` is not an `ArrayBuffer` or a
             * `SharedArrayBuffer` or another type appropriate for `Buffer.from()`
             * variants.
             *
             * It is important to remember that a back
```
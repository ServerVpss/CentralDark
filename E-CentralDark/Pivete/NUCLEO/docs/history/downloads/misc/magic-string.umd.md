# OUTRO - magic-string.umd.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\magic-string@0.30.21@@@1\dist\magic-string.umd.js
**SHA:** 8288c7ef6ff77798
**Timestamp:** 2026-08-28T02:24:45.346530
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- this.start = start;
- byStart: { writable: true, value: {} },
- start = start + this.offset;
- start = start + this.offset;
- if (start === end)
- start = start + this.offset;
- if (start === end) return this;
- start = start + this.offset;
- if (start === end) return this;
- slice(start = 0, end = this.original.length - this.offset) {

### Padroes
- const pattern = /^[^\r\n]/gm;

### Ouro Bruto (primeiros 5000 chars)
```
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MagicString = factory());
})(this, (function () { 'use strict';

	class BitSet {
		constructor(arg) {
			this.bits = arg instanceof BitSet ? arg.bits.slice() : [];
		}

		add(n) {
			this.bits[n >> 5] |= 1 << (n & 31);
		}

		has(n) {
			return !!(this.bits[n >> 5] & (1 << (n & 31)));
		}
	}

	class Chunk {
		constructor(start, end, content) {
			this.start = start;
			this.end = end;
			this.original = content;

			this.intro = '';
			this.outro = '';

			this.content = content;
			this.storeName = false;
			this.edited = false;

			{
				this.previous = null;
				this.next = null;
			}
		}

		appendLeft(content) {
			this.outro += content;
		}

		appendRight(content) {
			this.intro = this.intro + content;
		}

		clone() {
			const chunk = new Chunk(this.start, this.end, this.original);

			chunk.intro = this.intro;
			chunk.outro = this.outro;
			chunk.content = this.content;
			chunk.storeName = this.storeName;
			chunk.edited = this.edited;

			return chunk;
		}

		contains(index) {
			return this.start < index && index < this.end;
		}

		eachNext(fn) {
			let chunk = this;
			while (chunk) {
				fn(chunk);
				chunk = chunk.next;
			}
		}

		eachPrevious(fn) {
			let chunk = this;
			while (chunk) {
				fn(chunk);
				chunk = chunk.previous;
			}
		}

		edit(content, storeName, contentOnly) {
			this.content = content;
			if (!contentOnly) {
				this.intro = '';
				this.outro = '';
			}
			this.storeName = storeName;

			this.edited = true;

			return this;
		}

		prependLeft(content) {
			this.outro = content + this.outro;
		}

		prependRight(content) {
			this.intro = content + this.intro;
		}

		reset() {
			this.intro = '';
			this.outro = '';
			if (this.edited) {
				this.content = this.original;
				this.storeName = false;
				this.edited = false;
			}
		}

		split(index) {
			const sliceIndex = index - this.start;

			const originalBefore = this.original.slice(0, sliceIndex);
			const originalAfter = this.original.slice(sliceIndex);

			this.original = originalBefore;

			const newChunk = new Chunk(index, this.end, originalAfter);
			newChunk.outro = this.outro;
			this.outro = '';

			this.end = index;

			if (this.edited) {
				// after split we should save the edit content record into the correct chunk
				// to make sure sourcemap correct
				// For example:
				// '  test'.trim()
				//     split   -> '  ' + 'test'
				//   ✔️ edit    -> '' + 'test'
				//   ✖️ edit    -> 'test' + ''
				// TODO is this block necessary?...
				newChunk.edit('', false);
				this.content = '';
			} else {
				this.content = originalBefore;
			}

			newChunk.next = this.next;
			if (newChunk.next) newChunk.next.previous = newChunk;
			newChunk.previous = this;
			this.next = newChunk;

			return newChunk;
		}

		toString() {
			return this.intro + this.content + this.outro;
		}

		trimEnd(rx) {
			this.outro = this.outro.replace(rx, '');
			if (this.outro.length) return true;

			const trimmed = this.content.replace(rx, '');

			if (trimmed.length) {
				if (trimmed !== this.content) {
					this.split(this.start + trimmed.length).edit('', undefined, true);
					if (this.edited) {
						// save the change, if it has been edited
						this.edit(trimmed, this.storeName, true);
					}
				}
				return true;
			} else {
				this.edit('', undefined, true);

				this.intro = this.intro.replace(rx, '');
				if (this.intro.length) return true;
			}
		}

		trimStart(rx) {
			this.intro = this.intro.replace(rx, '');
			if (this.intro.length) return true;

			const trimmed = this.content.replace(rx, '');

			if (trimmed.length) {
				if (trimmed !== this.content) {
					const newChunk = this.split(this.end - trimmed.length);
					if (this.edited) {
						// save the change, if it has been edited
						newChunk.edit(trimmed, this.storeName, true);
					}
					this.edit('', undefined, true);
				}
				return true;
			} else {
				this.edit('', undefined, true);

				this.outro = this.outro.replace(rx, '');
				if (this.outro.length) return true;
			}
		}
	}

	// src/vlq.ts
	var comma = ",".charCodeAt(0);
	var semicolon = ";".charCodeAt(0);
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var intToChar = new Uint8Array(64);
	var charToInt = new Uint8Array(128);
	for (let i = 0; i < chars.length; i++) {
	  const c = chars.charCodeAt(i);
	  intToChar[i] = c;
	  charToInt[c] = i;
	}
	function encodeInteger(builder, num, relative) {
	  let delta = num - relative;
	  delta = delta < 0 ? -delta << 1 | 1 : delta << 1;
	  do {
	    let clamped = delta & 31;
	    delta >>>= 5;
	    if (delta > 0) clamped |= 32;
	    builder.write(intToChar[clamped]);
	  } while (delta > 0);
	  return num;
	}

	// src/strings.ts
	var bufLength = 1024 
```
# OUTRO - filereader.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\undici-types\filereader.d.ts
**SHA:** 317e63deeb21ac07
**Timestamp:** 2026-08-26T19:32:40.412956
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- onloadstart: null | ((this: FileReader, event: ProgressEvent) => void)

### Ouro Bruto (primeiros 5000 chars)
```
/// <reference types="node" />

import { Blob } from 'buffer'
import { DOMException, EventInit } from './patch'

export declare class FileReader {
  __proto__: EventTarget & FileReader

  constructor ()

  readAsArrayBuffer (blob: Blob): void
  readAsBinaryString (blob: Blob): void
  readAsText (blob: Blob, encoding?: string): void
  readAsDataURL (blob: Blob): void

  abort (): void

  static readonly EMPTY = 0
  static readonly LOADING = 1
  static readonly DONE = 2

  readonly EMPTY = 0
  readonly LOADING = 1
  readonly DONE = 2

  readonly readyState: number

  readonly result: string | ArrayBuffer | null

  readonly error: DOMException | null

  onloadstart: null | ((this: FileReader, event: ProgressEvent) => void)
  onprogress: null | ((this: FileReader, event: ProgressEvent) => void)
  onload: null | ((this: FileReader, event: ProgressEvent) => void)
  onabort: null |  ((this: FileReader, event: ProgressEvent) => void)
  onerror: null | ((this: FileReader, event: ProgressEvent) => void)
  onloadend: null | ((this: FileReader, event: ProgressEvent) => void)
}

export interface ProgressEventInit extends EventInit {
  lengthComputable?: boolean
  loaded?: number
  total?: number
}

export declare class ProgressEvent {
  __proto__: Event & ProgressEvent

  constructor (type: string, eventInitDict?: ProgressEventInit)

  readonly lengthComputable: boolean
  readonly loaded: number
  readonly total: number
}

```
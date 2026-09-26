# BENCHLAB
ILLUMINATE YOUR INSIGHTS | REAL-TIME SYSTEM TELEMETRY SOLUTION

BENCHLAB is a cutting-edge, compact, real-time system telemetry solution engineered for PC DIY enthusiasts.
It allows you to effortlessly monitor critical system metrics, including temperature, power usage, and voltage levels.
You can also manage system fan speeds. The telemetry data is displayed in the BENCHLAB software, and you can log and export data to a file or to HWiNFO.

Monitoring is available for:
- Power
- Voltage
- Temperature
- Humidity

BENCHLAB is available for purchase starting from December 29th, 2023 at BENCHLAB.io.
![image](https://github.com/BENCHLAB-io/BENCHLAB/assets/2151317/6aa9c95a-c936-4c4b-9b91-a81a62c2ebf7)

# BENCHLAB Software
The software available on this page is made to exclusively work with the BENCHLAB Hardware. The software is made to run on Windows 10/11.

# How to install & use the BENCHLAB software
- Download the BENCHLAB software from the official Github releases page: [https://github.com/BENCHLAB-io](https://github.com/BENCHLAB-io/BENCHLAB/releases)
- Unzip the files in a new folder
- Double-click the executable "BENCHLAB.exe" to start the software
- Make sure the BENCHLAB is connected to the system where the software is installed
- Run the software, you should see that the BENCHLAB device is connected

# FAQ
- My antivirus is giving a warning when I unzip / run the program
This can happen with WIndows Defender SmartScreen or AVAST as we are a small team we are not yet a "known" source for software distribution.

- Can I communicate with the BENCHLAB Hardware with a script?
Yes you can check the example Python Script at : https://github.com/BENCHLAB-io/BENCHLAB.PythonSample

# Change log
Check the release page for changes.

# Some things that we might be working on
- Add saving settings options (save permanent/export/import/factory reset)
- Better installation process, especially with less AV flag.
- Light & Dark mode options
- Add a Re-calibration feature (to re-calibrate your BENCHLAB board)
- Advanced Fan control options in software
- Advanced Fan control options save on the BENCHLAB board (whenever possible)
- Report status of RGB header connected

# Professional services, support & calibration
For professional partners, Labs and Benchmark-automation groups, feel free to contact us at contact@BENCHLAB.io for alternative way to communicate with the BENCHLAB hardware, dedicated support and extra calibration needs.

# Disclaimer
The BENCHLAB Team's goals are to provide a reliable and good user experience, keep in mind that bugs & limitations can still be present.
If you encounter a bug in the software, you can report it in the "issue" tab on Github. If you need support 

To download the latest version, check the Releases tab.

## BENCHLAB is brought to you by The OpenBenchtable Project & ElmorLabs

## This project is made possible using Open Source components
- SkiaSharp https://github.com/mono/SkiaSharp
- HarfBuzz https://github.com/harfbuzz/harfbuzz
- AvaloniaUI https://github.com/AvaloniaUI/Avalonia


---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\e2e\mock-updates\README.md
**SHA:** 3385ea822efe9e57
**Timestamp:** 2026-08-23T14:15:54.097239
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to a newer semver (example: `2.4.229`), then run:
- In another terminal, set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to an older semver (must be lower than step 1), then run:

### Ouro Bruto (primeiros 5000 chars)
```
# Local updater test (quick commands)

## 1) Build and stage the newer release

Set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to a newer semver (example: `2.4.229`), then run:

```bash
bun run updater-local:build
bun run updater-local:stage-last
bun run updater-local:serve
```

Keep the server terminal running.

## 2) Build the older app

In another terminal, set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to an older semver (must be lower than step 1), then run:

```bash
bun run updater-local:build
```

## 3) Verify update flow

Launch the old installed app and trigger update check.

Expected: it pulls the staged update from `http://127.0.0.1:8765/`.

## Notes

- Build newer first: building the older app later overwrites `src-tauri/target/release/bundle`.
- Scripts used above are in `apps/screenpipe-app-tauri/package.json`:
  - `updater-local:build`
  - `updater-local:stage-last`
  - `updater-local:serve`

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\e2e\mock-updates\README.md
**SHA:** 3385ea822efe9e574fc3ad7d2a5459f807818fb4104bb081e681ca9e311d5a6a
**Timestamp:** 2026-08-23T23:43:23.160973
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to a newer semver (example: `2.4.229`), then run:
- In another terminal, set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to an older semver (must be lower than step 1), then run:

### Ouro Bruto (primeiros 5000 chars)
```
# Local updater test (quick commands)

## 1) Build and stage the newer release

Set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to a newer semver (example: `2.4.229`), then run:

```bash
bun run updater-local:build
bun run updater-local:stage-last
bun run updater-local:serve
```

Keep the server terminal running.

## 2) Build the older app

In another terminal, set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to an older semver (must be lower than step 1), then run:

```bash
bun run updater-local:build
```

## 3) Verify update flow

Launch the old installed app and trigger update check.

Expected: it pulls the staged update from `http://127.0.0.1:8765/`.

## Notes

- Build newer first: building the older app later overwrites `src-tauri/target/release/bundle`.
- Scripts used above are in `apps/screenpipe-app-tauri/package.json`:
  - `updater-local:build`
  - `updater-local:stage-last`
  - `updater-local:serve`

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-usd-performance-tuning\references\report-templates\README.md
**SHA:** 47a26472d12a447c
**Timestamp:** 2026-08-26T18:42:42.103170
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- For local preview, run:

### Ouro Bruto (primeiros 5000 chars)
```
<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# USD Performance Tuning Report Templates

These templates are the design surface for `optimization-report`.

The HTML template is intentionally static and self-contained:

- No JavaScript.
- No charting libraries.
- No external assets.
- CSS-only score ring, bars, badges, and impact cards.

The syntax is a deliberately small Jinja-compatible subset (`{{ value }}`,
`{% for item in items %}`, `{% if value %}`, and simple equality checks). The
committed renderer supports that subset with Python's standard library, so
report generation does not require Jinja2.

Use `optimization-report.design-fixture.json` as a stable visual fixture when
iterating on layout, colors, and wording without rerunning a full optimization.
For local preview, run:

```bash
python3 references/report-templates/render_preview.py
```

The preview helper is Python stdlib-only and writes
`optimization-report.preview.html` next to the templates. Treat that output as a
generated visual aid, not as a source template.

Runtime metrics caveat: RAM, VRAM, FPS, frame time, shader cost, and renderer
activity belong in Omniperf or an equivalent runtime profiling dashboard. The
report templates focus the score on stage/composition optimization and provide
a separate runtime-profiling handoff section for external artifacts.

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\range-parser\README.md
**SHA:** 886bf556a8a88adc
**Timestamp:** 2026-08-26T19:32:25.845606
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- //      { start: 0,  end: 10 },
- //      { start: 50, end: 60 }

### Ouro Bruto (primeiros 5000 chars)
```
# range-parser

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![Node.js Version][node-image]][node-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Range header field parser.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm install range-parser
```

## API

<!-- eslint-disable no-unused-vars -->

```js
var parseRange = require('range-parser')
```

### parseRange(size, header, options)

Parse the given `header` string where `size` is the maximum size of the resource.
An array of ranges will be returned or negative numbers indicating an error parsing.

  * `-2` signals a malformed header string
  * `-1` signals an unsatisfiable range

<!-- eslint-disable no-undef -->

```js
// parse header from request
var range = parseRange(size, req.headers.range)

// the type of the range
if (range.type === 'bytes') {
  // the ranges
  range.forEach(function (r) {
    // do something with r.start and r.end
  })
}
```

#### Options

These properties are accepted in the options object.

##### combine

Specifies if overlapping & adjacent ranges should be combined, defaults to `false`.
When `true`, ranges will be combined and returned as if they were specified that
way in the header.

<!-- eslint-disable no-undef -->

```js
parseRange(100, 'bytes=50-55,0-10,5-10,56-60', { combine: true })
// => [
//      { start: 0,  end: 10 },
//      { start: 50, end: 60 }
//    ]
```

## License

[MIT](LICENSE)

[coveralls-image]: https://badgen.net/coveralls/c/github/jshttp/range-parser/master
[coveralls-url]: https://coveralls.io/r/jshttp/range-parser?branch=master
[node-image]: https://badgen.net/npm/node/range-parser
[node-url]: https://nodejs.org/en/download
[npm-downloads-image]: https://badgen.net/npm/dm/range-parser
[npm-url]: https://npmjs.org/package/range-parser
[npm-version-image]: https://badgen.net/npm/v/range-parser
[travis-image]: https://badgen.net/travis/jshttp/range-parser/master
[travis-url]: https://travis-ci.org/jshttp/range-parser

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\send\README.md
**SHA:** 08f465b588af7426
**Timestamp:** 2026-08-26T19:32:26.842755
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- meaning `start: 2` will include the 3rd byte in the stream.

### Ouro Bruto (primeiros 5000 chars)
```
# send

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![Linux Build][github-actions-ci-image]][github-actions-ci-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Send is a library for streaming files from the file system as a http response
supporting partial responses (Ranges), conditional-GET negotiation (If-Match,
If-Unmodified-Since, If-None-Match, If-Modified-Since), high test coverage,
and granular events which may be leveraged to take appropriate actions in your
application or framework.

Looking to serve up entire folders mapped to URLs? Try [serve-static](https://www.npmjs.org/package/serve-static).

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install send
```

## API

```js
var send = require('send')
```

### send(req, path, [options])

Create a new `SendStream` for the given path to send to a `res`. The `req` is
the Node.js HTTP request and the `path` is a urlencoded path to send (urlencoded,
not the actual file-system path).

#### Options

##### acceptRanges

Enable or disable accepting ranged requests, defaults to true.
Disabling this will not send `Accept-Ranges` and ignore the contents
of the `Range` request header.

##### cacheControl

Enable or disable setting `Cache-Control` response header, defaults to
true. Disabling this will ignore the `immutable` and `maxAge` options.

##### dotfiles

Set how "dotfiles" are treated when encountered. A dotfile is a file
or directory that begins with a dot ("."). Note this check is done on
the path itself without checking if the path actually exists on the
disk. If `root` is specified, only the dotfiles above the root are
checked (i.e. the root itself can be within a dotfile when when set
to "deny").

  - `'allow'` No special treatment for dotfiles.
  - `'deny'` Send a 403 for any request for a dotfile.
  - `'ignore'` Pretend like the dotfile does not exist and 404.

The default value is _similar_ to `'ignore'`, with the exception that
this default will not ignore the files within a directory that begins
with a dot, for backward-compatibility.

##### end

Byte offset at which the stream ends, defaults to the length of the file
minus 1. The end is inclusive in the stream, meaning `end: 3` will include
the 4th byte in the stream.

##### etag

Enable or disable etag generation, defaults to true.

##### extensions

If a given file doesn't exist, try appending one of the given extensions,
in the given order. By default, this is disabled (set to `false`). An
example value that will serve extension-less HTML files: `['html', 'htm']`.
This is skipped if the requested file already has an extension.

##### immutable

Enable or disable the `immutable` directive in the `Cache-Control` response
header, defaults to `false`. If set to `true`, the `maxAge` option should
also be specified to enable caching. The `immutable` directive will prevent
supported clients from making conditional requests during the life of the
`maxAge` option to check if the file has changed.

##### index

By default send supports "index.html" files, to disable this
set `false` or to supply a new index pass a string or an array
in preferred order.

##### lastModified

Enable or disable `Last-Modified` header, defaults to true. Uses the file
system's last modified value.

##### maxAge

Provide a max-age in milliseconds for http caching, defaults to 0.
This can also be a string accepted by the
[ms](https://www.npmjs.org/package/ms#readme) module.

##### root

Serve files relative to `path`.

##### start

Byte offset at which the stream starts, defaults to 0. The start is inclusive,
meaning `start: 2` will include the 3rd byte in the stream.

#### Events

The `SendStream` is an event emitter and will emit the following events:

  - `error` an error occurred `(err)`
  - `directory` a directory was requested `(res, path)`
  - `file` a file was requested `(path, stat)`
  - `headers` the headers are about to be set on a file `(res, path, stat)`
  - `stream` file streaming has started `(stream)`
  - `end` streaming has completed

#### .pipe

The `pipe` method is used to pipe the response into the Node.js HTTP response
object, typically `send(req, path, options).pipe(res)`.

### .mime

The `mime` export is the global instance of of the
[`mime` npm module](https://www.npmjs.com/package/mime).

This is used to configure the MIME types that are associated with file extensions
as well as other options for how to resolve the MIME type of a file (like the
default type to use for an unknown file extension).

## Error-handling

By default when no `error` listeners are present an automatic response will be
made, otherwise you have full control over the response, aka you may show a 5xx

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\scripts\lib\README.md
**SHA:** f848baac80aa35df
**Timestamp:** 2026-08-26T19:32:51.243866
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Regra: evitar cabecalhos, cores e estilos visuais manuais em scripts novos.

### Ouro Bruto (primeiros 5000 chars)
```
# scripts/lib

Biblioteca oficial de helpers reutilizaveis dos scripts CentralDark / MultiZap.

## Tema Netflix Centralizado

Fontes da verdade:

```txt
scripts/lib/theme.sh
scripts/lib/theme-node.mjs
```

Scripts Bash da VPS devem carregar `theme.sh`. Scripts Node devem importar
`theme-node.mjs`, que usa Chalk quando disponivel e mantem fallback seguro para
terminais sem dependencia instalada.

Funcoes Bash disponiveis:

- `netflix_header`
- `netflix_step`
- `netflix_success`
- `netflix_info`
- `netflix_warning`
- `netflix_error`
- `netflix_done`
- `netflix_confirm`
- `netflix_progress_bar`
- `netflix_loading`

Funcoes Node disponiveis:

- `netflixHeader`
- `netflixStep`
- `netflixSuccess`
- `netflixInfo`
- `netflixWarning`
- `netflixError`
- `netflixDone`
- `createSpinner`
- `runWithSpinner`
- `ensureNodeDependencies`
- `importNodeDependency`
- `sanitizeLog`
- `writeLog`

Regra: evitar cabecalhos, cores e estilos visuais manuais em scripts novos.
Logs completos devem ir para `revisoes/`; no terminal fica apenas o resumo limpo.
Nunca imprimir secrets, tokens, `.env`, sessoes ou cookies.

Dependencias Node:

- `theme-node.mjs` verifica `chalk` antes de importar definitivamente.
- Se faltar `node_modules` ou a dependencia nao resolver, instala automaticamente.
- Com `package-lock.json`, usa `npm ci`; sem lockfile, usa `npm install`.
- O log completo da instalacao vai para `revisoes/.../dependencies.log`.
- Se a instalacao falhar, o script para com erro claro e caminho do log.
- Para outras dependencias externas, usar `ensureNodeDependencies()` antes do import definitivo ou `importNodeDependency()`.

Exemplo Bash:

```bash
source "/root/CentralDark/scripts/lib/theme.sh"

netflix_header
netflix_step 1 4 "Validando ambiente"
netflix_success "Ambiente validado"
netflix_done
```

Exemplo Node:

```js
import {
  netflixHeader,
  netflixStep,
  netflixSuccess,
  netflixDone,
} from './theme-node.mjs';

netflixHeader();
netflixStep(1, 4, 'Validando ambiente');
netflixSuccess('Ambiente validado');
netflixDone();
```

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\CentralDark\apps\install-callback\README.md
**SHA:** 5e4d7eb3cb2450b7
**Timestamp:** 2026-08-26T19:34:24.849418
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - **Wrapper de start:** `start.sh` (carrega `.env` e sobe `server.js`)

### Ouro Bruto (primeiros 5000 chars)
```
# install-callback

Backend público do **Wizard de Instalação CentralDark**.

- **Domínio:** https://install.centralldark.com
- **Porta interna:** 9200 (atrás do Caddy)
- **Processo PM2:** `Install-Callback`
- **Caminho na VPS:** `/root/CentralDark/apps/install-callback/`
- **Wrapper de start:** `start.sh` (carrega `.env` e sobe `server.js`)
- **Cofre gravado:** `/root/CentralDark/secrets/cloudflare.env` (chmod 600)

## Pra que serve

Recebe a conexão Cloudflare do usuário leigo por dois caminhos:

1. **OAuth Cloudflare** (preferencial) — Authorization Code + PKCE em `dash.cloudflare.com/oauth2/auth`
2. **Fallback 1-Click API Token** — URL pré-preenchida em `dash.cloudflare.com/profile/api-tokens`

O terminal SSH cria uma sessão, mostra o link `install.centralldark.com/connect/<id>`,
e fica em long-poll até o usuário autorizar. Quando autoriza, a VPS recebe o token
e segue o wizard sozinha (DNS, Caddy, HTTPS).

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET  | `/health` | Status + se OAuth está configurado |
| POST | `/session/new` | Cria sessão (chamado pelo SSH) |
| GET  | `/session/:id?wait=25` | Long-poll do status (`pending`/`done`) |
| GET  | `/connect/:id` | Página HTML com os dois botões |
| GET  | `/oauth/cloudflare/start?sid=...` | Inicia OAuth (PKCE) |
| GET  | `/oauth/cloudflare/callback` | Recebe `code`, troca por token, salva |
| POST | `/token/cloudflare?sid=...` | Recebe token colado, valida, salva |

## Variáveis de ambiente

```env
PORT=9200
PUBLIC_URL=https://install.centralldark.com
SECRETS_DIR=[REDIGIDO-PRESERVACAO]
STATE_SECRET=<aleatório de 32 bytes>           # anti-CSRF
CF_OAUTH_CLIENT_ID=<criado em dash.cloudflare.com/oauth_clients>
CF_OAUTH_CLIENT_SECRET=<idem>
CF_OAUTH_SCOPES=zone:read dns_records:edit user:read account:read
```

Se `CF_OAUTH_CLIENT_ID`/`SECRET` faltarem, o servidor sobe normalmente mas só
mostra o caminho do 1-Click Token.

## Segurança

- Sessões expiram em 10 minutos
- Token nunca aparece em log — só fingerprint (`AbCd…xy`)
- `state` OAuth assinado com HMAC pra anti-CSRF
- Token gravado só em `/root/CentralDark/secrets/cloudflare.env` (chmod 600)
- Servidor escuta apenas em `127.0.0.1`; exposição é via Caddy

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\🔒PASTA TRANCADA APELO CHEFE🔒\.extracted_CENTRALDARK_FINAL_SINGLE_DELIVERY\00_READ_ME\README.md
**SHA:** 6463147296db6722
**Timestamp:** 2026-08-27T15:29:08.253771
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Regra: nada do handoff anterior necessário para uso/verificação ficou fora deste ZIP.

### Ouro Bruto (primeiros 5000 chars)
```
# CENTRALDARK — FINAL SINGLE DELIVERY

Este é o único arquivo de entrega que o CHEFE precisa carregar.

Contém:
- o envelope canônico anterior completo;
- todas as provas externas que antes ficaram fora dele;
- todos os arquivos individuais linkados no chat;
- manifesto, hashes, receipt e verificador desta camada de entrega.

Regra: nada do handoff anterior necessário para uso/verificação ficou fora deste ZIP.

Limite matemático: o ZIP final não pode conter o hash dos próprios bytes finais sem circularidade. Por isso a integridade interna cobre 100% do payload; o arquivo final é contraprovado externamente durante a geração, sem criar sidecar de entrega.

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\meriyah@6.1.4@@@1\README.md
**SHA:** 6d15afe2a6ecafaf
**Timestamp:** 2026-08-28T02:24:46.549722
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- declare function onComment(type: string, value: string, start: number, end: number, loc: SourceLocation): void;
- declare function onToken(token: string, start: number, end: number, loc: SourceLocation): void;

### Ouro Bruto (primeiros 5000 chars)
```
<h1 align="center">Meriyah</h1>

<p align="center"> 100% compliant, self-hosted javascript parser with high focus on both performance and stability. Stable and already used in production.</p>

<p align="center">
    <a href="https://www.npmjs.com/package/meriyah"><img src="https://img.shields.io/npm/v/meriyah.svg?style=flat-square" alt="Meriyah NPM"/></a>
    <a href="https://github.com/meriyah/meriyah/actions/workflows/node.js.yml?query=branch%3Amain"><img src="https://img.shields.io/github/actions/workflow/status/meriyah/meriyah/node.js.yml?branch=main&label=test&style=flat-square" alt="Node.js CI"/></a>
    <a href="https://github.com/meriyah/meriyah/blob/master/LICENSE.md"><img src="https://img.shields.io/github/license/meriyah/meriyah.svg?style=flat-square" alt="License" /></a>
</p>

<br>

[Interactive Playground](https://meriyah.github.io/meriyah)
[Benchmark](https://meriyah.github.io/meriyah/performance)

## Features

- Conforms to the standard ECMAScript® 2024 (ECMA-262 15th Edition) language specification
  - See [RegExp support](#regexp-support)
- Support some TC39 stage 3 proposals via option "next"
- Support for additional ECMAScript features for Web Browsers (Annex B)
- JSX support via option "jsx"
- Does **NOT** support TypeScript or Flow syntax
- Track syntactic node locations with option "ranges" or "loc"
- Emits an ESTree-compatible abstract syntax tree
- No backtracking
- Low memory usage

## ESNext Stage 3 features

### Supported stage 3 features:

These features need to be enabled with the `next` option.

- [Decorators](https://github.com/tc39/proposal-decorators)
- [JSON Modules](https://github.com/tc39/proposal-json-modules)

### Not yet supported stage 3 features:

- [Explicit resource management](https://github.com/tc39/proposal-explicit-resource-management)
- [Source phase import](https://github.com/tc39/proposal-source-phase-imports)

## RegExp support

Meriyah doesn't parse RegExp internal syntax, ESTree spec didn't require internal structure of RegExp. Meriyah
does use JavaScript runtime to validate the RegExp literal. That means Meriyah's RegExp support is only as good
as JavaScript runtime's RegExp support.

As of May 2025, some latest RegExp features requires Node.js>=24.

- [RegExp modifiers](https://github.com/tc39/proposal-regexp-modifiers)
- [RegExp duplicate named groups](https://github.com/tc39/proposal-duplicate-named-capturing-groups)

In addition, RegExp v flag (unicodeSets) only works on Nodejs v20+ and latest browsers.

## Installation

```sh
npm install meriyah --save-dev
```

## API

Meriyah generates `AST` according to [ESTree AST format](https://github.com/estree/estree), and can be used to perform [syntactic analysis](https://en.wikipedia.org/wiki/Parsing) (parsing) of a JavaScript program, and with `ES2015` and later a JavaScript program can be either [a script or a module](https://tc39.github.io/ecma262/index.html#sec-ecmascript-language-scripts-and-modules).

The `parse` method exposed by meriyah takes an optional `options` object which allows you to specify whether to parse in [`script`](https://tc39.github.io/ecma262/#sec-parse-script) mode (the default) or in [`module`](https://tc39.github.io/ecma262/#sec-parsemodule) mode.

```js
// There are also "parseScript" and "parseModule" exported.
import { parse } from 'meriyah';
const result = parse('let some = "code";', { ranges: true });
```

The available options:

```js
{
  // The flag to allow module code
  module: false;

  // The flag to enable stage 3 support (ESNext)
  next: false;

  // The flag to enable start, end offsets and range: [start, end] to each node
  ranges: false;

  // Enable web compatibility
  webcompat: false;

  // The flag to enable line/column location information to each node
  loc: false;

  // The flag to attach raw property to each literal and identifier node
  raw: false;

  // The flag to allow return in the global scope
  globalReturn: false;

  // The flag to enable implied strict mode
  impliedStrict: false;

  // Allows comment extraction. Accepts either a function or array
  onComment: [];

  // Allows detection of automatic semicolon insertion. Accepts a callback function that will be passed the character offset where the semicolon was inserted
  onInsertedSemicolon: (pos) => {};

  // Allows token extraction. Accepts either a function or array
  onToken: [];

  // Enable non-standard parenthesized expression node
  preserveParens: false;

  // Enable lexical binding and scope tracking
  lexical: false;

  // Adds a source attribute in every node’s loc object when the locations option is `true`
  source: undefined; // Set to source: 'source-file.js'

  // Enable React JSX parsing
  jsx: false;
}
```

### onComment and onToken

If an array is supplied, comments/tokens will be pushed to the array, the item in the array contains `start/end/range` information when ranges flag is true, it will also contain `loc` information when loc flag is true.

If a function callback is su
```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\range-parser@1.3.0@@@1\README.md
**SHA:** 1fc681010aad8156
**Timestamp:** 2026-08-28T02:25:02.413740
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- //      { start: 0,  end: 10 },
- //      { start: 50, end: 60 }

### Ouro Bruto (primeiros 5000 chars)
```
# range-parser

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![Node.js Version][node-image]][node-url]
[![Build Status][ci-image]][ci-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Range header field parser.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm install range-parser
```

## API

<!-- eslint-disable no-unused-vars -->

```js
var parseRange = require('range-parser')
```

### parseRange(size, header, options)

Parse the given `header` string where `size` is the size of the selected
representation that is to be partitioned into subranges. An array of subranges
will be returned or negative numbers indicating an error parsing.

  * `-2` signals a malformed header string
  * `-1` signals an unsatisfiable range

<!-- eslint-disable no-undef -->

```js
// parse header from request
var subranges = parseRange(size, req.headers.range)

// the type of the subranges
if (subranges.type === 'bytes') {
  // the ranges
  subranges.forEach(function (r) {
    // do something with r.start and r.end
  })
}
```

#### Options

These properties are accepted in the options object.

##### combine

Specifies if overlapping & adjacent subranges should be combined, defaults to
`false`. When `true`, ranges will be combined and returned as if they were
specified that way in the header.

<!-- eslint-disable no-undef -->

```js
parseRange(100, 'bytes=50-55,0-10,5-10,56-60', { combine: true })
// => [
//      { start: 0,  end: 10 },
//      { start: 50, end: 60 }
//    ]
```

## License

[MIT](LICENSE)

[ci-image]: https://badgen.net/github/checks/jshttp/range-parser/master?label=ci
[ci-url]: https://github.com/jshttp/range-parser/actions/workflows/ci.yml
[coveralls-image]: https://badgen.net/coveralls/c/github/jshttp/range-parser/master
[coveralls-url]: https://coveralls.io/r/jshttp/range-parser?branch=master
[node-image]: https://badgen.net/npm/node/range-parser
[node-url]: https://nodejs.org/en/download
[npm-downloads-image]: https://badgen.net/npm/dm/range-parser
[npm-url]: https://npmjs.org/package/range-parser
[npm-version-image]: https://badgen.net/npm/v/range-parser

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\send@1.2.1@@@1\README.md
**SHA:** 4fd2e675396bb7f4
**Timestamp:** 2026-08-28T02:25:07.736463
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- meaning `start: 2` will include the 3rd byte in the stream.

### Ouro Bruto (primeiros 5000 chars)
```
# send

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![CI][github-actions-ci-image]][github-actions-ci-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Send is a library for streaming files from the file system as a http response
supporting partial responses (Ranges), conditional-GET negotiation (If-Match,
If-Unmodified-Since, If-None-Match, If-Modified-Since), high test coverage,
and granular events which may be leveraged to take appropriate actions in your
application or framework.

Looking to serve up entire folders mapped to URLs? Try [serve-static](https://www.npmjs.org/package/serve-static).

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install send
```

## API

```js
var send = require('send')
```

### send(req, path, [options])

Create a new `SendStream` for the given path to send to a `res`. The `req` is
the Node.js HTTP request and the `path` is a urlencoded path to send (urlencoded,
not the actual file-system path).

#### Options

##### acceptRanges

Enable or disable accepting ranged requests, defaults to true.
Disabling this will not send `Accept-Ranges` and ignore the contents
of the `Range` request header.

##### cacheControl

Enable or disable setting `Cache-Control` response header, defaults to
true. Disabling this will ignore the `immutable` and `maxAge` options.

##### dotfiles

Set how "dotfiles" are treated when encountered. A dotfile is a file
or directory that begins with a dot ("."). Note this check is done on
the path itself without checking if the path actually exists on the
disk. If `root` is specified, only the dotfiles above the root are
checked (i.e. the root itself can be within a dotfile when set
to "deny").

  - `'allow'` No special treatment for dotfiles.
  - `'deny'` Send a 403 for any request for a dotfile.
  - `'ignore'` Pretend like the dotfile does not exist and 404.

The default value is _similar_ to `'ignore'`, with the exception that
this default will not ignore the files within a directory that begins
with a dot, for backward-compatibility.

##### end

Byte offset at which the stream ends, defaults to the length of the file
minus 1. The end is inclusive in the stream, meaning `end: 3` will include
the 4th byte in the stream.

##### etag

Enable or disable etag generation, defaults to true.

##### extensions

If a given file doesn't exist, try appending one of the given extensions,
in the given order. By default, this is disabled (set to `false`). An
example value that will serve extension-less HTML files: `['html', 'htm']`.
This is skipped if the requested file already has an extension.

##### immutable

Enable or disable the `immutable` directive in the `Cache-Control` response
header, defaults to `false`. If set to `true`, the `maxAge` option should
also be specified to enable caching. The `immutable` directive will prevent
supported clients from making conditional requests during the life of the
`maxAge` option to check if the file has changed.

##### index

By default send supports "index.html" files, to disable this
set `false` or to supply a new index pass a string or an array
in preferred order.

##### lastModified

Enable or disable `Last-Modified` header, defaults to true. Uses the file
system's last modified value.

##### maxAge

Provide a max-age in milliseconds for http caching, defaults to 0.
This can also be a string accepted by the
[ms](https://www.npmjs.org/package/ms#readme) module.

##### root

Serve files relative to `path`.

##### start

Byte offset at which the stream starts, defaults to 0. The start is inclusive,
meaning `start: 2` will include the 3rd byte in the stream.

#### Events

The `SendStream` is an event emitter and will emit the following events:

  - `error` an error occurred `(err)`
  - `directory` a directory was requested `(res, path)`
  - `file` a file was requested `(path, stat)`
  - `headers` the headers are about to be set on a file `(res, path, stat)`
  - `stream` file streaming has started `(stream)`
  - `end` streaming has completed

#### .pipe

The `pipe` method is used to pipe the response into the Node.js HTTP response
object, typically `send(req, path, options).pipe(res)`.

## Error-handling

By default when no `error` listeners are present an automatic response will be
made, otherwise you have full control over the response, aka you may show a 5xx
page etc.

## Caching

It does _not_ perform internal caching, you should use a reverse proxy cache
such as Varnish for this, or those fancy things called CDNs. If your
application is small enough that it would benefit from single-node memory
caching, it's small enough that it does not need caching at all ;).

## Debugging

To enable `debug()` instrumentation output export __DEBUG__:

```
$ DE
```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod-to-json-schema@3.25.2@@@1\README.md
**SHA:** 6f71de29f58a02b6
**Timestamp:** 2026-08-28T02:27:04.334893
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- | **emailStrategy**?: "format:email" \| "format:idn-email" \| "pattern:zod"          | Choose how to handle the email string check. Defaults to "format:email".                                         
- | **base64Strategy**?: "format:binary" \| "contentEnconding:base64" \| "pattern:zod" | Choose how to handle the base64 string check. Defaults to "contentEncoding:base64" as described [here](https://js

### Ouro Bruto (primeiros 5000 chars)
```
# Zod to Json Schema

[![NPM Version](https://img.shields.io/npm/v/zod-to-json-schema.svg)](https://npmjs.org/package/zod-to-json-schema)
[![NPM Downloads](https://img.shields.io/npm/dw/zod-to-json-schema.svg)](https://npmjs.org/package/zod-to-json-schema)

## Notice of deprecation

As of November 2025, this project will no longer be actively maintained. [Zod v4 natively supports generating JSON schemas](https://zod.dev/json-schema#ztojsonschema), so I recommend you switch to the new major.

Thank you to all the contributors and sponsors throughout the years! So long, and thanks for all the fish.

## Summary

Does what it says on the tin; converts [Zod schemas](https://github.com/colinhacks/zod) into [JSON schemas](https://json-schema.org/)!

- Supports all relevant schema types, basic string, number and array length validations and string patterns.
- Resolves recursive and recurring schemas with internal `$ref`s.
- Supports targeting legacy Open API 3.0 specification (3.1 supports regular Json Schema).
- Supports Open AI strict mode schemas (Optional object properties are replaced with required but nullable ones).
- As of v3.25 you can use Zod v4 as a peer-dependency, so long as you still provide v3-schemas.

_Looking for the exact opposite? Check out [json-schema-to-zod](https://npmjs.org/package/json-schema-to-zod)_

## Sponsors

As this project will no longer be receiving updates I am no longer accepting new partnerships. Huge shout-out to CodeRabbit for keeping it real to the end <3

<table align="center" style="justify-content: center;align-items: center;display: flex;">
  <tr>
    <td align="center">
      <p></p>
      <p>
      <div style="background-color: white; padding: 4px; padding-bottom: 8px;" alt="stainless">
        <a href="https://www.coderabbit.ai/">
          <picture height="45px">
             <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/eea24edb-ff20-4532-b57c-e8719f455d6d">
          <img alt="CodeRabbit logo" height="45px" src="https://github.com/user-attachments/assets/d791bc7d-dc60-4d55-9c31-97779839cb74">
          </picture>
        </a>
      </div>
      <br  />   
      Cut code review time & bugs in half
      <br/>
      <a href="https://www.coderabbit.ai/" style="text-decoration:none;">coderabbit.ai</a>
      </p>
      <p></p>
    </td>
  </tr>
</table>

## Usage

### Basic example

```typescript
import { z } from "zod"; // Or, using v3.25 or v4, "zod/v3"
import { zodToJsonSchema } from "zod-to-json-schema";

const mySchema = z
  .object({
    myString: z.string().min(5),
    myUnion: z.union([z.number(), z.boolean()]),
  })
  .describe("My neat object schema");

const jsonSchema = zodToJsonSchema(mySchema, "mySchema");
```

#### Expected output

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/mySchema",
  "definitions": {
    "mySchema": {
      "description": "My neat object schema",
      "type": "object",
      "properties": {
        "myString": {
          "type": "string",
          "minLength": 5
        },
        "myUnion": {
          "type": ["number", "boolean"]
        }
      },
      "additionalProperties": false,
      "required": ["myString", "myUnion"]
    }
  }
}
```

## Options

### Schema name

You can pass a string as the second parameter of the main zodToJsonSchema function. If you do, your schema will end up inside a definitions object property on the root and referenced from there. Alternatively, you can pass the name as the `name` property of the options object (see below).

### Options object

Instead of the schema name (or nothing), you can pass an options object as the second parameter. The following options are available:

| Option                                                                             | Effect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\fastrand-2.5.0\README.md
**SHA:** 5f3d251d8bc1c793
**Timestamp:** 2026-08-28T02:34:07.033613
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Now this prints the same number on every run:

### Ouro Bruto (primeiros 5000 chars)
```
# fastrand

[![Build](https://github.com/smol-rs/fastrand/actions/workflows/ci.yml/badge.svg)](
https://github.com/smol-rs/fastrand/actions)
[![License](https://img.shields.io/badge/license-Apache--2.0_OR_MIT-blue.svg)](
https://github.com/smol-rs/fastrand)
[![Cargo](https://img.shields.io/crates/v/fastrand.svg)](
https://crates.io/crates/fastrand)
[![Documentation](https://docs.rs/fastrand/badge.svg)](
https://docs.rs/fastrand)

A simple and fast random number generator.

The implementation uses [Wyrand](https://github.com/wangyi-fudan/wyhash), a simple and fast
generator but **not** cryptographically secure.

## Examples

Flip a coin:

```rust
if fastrand::bool() {
    println!("heads");
} else {
    println!("tails");
}
```

Generate a random `i32`:

```rust
let num = fastrand::i32(..);
```

Choose a random element in an array:

```rust
let v = vec![1, 2, 3, 4, 5];
let i = fastrand::usize(..v.len());
let elem = v[i];
```

Sample values from an array with `O(n)` complexity (`n` is the length of the array):

```rust
fastrand::choose_multiple([1, 4, 5], 2);
fastrand::choose_multiple(0..20, 12);
```

Shuffle an array:

```rust
let mut v = vec![1, 2, 3, 4, 5];
fastrand::shuffle(&mut v);
```

Generate a random `Vec` or `String`:

```rust
use std::iter::repeat_with;

let v: Vec<i32> = repeat_with(|| fastrand::i32(..)).take(10).collect();
let s: String = repeat_with(fastrand::alphanumeric).take(10).collect();
```

To get reproducible results on every run, initialize the generator with a seed:

```rust
// Pick an arbitrary number as seed.
fastrand::seed(7);

// Now this prints the same number on every run:
println!("{}", fastrand::u32(..));
```

To be more efficient, create a new `Rng` instance instead of using the thread-local
generator:

```rust
use std::iter::repeat_with;

let mut rng = fastrand::Rng::new();
let mut bytes: Vec<u8> = repeat_with(|| rng.u8(..)).take(10_000).collect();
```

This crate aims to expose a core set of useful randomness primitives. For more niche algorithms, consider using the [`fastrand-contrib`] crate alongside this one.

# Features

- `std` (enabled by default): Enables the `std` library. This is required for the global
  generator and global entropy. Without this feature, [`Rng`] can only be instantiated using
  the [`with_seed`](https://docs.rs/fastrand/latest/fastrand/struct.Rng.html#method.with_seed) method.
- `js`: Assumes that WebAssembly targets are being run in a JavaScript environment.

[`fastrand-contrib`]: https://crates.io/crates/fastrand-contrib

## License

Licensed under either of

 * Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or https://www.apache.org/licenses/LICENSE-2.0)
 * MIT license ([LICENSE-MIT](LICENSE-MIT) or https://opensource.org/license/mit)

at your option.

#### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\pin-project-lite-0.2.17\README.md
**SHA:** a6221fce50cc09c1
**Timestamp:** 2026-08-28T02:34:56.137566
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- <!-- tidy:sync-markdown-to-rustdoc:start:src/lib.rs -->

### Ouro Bruto (primeiros 5000 chars)
```
# pin-project-lite

[![crates.io](https://img.shields.io/crates/v/pin-project-lite?style=flat-square&logo=rust)](https://crates.io/crates/pin-project-lite)
[![docs.rs](https://img.shields.io/badge/docs.rs-pin--project--lite-blue?style=flat-square&logo=docs.rs)](https://docs.rs/pin-project-lite)
[![license](https://img.shields.io/badge/license-Apache--2.0_OR_MIT-blue?style=flat-square)](#license)
[![msrv](https://img.shields.io/badge/msrv-1.37-blue?style=flat-square&logo=rust)](https://www.rust-lang.org)
[![github actions](https://img.shields.io/github/actions/workflow/status/taiki-e/pin-project-lite/ci.yml?branch=main&style=flat-square&logo=github)](https://github.com/taiki-e/pin-project-lite/actions)

<!-- tidy:sync-markdown-to-rustdoc:start:src/lib.rs -->

A lightweight version of [pin-project] written with declarative macros.

## Usage

Add this to your `Cargo.toml`:

```toml
[dependencies]
pin-project-lite = "0.2"
```

## Examples

[`pin_project!`] macro creates a projection type covering all the fields of
struct.

```rust
use std::pin::Pin;

use pin_project_lite::pin_project;

pin_project! {
    struct Struct<T, U> {
        #[pin]
        pinned: T,
        unpinned: U,
    }
}

impl<T, U> Struct<T, U> {
    fn method(self: Pin<&mut Self>) {
        let this = self.project();
        let _: Pin<&mut T> = this.pinned; // Pinned reference to the field
        let _: &mut U = this.unpinned; // Normal reference to the field
    }
}
```

To use [`pin_project!`] on enums, you need to name the projection type
returned from the method.

```rust
use std::pin::Pin;

use pin_project_lite::pin_project;

pin_project! {
    #[project = EnumProj]
    enum Enum<T, U> {
        Variant { #[pin] pinned: T, unpinned: U },
    }
}

impl<T, U> Enum<T, U> {
    fn method(self: Pin<&mut Self>) {
        match self.project() {
            EnumProj::Variant { pinned, unpinned } => {
                let _: Pin<&mut T> = pinned;
                let _: &mut U = unpinned;
            }
        }
    }
}
```

## [pin-project] vs pin-project-lite

Here are some similarities and differences compared to [pin-project].

### Similar: Safety

pin-project-lite guarantees safety in much the same way as [pin-project].
Both are completely safe unless you write other unsafe code.

### Different: Minimal design

This library does not tackle as expansive of a range of use cases as
[pin-project] does. If your use case is not already covered, please use
[pin-project].

### Different: No proc-macro related dependencies

This is the **only** reason to use this crate. However, **if you already
have proc-macro related dependencies in your crate's dependency graph, there
is no benefit from using this crate.** (Note: There is almost no difference
in the amount of code generated between [pin-project] and pin-project-lite.)

### Different: No useful error messages

This macro does not handle any invalid input. So error messages are not to
be useful in most cases. If you do need useful error messages, then upon
error you can pass the same input to [pin-project] to receive a helpful
description of the compile error.

### Different: No support for custom Unpin implementation

pin-project supports this by [`UnsafeUnpin`][unsafe-unpin]. (`!Unpin` is supported by both [pin-project][not-unpin] and [pin-project-lite][not-unpin-lite].)

### Different: No support for tuple structs and tuple variants

pin-project supports this.

[not-unpin]: https://docs.rs/pin-project/latest/pin_project/attr.pin_project.html#unpin
[pin-project]: https://github.com/taiki-e/pin-project
[unsafe-unpin]: https://docs.rs/pin-project/latest/pin_project/attr.pin_project.html#unsafeunpin

<!-- tidy:sync-markdown-to-rustdoc:end -->

[not-unpin-lite]: https://docs.rs/pin-project-lite/latest/pin_project_lite/macro.pin_project.html#unpin
[`pin_project!`]: https://docs.rs/pin-project-lite/latest/pin_project_lite/macro.pin_project.html

## License

Licensed under either of [Apache License, Version 2.0](LICENSE-APACHE) or
[MIT license](LICENSE-MIT) at your option.

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall
be dual licensed as above, without any additional terms or conditions.

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\README.md
**SHA:** 852e9fa038c2645d
**Timestamp:** 2026-08-28T02:35:00.755755
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let mut elem = BytesStart::new("my_elem");

### Ouro Bruto (primeiros 5000 chars)
```
# quick-xml

![status](https://github.com/tafia/quick-xml/actions/workflows/rust.yml/badge.svg)
[![Crate](https://img.shields.io/crates/v/quick-xml.svg)](https://crates.io/crates/quick-xml)
[![docs.rs](https://docs.rs/quick-xml/badge.svg)](https://docs.rs/quick-xml)
[![codecov](https://img.shields.io/codecov/c/github/tafia/quick-xml)](https://codecov.io/gh/tafia/quick-xml)
[![MSRV](https://img.shields.io/badge/rustc-1.79.0+-ab6000.svg)](https://blog.rust-lang.org/2024/06/13/Rust-1.79.0/)

High performance xml pull reader/writer.

The reader:
- is almost zero-copy (use of `Cow` whenever possible)
- is easy on memory allocation (the API provides a way to reuse buffers)
- support various encoding (with `encoding` feature), namespaces resolution, special characters.

Syntax is inspired by [xml-rs](https://github.com/netvl/xml-rs).

## Example

### Reader

```rust
use quick_xml::events::Event;
use quick_xml::reader::Reader;

let xml = r#"<tag1 att1 = "test">
                <tag2><!--Test comment-->Test</tag2>
                <tag2>Test 2</tag2>
             </tag1>"#;
let mut reader = Reader::from_str(xml);
reader.config_mut().trim_text(true);

let mut count = 0;
let mut txt = Vec::new();
let mut buf = Vec::new();

// The `Reader` does not implement `Iterator` because it outputs borrowed data (`Cow`s)
loop {
    // NOTE: this is the generic case when we don't know about the input BufRead.
    // when the input is a &str or a &[u8], we don't actually need to use another
    // buffer, we could directly call `reader.read_event()`
    match reader.read_event_into(&mut buf) {
        Err(e) => panic!("Error at position {}: {:?}", reader.error_position(), e),
        // exits the loop when reaching end of file
        Ok(Event::Eof) => break,

        Ok(Event::Start(e)) => {
            match e.name().as_ref() {
                b"tag1" => println!("attributes values: {:?}",
                                    e.attributes().map(|a| a.unwrap().value)
                                    .collect::<Vec<_>>()),
                b"tag2" => count += 1,
                _ => (),
            }
        }
        Ok(Event::Text(e)) => txt.push(e.decode().unwrap().into_owned()),

        // There are several other `Event`s we do not consider here
        _ => (),
    }
    // if we don't keep a borrow elsewhere, we can clear the buffer to keep memory usage low
    buf.clear();
}
```

### Writer

```rust
use quick_xml::events::{Event, BytesEnd, BytesStart};
use quick_xml::reader::Reader;
use quick_xml::writer::Writer;
use std::io::Cursor;

let xml = r#"<this_tag k1="v1" k2="v2"><child>text</child></this_tag>"#;
let mut reader = Reader::from_str(xml);
reader.config_mut().trim_text(true);
let mut writer = Writer::new(Cursor::new(Vec::new()));
loop {
    match reader.read_event() {
        Ok(Event::Start(e)) if e.name().as_ref() == b"this_tag" => {

            // creates a new element ... alternatively we could reuse `e` by calling
            // `e.into_owned()`
            let mut elem = BytesStart::new("my_elem");

            // collect existing attributes
            elem.extend_attributes(e.attributes().map(|attr| attr.unwrap()));

            // copy existing attributes, adds a new my-key="some value" attribute
            elem.push_attribute(("my-key", "some value"));

            // writes the event to the writer
            assert!(writer.write_event(Event::Start(elem)).is_ok());
        },
        Ok(Event::End(e)) if e.name().as_ref() == b"this_tag" => {
            assert!(writer.write_event(Event::End(BytesEnd::new("my_elem"))).is_ok());
        },
        Ok(Event::Eof) => break,
        // we can either move or borrow the event to write, depending on your use-case
        Ok(e) => assert!(writer.write_event(e).is_ok()),
        Err(e) => panic!("Error at position {}: {:?}", reader.error_position(), e),
    }
}

let result = writer.into_inner().into_inner();
let expected = r#"<my_elem k1="v1" k2="v2" my-key="some value"><child>text</child></my_elem>"#;
assert_eq!(result, expected.as_bytes());
```

## Serde

When using the `serialize` feature, quick-xml can be used with serde's `Serialize`/`Deserialize` traits.
The mapping between XML and Rust types, and in particular the syntax that allows you to specify the
distinction between *elements* and *attributes*, is described in detail in the documentation
for [deserialization](https://docs.rs/quick-xml/latest/quick_xml/de/).

### Credits

This has largely been inspired by [serde-xml-rs](https://github.com/RReverser/serde-xml-rs).
quick-xml follows its convention for deserialization, including the
[`$value`](https://github.com/RReverser/serde-xml-rs#parsing-the-value-of-a-tag) special name.

### Parsing the "value" of a tag

If you have an input of the form `<foo abc="xyz">bar</foo>`, and you want to get at the `bar`,
you can use either the special name `$text`, or the special name `$value`:

```rust,ignore
struct Foo {
    #[serde(rename = "@abc")]
    pub abc: String,
 
```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\smallvec-1.15.2\debug_metadata\README.md
**SHA:** 4d7f1c1b2c25ce22
**Timestamp:** 2026-08-28T02:35:43.971624
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- supported by using the `pattern:` prefix for each expected statement.
- pattern:statement[0-9]+
- by using the `pattern:` prefix.

### Ouro Bruto (primeiros 5000 chars)
```
## Debugger Visualizers

Many languages and debuggers enable developers to control how a type is
displayed in a debugger. These are called "debugger visualizations" or "debugger
views".

The Windows debuggers (WinDbg\CDB) support defining custom debugger visualizations using
the `Natvis` framework. To use Natvis, developers write XML documents using the natvis
schema that describe how debugger types should be displayed with the `.natvis` extension.
(See: https://docs.microsoft.com/en-us/visualstudio/debugger/create-custom-views-of-native-objects?view=vs-2019)
The Natvis files provide patterns which match type names a description of how to display
those types.

The Natvis schema can be found either online (See: https://code.visualstudio.com/docs/cpp/natvis#_schema)
or locally at `<VS Installation Folder>\Xml\Schemas\1033\natvis.xsd`.

The GNU debugger (GDB) supports defining custom debugger views using Pretty Printers.
Pretty printers are written as python scripts that describe how a type should be displayed
when loaded up in GDB/LLDB. (See: https://sourceware.org/gdb/onlinedocs/gdb/Pretty-Printing.html#Pretty-Printing)
The pretty printers provide patterns, which match type names, and for matching
types, describe how to display those types. (For writing a pretty printer, see: https://sourceware.org/gdb/onlinedocs/gdb/Writing-a-Pretty_002dPrinter.html#Writing-a-Pretty_002dPrinter).

### Embedding Visualizers

Through the use of the currently unstable `#[debugger_visualizer]` attribute, the `smallvec`
crate can embed debugger visualizers into the crate metadata.

Currently the two types of visualizers supported are Natvis and Pretty printers.

For Natvis files, when linking an executable with a crate that includes Natvis files,
the MSVC linker will embed the contents of all Natvis files into the generated `PDB`.

For pretty printers, the compiler will encode the contents of the pretty printer
in the `.debug_gdb_scripts` section of the `ELF` generated.

### Testing Visualizers

The `smallvec` crate supports testing debugger visualizers defined for this crate. The entry point for
these tests are `tests/debugger_visualizer.rs`. These tests are defined using the `debugger_test` and
`debugger_test_parser` crates. The `debugger_test` crate is a proc macro crate which defines a
single proc macro attribute, `#[debugger_test]`. For more detailed information about this crate,
see https://crates.io/crates/debugger_test. The CI pipeline for the `smallvec` crate has been updated
to run the debugger visualizer tests to ensure debugger visualizers do not become broken/stale.

The `#[debugger_test]` proc macro attribute may only be used on test functions and will run the
function under the debugger specified by the `debugger` meta item.

This proc macro attribute has 3 required values:

1. The first required meta item, `debugger`, takes a string value which specifies the debugger to launch.
2. The second required meta item, `commands`, takes a string of new line (`\n`) separated list of debugger
commands to run.
3. The third required meta item, `expected_statements`, takes a string of new line (`\n`) separated list of
statements that must exist in the debugger output. Pattern matching through regular expressions is also
supported by using the `pattern:` prefix for each expected statement.

#### Example:

```rust
#[debugger_test(
    debugger = "cdb",
    commands = "command1\ncommand2\ncommand3",
    expected_statements = "statement1\nstatement2\nstatement3")]
fn test() {

}
```

Using a multiline string is also supported, with a single debugger command/expected statement per line:

```rust
#[debugger_test(
    debugger = "cdb",
    commands = "
command1
command2
command3",
    expected_statements = "
statement1
pattern:statement[0-9]+
statement3")]
fn test() {
    
}
```

In the example above, the second expected statement uses pattern matching through a regular expression
by using the `pattern:` prefix.

#### Testing Locally

Currently, only Natvis visualizations have been defined for the `smallvec` crate via `debug_metadata/smallvec.natvis`,
which means the `tests/debugger_visualizer.rs` tests need to be run on Windows using the `*-pc-windows-msvc` targets.
To run these tests locally, first ensure the debugging tools for Windows are installed or install them following
the steps listed here, [Debugging Tools for Windows](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/).
Once the debugging tools have been installed, the tests can be run in the same manner as they are in the CI
pipeline.

#### Note

When running the debugger visualizer tests, `tests/debugger_visualizer.rs`, they need to be run consecutively
and not in parallel. This can be achieved by passing the flag `--test-threads=1` to rustc. This is due to
how the debugger tests are run. Each test marked with the `#[debugger_test]` attribute launches a debugger
and attaches it to the current test process. If tests are running in parallel, the test wil
```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tinyvec-1.12.0\debug_metadata\README.md
**SHA:** 28d60ba446096904
**Timestamp:** 2026-08-28T02:36:10.198418
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- supported by using the `pattern:` prefix for each expected statement.
- pattern:statement[0-9]+
- by using the `pattern:` prefix.

### Ouro Bruto (primeiros 5000 chars)
```
## Debugger Visualizers

Many languages and debuggers enable developers to control how a type is
displayed in a debugger. These are called "debugger visualizations" or "debugger
views".

The Windows debuggers (WinDbg\CDB) support defining custom debugger visualizations using
the `Natvis` framework. To use Natvis, developers write XML documents using the natvis
schema that describe how debugger types should be displayed with the `.natvis` extension.
(See: https://docs.microsoft.com/en-us/visualstudio/debugger/create-custom-views-of-native-objects?view=vs-2019)
The Natvis files provide patterns which match type names a description of how to display
those types.

The Natvis schema can be found either online (See: https://code.visualstudio.com/docs/cpp/natvis#_schema)
or locally at `<VS Installation Folder>\Xml\Schemas\1033\natvis.xsd`.

The GNU debugger (GDB) supports defining custom debugger views using Pretty Printers.
Pretty printers are written as python scripts that describe how a type should be displayed
when loaded up in GDB/LLDB. (See: https://sourceware.org/gdb/onlinedocs/gdb/Pretty-Printing.html#Pretty-Printing)
The pretty printers provide patterns, which match type names, and for matching
types, describe how to display those types. (For writing a pretty printer, see: https://sourceware.org/gdb/onlinedocs/gdb/Writing-a-Pretty_002dPrinter.html#Writing-a-Pretty_002dPrinter).

### Embedding Visualizers

Through the use of the currently unstable `#[debugger_visualizer]` attribute, the `tinyvec`
crate can embed debugger visualizers into the crate metadata.

Currently the two types of visualizers supported are Natvis and Pretty printers.

For Natvis files, when linking an executable with a crate that includes Natvis files,
the MSVC linker will embed the contents of all Natvis files into the generated `PDB`.

For pretty printers, the compiler will encode the contents of the pretty printer
in the `.debug_gdb_scripts` section of the `ELF` generated.

### Testing Visualizers

The `tinyvec` crate supports testing debugger visualizers defined for this crate. The entry point for
these tests are `tests/debugger_visualizer.rs`. These tests are defined using the `debugger_test` and
`debugger_test_parser` crates. The `debugger_test` crate is a proc macro crate which defines a
single proc macro attribute, `#[debugger_test]`. For more detailed information about this crate,
see https://crates.io/crates/debugger_test. The CI pipeline for the `tinyvec` crate has been updated
to run the debugger visualizer tests to ensure debugger visualizers do not become broken/stale.

The `#[debugger_test]` proc macro attribute may only be used on test functions and will run the
function under the debugger specified by the `debugger` meta item.

This proc macro attribute has 3 required values:

1. The first required meta item, `debugger`, takes a string value which specifies the debugger to launch.
2. The second required meta item, `commands`, takes a string of new line (`\n`) separated list of debugger
commands to run.
3. The third required meta item, `expected_statements`, takes a string of new line (`\n`) separated list of
statements that must exist in the debugger output. Pattern matching through regular expressions is also
supported by using the `pattern:` prefix for each expected statement.

#### Example:

```rust
#[debugger_test(
    debugger = "cdb",
    commands = "command1\ncommand2\ncommand3",
    expected_statements = "statement1\nstatement2\nstatement3")]
fn test() {

}
```

Using a multiline string is also supported, with a single debugger command/expected statement per line:

```rust
#[debugger_test(
    debugger = "cdb",
    commands = "
command1
command2
command3",
    expected_statements = "
statement1
pattern:statement[0-9]+
statement3")]
fn test() {
    
}
```

In the example above, the second expected statement uses pattern matching through a regular expression
by using the `pattern:` prefix.

#### Testing Locally

Currently, only Natvis visualizations have been defined for the `tinyvec` crate via `debug_metadata/tinyvec.natvis`,
which means the `tests/debugger_visualizer.rs` tests need to be run on Windows using the `*-pc-windows-msvc` targets.
To run these tests locally, first ensure the debugging tools for Windows are installed or install them following
the steps listed here, [Debugging Tools for Windows](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/).
Once the debugging tools have been installed, the tests can be run in the same manner as they are in the CI
pipeline.

#### Note

When running the debugger visualizer tests, `tests/debugger_visualizer.rs`, they need to be run consecutively
and not in parallel. This can be achieved by passing the flag `--test-threads=1` to rustc. This is due to
how the debugger tests are run. Each test marked with the `#[debugger_test]` attribute launches a debugger
and attaches it to the current test process. If tests are running in parallel, the test will try
```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\urlpattern-0.3.0\README.md
**SHA:** a2980f461122c8a6
**Timestamp:** 2026-08-28T02:36:33.501043
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- use urlpattern::UrlPattern;
- use urlpattern::UrlPatternInput;
- use urlpattern::UrlPatternInit;
- use urlpattern::UrlPattern;
- use urlpattern::UrlPatternInit;
- use urlpattern::UrlPatternMatchInput;
- let pattern = <UrlPattern>::parse(init).unwrap();

### Ouro Bruto (primeiros 5000 chars)
```
# urlpattern

This crate implements the [`URLPattern` web API][urlpattern] in Rust. We aim to
follow [the specification][spec] as closely as possible.

[urlpattern]: https://github.com/WICG/urlpattern
[spec]: https://wicg.github.io/urlpattern/

## Example

```rust
use urlpattern::UrlPattern;
use urlpattern::UrlPatternInput;
use urlpattern::UrlPatternInit;

use urlpattern::UrlPattern;
use urlpattern::UrlPatternInit;
use urlpattern::UrlPatternMatchInput;

fn main() {
  // Create the UrlPattern to match against.
  let init = UrlPatternInit {
    pathname: Some("/users/:id".to_owned()),
    ..Default::default()
  };
  let pattern = <UrlPattern>::parse(init).unwrap();

  // Match the pattern against a URL.
  let url = "https://example.com/users/123".parse().unwrap();
  let result = pattern.exec(UrlPatternMatchInput::Url(url)).unwrap().unwrap();
  assert_eq!(result.pathname.groups.get("id").unwrap(), "123");
}
```

## Contributing

We appreciate your help!

The code of conduct from the Deno repository applies here too:
https://github.com/denoland/deno/blob/main/.github/CODE_OF_CONDUCT.md.

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\lib\README.md
**SHA:** ea55b6b4ca9d0dfe
**Timestamp:** 2026-08-28T02:57:35.752839
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Regra: evitar cabecalhos, cores e estilos visuais manuais em scripts novos.

### Ouro Bruto (primeiros 5000 chars)
```
# scripts/lib

Biblioteca oficial de helpers reutilizaveis dos scripts CentralDark / MultiZap.

## Tema Netflix Centralizado

Fontes da verdade:

```txt
scripts/lib/theme.sh
scripts/lib/theme-node.mjs
```

Scripts Bash da VPS devem carregar `theme.sh`. Scripts Node devem importar
`theme-node.mjs`, que usa Chalk quando disponivel e mantem fallback seguro para
terminais sem dependencia instalada.

Funcoes Bash disponiveis:

- `netflix_header`
- `netflix_step`
- `netflix_success`
- `netflix_info`
- `netflix_warning`
- `netflix_error`
- `netflix_done`
- `netflix_confirm`
- `netflix_progress_bar`
- `netflix_loading`

Funcoes Node disponiveis:

- `netflixHeader`
- `netflixStep`
- `netflixSuccess`
- `netflixInfo`
- `netflixWarning`
- `netflixError`
- `netflixDone`
- `createSpinner`
- `runWithSpinner`
- `sanitizeLog`
- `writeLog`

Regra: evitar cabecalhos, cores e estilos visuais manuais em scripts novos.
Logs completos devem ir para `revisoes/`; no terminal fica apenas o resumo limpo.
Nunca imprimir secrets, tokens, `.env`, sessoes ou cookies.

Exemplo Bash:

```bash
source "/root/CentralDark/scripts/lib/theme.sh"

netflix_header
netflix_step 1 4 "Validando ambiente"
netflix_success "Ambiente validado"
netflix_done
```

Exemplo Node:

```js
import {
  netflixHeader,
  netflixStep,
  netflixSuccess,
  netflixDone,
} from './theme-node.mjs';

netflixHeader();
netflixStep(1, 4, 'Validando ambiente');
netflixSuccess('Ambiente validado');
netflixDone();
```

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\notion-sync\README.md
**SHA:** f77c67435bdde503
**Timestamp:** 2026-08-28T02:57:37.349972
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- No Run workflow, deixar `dry_run: true` (padrão). O script imprime o que **faria** sem escrever no Notion. Use sempre antes da primeira execução real.
- `dry_run: false` — escreve de verdade.

### Ouro Bruto (primeiros 5000 chars)
```
# scripts/notion-sync

Script oficial que espelha o conteúdo de `docs/CONSCIENCIA/` para os databases do Notion.

## Lei

- **Git é fonte da verdade** (`docs/CONSCIENCIA/`).
- **Notion é painel humano** (databases na página `CentralDark • Consolidação`).
- O script é **estritamente downstream**: Git → Notion. Nunca o contrário.

Ver: [`docs/CONSCIENCIA/REGRA-OFICIAL-HIERARQUIA-MEMORIA.md`](../../docs/CONSCIENCIA/REGRA-OFICIAL-HIERARQUIA-MEMORIA.md).

## Como roda

Automaticamente pelo workflow [`.github/workflows/notion-sync.yml`](../../.github/workflows/notion-sync.yml) em todo push na `main` que toque os arquivos espelhados, ou manualmente via **Actions → Notion Sync → Run workflow**.

### Modo validação (dry-run)

No Run workflow, deixar `dry_run: true` (padrão). O script imprime o que **faria** sem escrever no Notion. Use sempre antes da primeira execução real.

### Modo execução

`dry_run: false` — escreve de verdade.

## UPSERT (anti-duplicação)

Para cada item:

1. Calcula um título determinístico.
2. Consulta o database por esse título (`databases.query` com filtro `title.equals`).
3. Se existir → `pages.update` (atualiza propriedades).
4. Se não existir → `pages.create`.

Resultado: rodar 100 vezes não duplica nada.

## Targets

- `all` (padrão) — tudo
- `regras` — só `📜 Regras do Projeto`
- `pendencias` — só `🔥 Pendências Ativas`
- `decisoes` — só `⚖️ Registro de Decisões`
- `aprendizados` — só `🧠 Aprendizados`

## Logs

Cada execução escreve um relatório em `docs/RELATORIOS/notion-sync/`:
- `latest.md` — última execução
- `YYYY-MM-DDTHH-MM-SS.md` — histórico imutável

O workflow commita esses arquivos automaticamente (apenas em execução real, não em dry-run).

## Secret necessário

`NOTION_API_KEY` no repositório (Settings → Secrets → Actions). Token de integração interna do Notion com acesso aos 4 databases listados em [`docs/CONSCIENCIA/NOTION-MAPA.md`](../../docs/CONSCIENCIA/NOTION-MAPA.md).

```
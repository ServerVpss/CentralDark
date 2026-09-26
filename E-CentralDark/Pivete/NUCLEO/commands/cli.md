# COMANDO - cli.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\build-web-apps\skills\shadcn-best-practices\cli.md
**SHA:** ba3bc1f4466daf1f
**Timestamp:** 2026-08-26T18:31:16.965189
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- **When to use dry-run:**

### Ouro Bruto (primeiros 5000 chars)
```
# shadcn CLI Reference

Configuration is read from `components.json`.

> **IMPORTANT:** Always run commands using the project's package runner: `npx shadcn@latest`, `pnpm dlx shadcn@latest`, or `bunx --bun shadcn@latest`. Check `packageManager` from project context to choose the right one. Examples below use `npx shadcn@latest` but substitute the correct runner for the project.

> **IMPORTANT:** Only use the flags documented below. Do not invent or guess flags — if a flag isn't listed here, it doesn't exist. The CLI auto-detects the package manager from the project's lockfile; there is no `--package-manager` flag.

## Contents

- Commands: init, add (dry-run, smart merge), search, view, docs, info, build
- Templates: next, vite, start, react-router, astro
- Presets: named, code, URL formats and fields
- Switching presets

---

## Commands

### `init` — Initialize or create a project

```bash
npx shadcn@latest init [components...] [options]
```

Initializes shadcn/ui in an existing project or creates a new project (when `--name` is provided). Optionally installs components in the same step.

| Flag                    | Short | Description                                               | Default |
| ----------------------- | ----- | --------------------------------------------------------- | ------- |
| `--template <template>` | `-t`  | Template (next, start, vite, next-monorepo, react-router) | —       |
| `--preset [name]`       | `-p`  | Preset configuration (named, code, or URL)                | —       |
| `--yes`                 | `-y`  | Skip confirmation prompt                                  | `true`  |
| `--defaults`            | `-d`  | Use defaults (`--template=next --preset=base-nova`)       | `false` |
| `--force`               | `-f`  | Force overwrite existing configuration                    | `false` |
| `--cwd <cwd>`           | `-c`  | Working directory                                         | current |
| `--name <name>`         | `-n`  | Name for new project                                      | —       |
| `--silent`              | `-s`  | Mute output                                               | `false` |
| `--rtl`                 |       | Enable RTL support                                        | —       |
| `--reinstall`           |       | Re-install existing UI components                         | `false` |
| `--monorepo`            |       | Scaffold a monorepo project                               | —       |
| `--no-monorepo`         |       | Skip the monorepo prompt                                  | —       |

`npx shadcn@latest create` is an alias for `npx shadcn@latest init`.

### `add` — Add components

> **IMPORTANT:** To compare local components against upstream or to preview changes, ALWAYS use `npx shadcn@latest add <component> --dry-run`, `--diff`, or `--view`. NEVER fetch raw files from GitHub or other sources manually. The CLI handles registry resolution, file paths, and CSS diffing automatically.

```bash
npx shadcn@latest add [components...] [options]
```

Accepts component names, registry-prefixed names (`@magicui/shimmer-button`), URLs, or local paths.

| Flag            | Short | Description                                                                                                          | Default |
| --------------- | ----- | -------------------------------------------------------------------------------------------------------------------- | ------- |
| `--yes`         | `-y`  | Skip confirmation prompt                                                                                             | `false` |
| `--overwrite`   | `-o`  | Overwrite existing files                                                                                             | `false` |
| `--cwd <cwd>`   | `-c`  | Working directory                                                                                                    | current |
| `--all`         | `-a`  | Add all available components                                                                                         | `false` |
| `--path <path>` | `-p`  | Target path for the component                                                                                        | —       |
| `--silent`      | `-s`  | Mute output                                                                                                          | `false` |
| `--dry-run`     |       | Preview all changes without writing files                                                                            | `false` |
| `--diff [path]` |       | Show diffs. Without a path, shows the first 5 files. With a path, shows that file only (implies `--dry-run`)         | —       |
| `--view [path]` |       | Show file contents. Without a path, shows the first 5 files. With a path, shows that file only (implies `--dry-run`) | —       |

#### Dry-Run Mode

Use `--dry-run` to preview what `add` would do without writing any files. `--diff` and `--vi
```

---

# COMANDO - cli.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\tsx\dist\cli.mjs
**SHA:** 5d5b2a9f9cf4d6a8
**Timestamp:** 2026-08-26T19:32:28.858488
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- `),s(),process.exit(1);t[o]=c}}a(gt,"b");function ii(t){return t===void 0||t!==!1}a(ii,"W");function Wu(t,e,u,s){const n={...e.flags},r=e.version;r&&(n.version={type:Boolean,description:"Show version"
- `,CHAR_NO_BREAK_SPACE:"\xA0",CHAR_PERCENT:"%",CHAR_PLUS:"+",CHAR_QUESTION_MARK:"?",CHAR_RIGHT_ANGLE_BRACKET:">",CHAR_RIGHT_CURLY_BRACE:"}",CHAR_RIGHT_SQUARE_BRACKET:"]",CHAR_SEMICOLON:";",CHAR_SINGLE_

### Padroes
- */const Ts=QD,ae=a((t,e,u)=>{if(Ts(t)===!1)throw new TypeError("toRegexRange: expected the first argument to be a number");if(e===void 0||t===e)return String(t);if(Ts(e)===!1)throw new TypeError("toRe

### Riscos
- `),s(),process.exit(1);t[o]=c}}a(gt,"b");function ii(t){return t===void 0||t!==!1}a(ii,"W");function Wu(t,e,u,s){const n={...e.flags},r=e.version;r&&(n.version={type:Boolean,description:"Show version"
- */const io=ge,Is=ro,ks=a(t=>t!==null&&typeof t=="object"&&!Array.isArray(t),"isObject"),Do=a(t=>e=>t===!0?Number(e):String(e),"transform"),Yt=a(t=>typeof t=="number"||typeof t=="string"&&t!=="","isVal

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
var Rn=Object.defineProperty;var a=(t,e)=>Rn(t,"name",{value:e,configurable:!0});import{constants as lt}from"node:os";import bn from"tty";import{transformSync as vn}from"esbuild";import{v as Sn}from"./package-Bj47PlGH.mjs";import{r as Ie,g as Bn,i as $n}from"./get-pipe-path-_tAJyU_v.mjs";import{pathToFileURL as Tn,fileURLToPath as xn}from"node:url";import On from"child_process";import z from"path";import De from"fs";import{i as mu,a as Nn,t as Hn}from"./node-features-B9BBLzwu.mjs";import Pn from"node:path";import Ln from"events";import ge from"util";import In from"stream";import _u from"os";import{g as kn,l as Mn,e as Gn,f as Wn,y as me}from"./index-gbaejti9.mjs";import jn from"node:net";import ct from"node:fs";import{t as Un}from"./temporary-directory-BDDVQOvU.mjs";import"module";const Kn="known-flag",Vn="unknown-flag",zn="argument",{stringify:_e}=JSON,Yn=/\B([A-Z])/g,qn=a(t=>t.replace(Yn,"-$1").toLowerCase(),"v$1"),{hasOwnProperty:Xn}=Object.prototype,Ae=a((t,e)=>Xn.call(t,e),"w$2"),Qn=a(t=>Array.isArray(t),"L$2"),Au=a(t=>typeof t=="function"?[t,!1]:Qn(t)?[t[0],!0]:Au(t.type),"b$2"),Zn=a((t,e)=>t===Boolean?e!=="false":e,"d$2"),Jn=a((t,e)=>typeof e=="boolean"?e:t===Number&&e===""?Number.NaN:t(e),"m$1"),er=/[\s.:=]/,tr=a(t=>{const e=`Flag name ${_e(t)}`;if(t.length===0)throw new Error(`${e} cannot be empty`);if(t.length===1)throw new Error(`${e} must be longer than a character`);const u=t.match(er);if(u)throw new Error(`${e} cannot contain ${_e(u?.[0])}`)},"B"),ur=a(t=>{const e={},u=a((s,n)=>{if(Ae(e,s))throw new Error(`Duplicate flags named ${_e(s)}`);e[s]=n},"r");for(const s in t){if(!Ae(t,s))continue;tr(s);const n=t[s],r=[[],...Au(n),n];u(s,r);const i=qn(s);if(s!==i&&u(i,r),"alias"in n&&typeof n.alias=="string"){const{alias:D}=n,o=`Flag alias ${_e(D)} for flag ${_e(s)}`;if(D.length===0)throw new Error(`${o} cannot be empty`);if(D.length>1)throw new Error(`${o} must be a single character`);u(D,r)}}return e},"K$1"),sr=a((t,e)=>{const u={};for(const s in t){if(!Ae(t,s))continue;const[n,,r,i]=e[s];if(n.length===0&&"default"in i){let{default:D}=i;typeof D=="function"&&(D=D()),u[s]=D}else u[s]=r?n:n.pop()}return u},"_$2"),ke="--",nr=/[.:=]/,rr=/^-{1,2}\w/,ir=a(t=>{if(!rr.test(t))return;const e=!t.startsWith(ke);let u=t.slice(e?1:2),s;const n=u.match(nr);if(n){const{index:r}=n;s=u.slice(r+1),u=u.slice(0,r)}return[u,s,e]},"N"),Dr=a((t,{onFlag:e,onArgument:u})=>{let s;const n=a((r,i)=>{if(typeof s!="function")return!0;s(r,i),s=void 0},"o");for(let r=0;r<t.length;r+=1){const i=t[r];if(i===ke){n();const o=t.slice(r+1);u?.(o,[r],!0);break}const D=ir(i);if(D){if(n(),!e)continue;const[o,c,f]=D;if(f)for(let h=0;h<o.length;h+=1){n();const l=h===o.length-1;s=e(o[h],l?c:void 0,[r,h+1,l])}else s=e(o,c,[r])}else n(i,[r])&&u?.([i],[r])}n()},"$$1"),or=a((t,e)=>{for(const[u,s,n]of e.reverse()){if(s){const r=t[u];let i=r.slice(0,s);if(n||(i+=r.slice(s+1)),i!=="-"){t[u]=i;continue}}t.splice(u,1)}},"E"),yu=a((t,e=process.argv.slice(2),{ignore:u}={})=>{const s=[],n=ur(t),r={},i=[];return i[ke]=[],Dr(e,{onFlag(D,o,c){const f=Ae(n,D);if(!u?.(f?Kn:Vn,D,o)){if(f){const[h,l]=n[D],p=Zn(l,o),C=a((g,y)=>{s.push(c),y&&s.push(y),h.push(Jn(l,g||""))},"p");return p===void 0?C:C(p)}Ae(r,D)||(r[D]=[]),r[D].push(o===void 0?!0:o),s.push(c)}},onArgument(D,o,c){u?.(zn,e[o[0]])||(i.push(...D),c?(i[ke]=D,e.splice(o[0])):s.push(o))}}),or(e,s),{flags:sr(t,n),unknownFlags:r,_:i}},"U$2");var ar=Object.create,Me=Object.defineProperty,lr=Object.defineProperties,cr=Object.getOwnPropertyDescriptor,fr=Object.getOwnPropertyDescriptors,hr=Object.getOwnPropertyNames,wu=Object.getOwnPropertySymbols,dr=Object.getPrototypeOf,Ru=Object.prototype.hasOwnProperty,Er=Object.prototype.propertyIsEnumerable,bu=a((t,e,u)=>e in t?Me(t,e,{enumerable:!0,configurable:!0,writable:!0,value:u}):t[e]=u,"W$1"),Ge=a((t,e)=>{for(var u in e||(e={}))Ru.call(e,u)&&bu(t,u,e[u]);if(wu)for(var u of wu(e))Er.call(e,u)&&bu(t,u,e[u]);return t},"p"),ft=a((t,e)=>lr(t,fr(e)),"c"),pr=a(t=>Me(t,"__esModule",{value:!0}),"nD"),Cr=a((t,e)=>()=>(t&&(e=t(t=0)),e),"rD"),Fr=a((t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),"iD"),gr=a((t,e,u,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of hr(e))!Ru.call(t,n)&&n!=="default"&&Me(t,n,{get:a(()=>e[n],"get"),enumerable:!(s=cr(e,n))||s.enumerable});return t},"oD"),mr=a((t,e)=>gr(pr(Me(t!=null?ar(dr(t)):{},"default",{value:t,enumerable:!0})),t),"BD"),K=Cr(()=>{}),_r=Fr((t,e)=>{K(),e.exports=function(){return/\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\
```
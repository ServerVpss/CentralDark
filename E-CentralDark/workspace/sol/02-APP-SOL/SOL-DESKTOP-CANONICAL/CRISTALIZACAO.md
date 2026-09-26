# SOL-DESKTOP — Cristalização Canônica

## Owner
SOL (Orquestradora CentralDark)

## Propósito
Implementação clean-room do app desktop SOL, baseada no snapshot de referência 
fornecido por SEGREDO/CHEFE em `sol-desktop-poc-source.zip`.

## Origem
- ZIP fonte: `sol-desktop-poc-source.zip` (25,636 bytes, 17 entradas)
- Hash do snapshot de referência: `378848b430f182bc54b48839e2eef09c20220aaa7ee7c8d9bb725283490de009`
- Extraído em: 2026-08-29 05:27
- Localização original: `E:\CentralDark\workspace\sol\sol-desktop-poc-source\`

## O que foi preservado
- `apps/sol-desktop/src/` — código fonte (App.tsx, core/, lib/, main.tsx, styles/)
- `apps/sol-desktop/index.html` — entry point
- `apps/sol-desktop/package.json` — dependências npm
- `apps/sol-desktop/vite.config.ts` — config build Vite
- `apps/sol-desktop/tsconfig.json` — config TypeScript
- `apps/sol-desktop/.env.example` — template env
- `apps/sol-desktop/README.md` — documentação
- `apps/sol-desktop/verify-signing.ps1` — validação de assinatura
- `docs/REFERENCIAS/APPCENTRALDARK-EVOLUIR-LOCAL-SNAPSHOT.md` — referência arquitetural
- `third_party/sol-pacote-continuidade.zip` — artefato de continuidade

## O que não foi commitado (build artifacts)
- `node_modules/` — dependências npm (regenerável via npm install)
- `dist/` — build output (regenerável via npm run build)
- `.overcloud-app/` — estado local/banco (secreto, não versionar)

## Regra de clean-room
Esta implementação é **clean-room**: derivada do snapshot de referência, não cópia 
literal. O snapshot original contém binários, dependências compiladas e estado local 
que não podem ser redistribuídos integralmente.

Referência: `docs/REFERENCIAS/APPCENTRALDARK-EVOLUIR-LOCAL-SNAPSHOT.md`

## Como reconstruir
```bash
cd apps/sol-desktop
npm install
npm run build
```

## Links
- CentralDark: https://github.com/ServerVpss/CentralDark
- Status: CRISTALIZADO 2026-08-29

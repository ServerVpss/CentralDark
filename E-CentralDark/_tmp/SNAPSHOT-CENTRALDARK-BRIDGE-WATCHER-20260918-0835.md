# 👑🪬 SNAPSHOT — BRIDGE/TRAY + WATCHER ÚNICO + DELTA ÚTIL

observed_at: 2026-09-18T08:35:39-03:00
scope: SESSION_CANDIDATE_NOT_CRYSTALLIZED

## ⭕ Âncora

**ÂNCORA ANTERIOR + DELTA NOVO → RECONCILIAR — NÃO RECOMEÇAR**

## 🧭 Corpo atual observado

- `E:\CentralDark\CentralDark-Unified-OneShot` = corpo material mais novo/local para Bridge + Tray + OAuth + Remote + Screenpipe.
- `dist\CentralDarkBridge.exe` = existe.
- `%LOCALAPPDATA%\CentralDark\UnifiedRuntime` = não existe neste snapshot.
- `%USERPROFILE%\.desktop-commander-device\device.json` = existe; sessão persistida foi observada sem expor valores.
- `screenpipe-app` = processo observado vivo.
- `Hermes` = múltiplos processos observados vivos.
- `CentralDarkBridge` = não observado vivo no snapshot.

## 🔗 Arquitetura reconciliada candidata

```text
ÂNCORA ANTERIOR
      +
DELTA NOVO
      ↓
RECONCILIAR — NÃO RECOMEÇAR

VPS/HERMES
      ↓
WATCHER ÚNICO _MAPA_CASA
      ↓
evento de filesystem
(path + hash + mtime + tipo)
      ↓
ROTEADOR POR SETOR
      ├─ A_EVIDENCIAS
      ├─ B_GITHUB_REMOTO
      ├─ C_HERMES_LOCAL
      ├─ D_OURO_DESCARTADO
      ├─ E_PASTAS_USUARIO
      ├─ F_RECONCILIACAO_GROK
      ├─ G_WEBMCP_INSPECAO
      ├─ GARIMPO-CHEFE
      ├─ H_ZIP_INVENTARIO
      ├─ HARNESS-INVENTARIO
      └─ Y_CYBERSEC-REF
              ↓
       OWNER/CAPABILITY EXISTENTE
              ↓
     RECONCILIA CONTRA MAIN
              ↓
 DUPLICADO ─→ NO_CHANGE
 UNKNOWN   ─→ PRESERVA + RECEIPT
 DELTA ÚTIL→ SUB-PR/FUNIL #1562
              ↓
        SAME-HEAD GATES
              ↓
             MAIN
              ↓
 MICRO-DEPLOY SOMENTE SE APLICÁVEL
              ↓
 RECEIPT + HANDOFF + NEXT_CURSOR
```

## 🧩 Encaixe com Bridge/Tray

- Tray não é segundo produto: é o estado minimizado do mesmo Bridge.
- Bridge aberto = UI/SOL/control plane local.
- Bridge minimizado = mesmo processo na bandeja do Windows.
- Remote Desktop Commander, Screenpipe e Hermes entram como capabilities do mesmo corpo/MCP.
- Watcher único não cria agente por pasta; ele roteia eventos para owners existentes.
- Candidate só sobrevive se gerar ΔU material e convergir no owner.

## 💎 Candidatos de cristalização (ainda NÃO cristalizados)

1. `BRIDGE_TRAY_SAME_PROCESS=true` — um EXE, uma instância, janela + bandeja.
2. `VENDORED_REMOTE_OVER_NPX_CACHE=true` — preferir Desktop Commander vendorizado ao cache NPX quando comprovado funcional.
3. `PERSISTED_REMOTE_SESSION_REUSE=true` — preservar `device.json`, nunca logar/copiar token.
4. `WATCHER_SINGLE_ENGINE=true` — watcher único sobre `_MAPA_CASA`, roteamento por setor, zero agentes duplicados.
5. `DELTA_UTILITY_GATE=true` — ΔU material decide se vira ouro; repetição vira NO_CHANGE.
6. `SAME_HEAD_GATE_BEFORE_PROMOTION=true` — sub-PR/receipt só promove após gate no mesmo HEAD.
7. `RUNTIME_RECEIPT_REQUIRED=true` — processo/arquivo/documento não substitui prova de runtime.
8. `BRIDGEMIND_TERMINAL_ASSIST_REUSE=true` — OSC 133 + OSC 9;9 já existem no pacote e devem ser herdados.

## ⚖️ Gate

`TLC23/HORN → PDF_GATE → CONTRAPROVA → PASS`

Sem nova evidência suficiente: amarelo/vermelho não muda.

## 🪶 Versos de trajetória

> “Examinai tudo. Retende o bem.” — 1Ts 5:21

**Baianês operacional:**  
Ôchí, ouro não é tudo que brilha no mapa; ouro é o delta que muda a rota sem inventar estrada nova.

## NEXT_CURSOR

Fundir Bridge + Tray no mesmo EXE/processo, reutilizar sessão Remote já persistida, subir runtime local único e provar minimiza→tray→restaura + device online + tool call real, antes de qualquer CRISTALIZA.

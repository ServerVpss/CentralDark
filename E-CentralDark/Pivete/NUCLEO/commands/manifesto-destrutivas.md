# COMANDO - manifesto-destrutivas.json
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\manifesto-destrutivas.json
**SHA:** 437b690229fa01bc
**Timestamp:** 2026-08-28T02:54:30.630964
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- "Para aprovar uma pendente: rode",

### Ouro Bruto (primeiros 5000 chars)
```
{
  "_leia_me": [
    "DOIS conjuntos, nunca confundir:",
    "",
    "  destrutivasAprovadas  passaram por revisao humana e pelo gate final.",
    "                        E a UNICA lista que o admin-guard aceita.",
    "  destrutivasEmRevisao  existem no codigo mas ainda nao provaram",
    "                        compensacao transacional. Ficam em QUARENTENA:",
    "                        bloqueadas pontualmente, sem derrubar as outras.",
    "",
    "Estar publicada no /tools.json NAO aprova nada — prova superficie, nao",
    "revisao. O runtime apenas COMPARA com este arquivo; nunca se autoautoriza.",
    "",
    "CUIDADO com dois enganos ja cometidos nesta base:",
    "  1. 'nao existe tool compensadora no catalogo' NAO e o mesmo que",
    "     'a acao nao tem compensacao possivel'. As 6 em revisao TEM caminho",
    "     de compensacao nas APIs oficiais; falta construir e provar.",
    "  2. Uma tool de update NAO compensa uma tool de create. Atualizar",
    "     titulo ou estado deixa o recurso existindo.",
    "",
    "GATE FINAL — uma candidata so entra em destrutivasAprovadas quando todos",
    "os nove forem SIM, provados por execucao real:",
    "  AUTHORIZATION_PROVED       exige confirmAdmin e escopo admin",
    "  STATE_BEFORE_CAPTURED      estado anterior capturado antes de agir",
    "  ACTION_PROVED              o efeito foi observado, nao presumido",
    "  RECEIPT_PERSISTED          operation_id e resource_id gravados",
    "  COMPENSATION_EXECUTED      a compensacao rodou de verdade",
    "  ORIGINAL_STATE_RESTORED    o estado original voltou, campo a campo",
    "  DOUBLE_COMPENSATION_SAFE   compensar duas vezes nao quebra",
    "  NEGATIVE_TESTS_PASS        sem confirmacao, sem escopo, recurso ausente",
    "  NO_SECRET_LEAK             nenhum valor sensivel no recibo nem no log",
    "",
    "Para aprovar uma pendente: rode",
    "  node scripts/gerar-manifesto-destrutivas.mjs --revisar",
    "construa o compensador NO MESMO modulo (nao criar sistema paralelo),",
    "prove a sequencia ACAO -> EFEITO -> COMPENSACAO -> REVERSAO, e so entao",
    "mova a entrada para destrutivasAprovadas no MESMO PR.",
    "",
    "Toda entrada em destrutivasEmRevisao precisa de porQueNaoPassa,",
    "compensacaoAConstruir, responsavel, ultimoTeste e proximoExperimento.",
    "Sem isso o gate falha — pendencia sem plano vira divida invisivel."
  ],
  "versaoFormato": 1,
  "revisadoEm": "2026-08-15",
  "revisadoPor": "Chefe/SEGREDO via missao ADMIN_PROVIDER_CONTROL_PLANE_20260815",
  "geradoPor": "scripts/gerar-manifesto-destrutivas.mjs",
  "resumo": {
    "descobertasNoCodigo": 18,
    "aprovadas": 12,
    "emEngenhariaDeCompensacao": 6,
    "aprovadasNestaRodada": 0
  },
  "destrutivasAprovadas": [
    {
      "nome": "admin_git_pull",
      "grupo": "admin-git",
      "arquivo": "src/modes/admin/tools/admin-git.js",
      "anunciadaEmToolsJson": false,
      "confirmacaoExigida": "CONFIRMO ADMIN",
      "escopoExigido": "admin",
      "viaDispatcher": "mcp_admin_call",
      "aprovadoEm": "2026-07-21",
      "origemDaAprovacao": "baseline canonico revisado em 2026-07-21"
    },
    {
      "nome": "admin_pm2_restart",
      "grupo": "admin-pm2",
      "arquivo": "src/modes/admin/tools/admin-pm2.js",
      "anunciadaEmToolsJson": false,
      "confirmacaoExigida": "CONFIRMO ADMIN",
      "escopoExigido": "admin",
      "viaDispatcher": "mcp_admin_call",
      "aprovadoEm": "2026-07-21",
      "origemDaAprovacao": "baseline canonico revisado em 2026-07-21"
    },
    {
      "nome": "admin_shell_exec",
      "grupo": "admin-shell",
      "arquivo": "src/modes/admin/tools/admin-shell.js",
      "anunciadaEmToolsJson": false,
      "confirmacaoExigida": "CONFIRMO ADMIN",
      "escopoExigido": "admin",
      "viaDispatcher": "mcp_admin_call",
      "aprovadoEm": "2026-07-21",
      "origemDaAprovacao": "baseline canonico revisado em 2026-07-21"
    },
    {
      "nome": "admin_vault_write",
      "grupo": "admin-vault-rw",
      "arquivo": "src/modes/admin/tools/admin-vault-rw.js",
      "anunciadaEmToolsJson": false,
      "confirmacaoExigida": "CONFIRMO ADMIN",
      "escopoExigido": "admin",
      "viaDispatcher": "mcp_admin_call",
      "aprovadoEm": "2026-07-21",
      "origemDaAprovacao": "baseline canonico revisado em 2026-07-21"
    },
    {
      "nome": "atualizar_consciencia",
      "grupo": "consciencia",
      "arquivo": "src/tools/consciencia/consciencia.js",
      "anunciadaEmToolsJson": true,
      "confirmacaoExigida": "CONFIRMO ADMIN",
      "escopoExigido": "admin",
      "viaDispatcher": "mcp_admin_call",
      "aprovadoEm": "2026-07-21",
      "origemDaAprovacao": "baseline canonico revisado em 2026-07-21"
    },
    {
      "nome": "execute_command",
      "grupo": "vps-lazy",
      "arquivo": "src/tools/vps/vps-lazy.js",
      "anunciadaEmToolsJson": true,
      "confirmacaoExigida": "CONFIRMO ADMIN",
      "escopoExigido": "admin",
      "viaDispatcher": "mcp_admin_call",
   
```
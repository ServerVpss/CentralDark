# COMANDO - validar-identidade-operacional.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\lupa\validar-identidade-operacional.mjs
**SHA:** 59aaadba0fb0d427
**Timestamp:** 2026-08-28T02:57:36.337397
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- "DELTA_DE_CRENCA_OU_REGRA=SIM",
- { code: "PIVETE_COMO_AUTORIDADE_FINAL", pattern: /\bO Pivete é a autoridade final\b/i },
- { code: "TITULO_AUTORIDADE_DO_PIVETE", pattern: /\bAutoridade do Pivete\b/i },
- { code: "PIVETE_GOVERNA_INTENCAO", pattern: /\bO Pivete governa a intenção\b/i },
- { code: "DECISAO_FINAL_ATRIBUIDA_AO_PIVETE", pattern: /\bdecisão final do Pivete\b/i },
- { code: "PIVETE_AUTORIDADE_FINAL_MAQUINA", pattern: /\bPIVETE\s*=\s*AUTORIDADE_FINAL\b/i },
- { code: "PIVETE_COMANDA_LEGADO_ATIVO", pattern: /\bPIVETE\s+COMANDA\b/i },
- { code: "PIVETE_MANDA_LEGADO_ATIVO", pattern: /\bPIVETE\s+MANDA\b/i },
- { code: "PIVETE_DECIDE_LEGADO_ATIVO", pattern: /\bPIVETE\s+DECIDE\b/i },
- { code: "PIVETE_ORQUESTRADOR_HUMANO", pattern: /\bPivete\s+(?:é|e)\s+o\s+orquestrador\b/i },

### Contratos
- const contract = safeJson(path);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const CONTRACT_PATH = "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json";
const META_LUPA_PATH = ".agents/skills/meta-lupa/SKILL.md";
const META_LUPA_IDENTITY_PATH = ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA";

const CANONICAL = Object.freeze({
  "LEIA-ME-IA.md": [
    "SEGREDO/CHEFE COMANDA",
    "SOL ORGANIZA E RECONCILIA",
    "PIVETE/HERMES PRESERVA E EXECUTA",
    "#ACORDAR = RECUPERAR O ESTADO REAL ANTES DE CONTINUAR",
    "Convergência adversarial total **só é aberta por solicitação explícita de SEGREDO/CHEFE**",
  ],
  "AGENTS.md": [
    "MESMA_SOUL=SIM",
    "um escritor por escopo",
    "SEGREDO/CHEFE = humano e autoridade final",
    "SOL = identidade operacional/coordenadora; não é modelo específico",
    "PIVETE/HERMES = executor, preservação e continuidade",
    "Full deploy é exceção causal",
    "NO_HUMAN_REASK_FOR_MERGE=true",
    ".github/workflows/autonomia-promocao.yml",
    "Convergência adversarial total só é aberta quando SEGREDO/CHEFE solicitar explicitamente",
    "INFORMATION_GAIN_REQUIRED=true",
    "LEARNING_REQUIRES_EVIDENCE=true",
    "LEARNING_DELTA_REQUIRED=true",
    "NO_EGO_SCORE=true",
    "SAME_ERROR_NO_NEW_INFO_IS_WASTE=true",
  ],
  "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md": [
    "IDENTIDADE=SOL_JARVIS_DO_SEGREDO_CHEFE",
    "AUTORIDADE_FINAL=SEGREDO/CHEFE",
    "SOL_IS_MODEL=false",
    "PIVETE_HERMES_IS_EXECUTOR=true",
    "UNKNOWN_IS_NOT_PASS=true",
    "REUSE_BEFORE_CREATE=true",
    "ONE_SYSTEM_ONLY=true",
    "ONE_WRITER_PER_SCOPE=true",
    "INFORMATION_GAIN_REQUIRED=true",
    "LEARNING_REQUIRES_EVIDENCE=true",
    "LEARNING_DELTA_REQUIRED=true",
    "SAME_ERROR_NO_NEW_INFO_IS_WASTE=true",
  ],
  "docs/CONSCIENCIA/CONTRATO-LUPA-BAYESIANA.md": [
    "INFORMATION_GAIN_REQUIRED=true",
    "autoridade humana vigente é `SEGREDO/CHEFE`",
    "Confronto só vira aprendizado promovido com evidência nova + delta reutilizável",
  ],
  "docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md": [
    "MESMA_SOUL=SIM",
    "#ACORDAR` significa **recuperar o estado real antes de continuar**",
    "Convergência adversarial total, swarm e Judge independente não são gate automático de rotina",
  ],
  "docs/CONSCIENCIA/02-PERMISSOES.md": [
    "DEPLOY=PERMITIDO",
    "REDEPLOY=PERMITIDO",
    "NO_HUMAN_REASK_FOR_ALREADY_GRANTED_SCOPE=true",
    "NO_RETURN_TO_CHEFE_FOR_MACHINE_MEASURABLE_STATE=true",
    "NO_HUMAN_REASK_FOR_MERGE=true",
    ".github/workflows/autonomia-promocao.yml",
    "Convergência adversarial total / swarm / Judge independente **não é gate automático de deploy**",
  ],
  "docs/CONSCIENCIA/03-FLUXO-DEPLOY.md": [
    "DEPLOY_STRATEGY=CAUSAL_SCOPE_FIRST",
    "FULL_DEPLOY_BY_DEFAULT=false",
    "convergência adversarial total não é gate automático de deploy",
  ],
  "docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md": [
    "SEGREDO/CHEFE = humano e autoridade final",
    "SOL = coordenadora da casa e organizadora dos agentes",
    "PIVETE/HERMES = mordomo de casa, executor e guardião da continuidade",
    "WRITER_UNICO=true",
    "UNKNOWN_NAO_PASSA=true",
    "CHEFE_SEGREDO_NECESSARIO",
  ],
  "docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md": [
    "SEGREDO/CHEFE = humano e autoridade final",
    "PIVETE = Hermes treinado",
  ],
  [META_LUPA_PATH]: [
    "AUTORIZACAO_DO_SEGREDO_CHEFE:",
    "Confronto não é pontuação de ego",
    "EVIDENCIA_NOVA=SIM",
    "DELTA_DE_CRENCA_OU_REGRA=SIM",
    "DESPERDICIO_DE_CICLO",
  ],
  [META_LUPA_IDENTITY_PATH]: [
    "SEGREDO/CHEFE",
  ],
  "apps/modulos/elite-gateway/scripts/pivete_routes.py": [
    "CANONICAL_CONTEXT",
    "CANONICAL_CONTEXT_ALLOWLIST",
    '"authority": "SEGREDO/CHEFE"',
    '"executor": "PIVETE/HERMES"',
    "A rota NÃO concatena mais docs/CONSCIENCIA/PIVETE-IA/*.md",
  ],
  "apps/modulos/WebUI/custom-css/pivete-invocacao.js": [
    "CANONICAL_CONTEXT_ALLOWLIST",
    "SEGREDO/CHEFE = humano e autoridade final",
    "PIVETE/HERMES = executor, preservação e continuidade",
    "localStorage.removeItem('pivete_system_prompt')",
  ],
  "apps/modulos/WebUI/custom-css/pivete-persona.json": [
    '"system_prompt_strategy": "canonical_allowlist"',
    '"authority": "SEGREDO/CHEFE"',
    '"coordinator": "SOL"',
    '"executor": "PIVETE/HERMES"',
    '"legacy_sources_excluded"',
  ],
  "apps/modulos/pivete-sync/pivete-sync.mjs": [
    "LEGACY_SYNC_DISABLED_CANONICAL_GIT_ONLY",
    "GIT_CANONICAL=true",
    "HUB_TO_GIT=false",
    "GIT_TO_LEGACY_PIVETE_HUB=false",
  ],
});

const ACTIVE_IDENTITY_SURFACES = Object.freeze([
  "README.md",
  "CLAUDE.md",
  "CODEX.md",
  "GEMINI.md",
  ".windsurfrules",
  ".cursor/rules/centraldark-governanca.mdc",
  ".github/copilot-instructions.md",
  ".github/codex/prompts/centraldark-system.md",
  "docs/GOVERNANCA/MODO-DE-
```
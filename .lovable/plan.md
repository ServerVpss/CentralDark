
# Enxame de 4 Agentes — Resgate do `graphifyy` na VPS

## Diagnóstico rápido do que aconteceu

O `pip3` instalou o `graphifyy` em `/root/.local/lib/python3.10/site-packages` (Python 3.10), mas o `python3` do sistema (`/usr/bin/python3`) está resolvendo para outra versão (provavelmente 3.11/3.12) e não enxerga esse diretório. Resultado: `ModuleNotFoundError` mesmo com o pacote instalado. O `PATH` também não pega `/root/.local/bin/graphifyy`.

Causa raiz provável: **mismatch entre a versão do Python que o `pip3` usou (3.10) e a que o `python3` invoca (outra)** — clássico após upgrade de sistema ou múltiplas versões instaladas.

---

## Os 4 Agentes (com técnicas especializadas)

### 🧠 Agente 1 — **Cognitivo / Diagnóstico Semântico**
**Técnica:** análise de estado + leitura de consciência + cruzamento com aprendizados prévios.
**Missão:** ler `docs/CONSCIENCIA/APRENDIZADOS.md`, `PENDENCIAS.md` e verificar se já rolou episódio parecido de conflito Python. Retornar contexto histórico + hipótese refinada.
**Ferramentas:** `ler_consciencia`, `puxar_aprendizados`, `analise_de_estado_cognitivo`, `search_files`.

### 🔍 Agente 2 — **Deliberado / Forense de Ambiente**
**Técnica:** inspeção read-only profunda do estado real da VPS.
**Missão:** mapear todas as versões de Python instaladas, para onde `python3`/`pip3`/`python3.10` apontam, `sys.path` de cada uma, onde `graphifyy` realmente está, se existe venv órfão, e o que tem em `/root/.local/bin/`.
**Ferramentas:** `execute_command` (which/ls/readlink/python -c sys.path), `vps_list_dir_safe`, `vps_read_file_safe`.

### 🏛️ Agente 3 — **Governança / Auditoria de Impacto**
**Técnica:** avaliar risco e conformidade com as áreas protegidas do `CLAUDE.md`.
**Missão:** confirmar que `/root/CentralDark` não teve arquivo crítico tocado pelo pip, checar se algum PM2 quebrou por causa da instalação de `numpy 2.2.6` (que pode conflitar com outros scripts), e validar se a correção proposta viola alguma área protegida.
**Ferramentas:** `vps_git_status`, `execute_command` (pm2 list, pm2 logs sem segredo), `ler_regras_inviolaveis`.

### 🧬 Agente 4 — **Semântico / Executor da Correção**
**Técnica:** propor e executar (via `vps_run_once_script` em dry-run primeiro) a correção mínima e reversível.
**Missão:** com base no laudo dos outros 3, escolher entre:
  - (a) invocar `graphifyy` com o Python 3.10 correto (`/usr/bin/python3.10 -m graphifyy ...`);
  - (b) criar venv isolado em `/root/CentralDark/.venv-graphifyy` e reinstalar lá dentro (mais limpo, recomendado);
  - (c) ajustar PATH pra pegar `/root/.local/bin/`.
Gera script run-once dry-run, mostra pro Pivete, só executa com `CONFIRMO RUN ONCE`.
**Ferramentas:** `vps_run_once_script`, `execute_command`.

---

## Orquestração

1. Agentes **1, 2 e 3 rodam em paralelo** (independentes, read-only).
2. Agente **4 só entra depois** — consome laudo consolidado dos 3.
3. Ao final: relatório único em placar visual (Fase / ▓░ / ✅⚠️❌ / Leigo+Técnico) + proposta de fix + confirmação pra executar.
4. Registro do aprendizado em `APRENDIZADOS.md` no fechamento.

## Entregável final pro Pivete

- **O que aconteceu** (1 frase leigo).
- **Placar visual** do estado da VPS.
- **Fix recomendado** (venv isolado, provavelmente).
- **Botão de confirmação:** "manda `CONFIRMO RUN ONCE` que eu aplico".

Nenhum arquivo é tocado sem tua autorização.

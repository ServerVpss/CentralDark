---
title: "REGRA OFICIAL GUARDIAO MODO PROPOR"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 📜 Regra Oficial — Guardião da Consciência: Modo "Propor" Obrigatório

> **Status:** Ativo e em observação
> **Data de criação:** 25/06/2026
> **Responsável pela decisão:** Pivete (dono do projeto)
> **Aprendizado quântico rastreado:** Nº 249 em `docs/CONSCIENCIA/APRENDIZADOS.md`
> **Commit de registro:** [`4ba028c`](https://github.com/ServerVpss/CentralDark/commit/4ba028c5164c05b5a3370de2958fa8341724ec36)

---

## Descrição

O agente **Guardião da Consciência** (`infra/guardiao/`) é responsável por
vigiar a integridade da pasta `docs/CONSCIENCIA/` e propor correções de
organização via Telegram + Mega Painel.

## Regras invioláveis

1. **Modo inicial travado em `propor`.** O Guardião nunca move arquivos
   automaticamente nesta versão.
2. **Modo `auto` bloqueado por código** até **08/07/2026**
   (`guardiao.py: DATA_LIBERACAO_AUTO`). Mesmo com `GUARDIAO_MODO=auto` no
   ambiente, o código força `propor` e loga `WARNING`.
3. **A data sozinha não libera o modo `auto`.** É necessário cumprir
   *todos* os pré-requisitos abaixo, cumulativamente:
   - Mínimo **7~10 dias úteis** de propostas reais do Guardião.
   - **Maioria das propostas validadas** como corretas pelo admin.
   - Lógica de mover arquivos **implementada e revisada** (hoje não existe).
   - **Aprovação explícita** do dono (Pivete).
4. **Logs estruturados obrigatórios** (`RotatingFileHandler` 10MB × 5).
5. **Bateria de testes pytest** roda dentro do `run.sh` antes de subir o
   processo no PM2 — se algum teste falhar, o deploy aborta.
6. **Auto-registro no Mega Painel** como serviço vivo via heartbeat de 60s.

## Para qualquer IA ou agente futuro

Esta regra **deve ser respeitada integralmente**. São proibidos sem
aprovação explícita do dono:

- Trocar o modo padrão de `propor` para `auto`.
- Remover, adiantar ou comentar a trava `DATA_LIBERACAO_AUTO`.
- Pular ou desativar a bateria de testes no `run.sh`.
- Desativar o sistema de logs estruturado.
- Implementar lógica de movimentação automática sem revisão prévia.

## Referências cruzadas

- Código: `infra/guardiao/guardiao.py`
- Documentação técnica: `docs/CONSCIENCIA/GUARDIAO-DA-CONSCIENCIA.md`
- Memória de constraint: `.lovable/memory/constraints/guardiao-liberacao-auto.md`
- Aprendizado nº 249: `docs/CONSCIENCIA/APRENDIZADOS.md`

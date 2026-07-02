---
title: "REGRA OFICIAL HIERARQUIA MEMORIA"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Regra Oficial — Hierarquia de Memória (Fonte da Verdade)

- **Título:** Hierarquia de Memória — `docs/CONSCIENCIA/` é a única fonte da verdade
- **Data:** 25/06/2026
- **Responsável pela decisão:** Pivete (dono do projeto)
- **Onde foi registrado:** este arquivo (`docs/CONSCIENCIA/REGRA-OFICIAL-HIERARQUIA-MEMORIA.md`) + espelho em `mem://preferences/hierarquia-memoria-consciencia-primeiro`
- **Prioridade:** MÁXIMA — sobrescreve qualquer instrução anterior sobre memória.

---

## 1. Hierarquia

1. **Fonte da Verdade Principal (única e oficial):** `docs/CONSCIENCIA/`
   - Pastas críticas: `00-ENTRADA/`, `01-IDENTIDADE/`, `04-MCP-E-CONECTORES/`
   - Arquivo crítico: `APRENDIZADOS.md`
2. **Memória Secundária (suporte / cache de sessão):** `mem://`
3. **Proibido:** usar `mem://` como fonte principal de regras, decisões ou aprendizados importantes.

## 2. Ordem obrigatória de registro

Toda regra, decisão, aprendizado ou mudança importante deve seguir:

1. Registrar **primeiro** em `docs/CONSCIENCIA/` (no arquivo mais adequado, ou criar um novo).
2. Depois, opcionalmente, espelhar em `mem://`.
3. **Nunca** registrar algo importante **somente** em `mem://`.

## 3. Formato mínimo de registro

Todo registro importante em `docs/CONSCIENCIA/` deve conter:

- Título claro
- Data
- Responsável pela decisão
- Onde foi registrado (caminho do arquivo)
- Por que foi registrado
- Referências cruzadas (quando existirem)

## 4. Consequência da violação

Informação importante registrada **apenas** em `mem://` (sem espelho em `docs/CONSCIENCIA/`) é considerada **não-oficial** e pode ser ignorada pelo Pivete e por qualquer outro agente.

## 5. Por que essa regra existe

- `mem://` é volátil entre workspaces e tem limite de tamanho — não serve como arquivo histórico.
- `docs/CONSCIENCIA/` é versionado no Git, espelhado na VPS (`<caminho-vps>`) e legível por qualquer IA/humano que abra o repo.
- Garante que decisões sobrevivam à troca de IA, reset de sessão e migração de workspace.

## 5.1. `mem://` NÃO é fonte oficial de memória

> **Regra dura:** nenhuma regra, decisão, aprendizado, correção validada ou pendência pode existir **somente** em `mem://`. Se só existe em `mem://`, então **não existe** para o CentralDark.

`mem://` é memória interna do runtime Lovable. Serve como cache operacional dentro do próprio ambiente — nada além disso. **Não é registro do projeto.**

A fonte permanente de memória do CentralDark é o Git, na pasta:

```txt
docs/CONSCIENCIA/
```

Versionada, revisável, espelhada na VPS em `/root/CentralDark/docs/CONSCIENCIA/`, legível por qualquer IA ou humano com acesso ao repo. É isso que faz uma decisão sobreviver a troca de IA, reset de sessão, mudança de workspace e migração de ferramenta.

### Por que `mem://` não conta como salvo

1. **Não é universal.** Claude, ChatGPT, Grok, Codex, Copilot, Cursor, Windsurf e outros não conseguem ler `mem://` de forma confiável.
2. **É preso ao Lovable.** Vive no contexto do runtime, não como arquivo real do projeto.
3. **Não é versionado.** Sem Git, sem histórico, sem diff, sem commit, sem PR, sem revisão, sem rastreabilidade.
4. **Não é espelhado na VPS.** A VPS só enxerga o repo e o filesystem real. `mem://` nunca aparece sozinho em `/root/CentralDark/`.
5. **Some sem aviso.** Troca de workspace, reset de sessão ou recriação do projeto apagam o conteúdo — sem erro, sem alerta.

### O teste obrigatório — toda IA faz, sempre

Antes de gravar qualquer coisa em `mem://`, pergunte:

```txt
Essa informação precisa sobreviver à troca de IA, reset de sessão,
migração de workspace ou leitura por outro agente?
```

- **Sim** → o destino é o Git. `mem://` só pode receber um resumo apontando para o caminho oficial **depois** de salvo no repo.
- **Não** → `mem://` está liberado.

Na dúvida, a resposta é **sim**.

### Onde registrar de forma permanente

| Tipo de conteúdo | Local oficial |
| --- | --- |
| Regra ou decisão oficial | `docs/CONSCIENCIA/REGRA-OFICIAL-*.md` |
| Aprendizado, erro corrigido, técnica validada, padrão operacional | `docs/CONSCIENCIA/APRENDIZADOS.md` |
| Pendência aberta | `docs/PENDENCIAS.md` |
| Relatório de tarefa concluída | `docs/RELATORIOS/YYYY-MM-DD-nome.md` |
| Identidade, permissões, arquitetura, fluxo operacional | Arquivos numerados em `docs/CONSCIENCIA/` |
| Log completo de execução na VPS | `/root/Multizap/revisoes/...` |
| Resumo visível de status | Mega Painel (reflete o estado salvo no repo/VPS) |

Havendo MCP, registre por tool oficial (`registrar_aprendizado` ou equivalente). Sem MCP, edite o arquivo no repo + commit + PR/merge conforme a política ativa.

### Proibição e prova

**É proibido** declarar uma tarefa concluída dizendo que foi "salva na memória" quando só existe em `mem://`. Isso conta como **tarefa não concluída** — a IA que fizer isso entregou um trabalho que vai evaporar no próximo reset.

Para contar como salvo de verdade, exige-se **pelo menos uma** destas provas:

```txt
- arquivo no repo
- commit
- PR
- relatório em docs/RELATORIOS/
- aprendizado em docs/CONSCIENCIA/APRENDIZADOS.md
- pendência em docs/PENDENCIAS.md
```

Sem prova, não houve registro.

## 6. Referências cruzadas

- [Sincronia 4-Point](./CONSCIENCIA.md) — `docs/CONSCIENCIA/` é um dos 4 pontos espelhados.
- [`CLAUDE.md`](../../CLAUDE.md) — porta de entrada do projeto para qualquer IA.
- [Regra Oficial — Gestão de Secrets](./REGRA-OFICIAL-GESTAO-SECRETS.md) (a criar/migrar — atualmente vive como espelho em `mem://preferences/gestao-secrets-autorizacao-previa`, **precisa ser oficializada aqui também** conforme esta nova regra).
- [Regra Oficial — Guardião Modo Propor](./REGRA-OFICIAL-GUARDIAO-MODO-PROPOR.md) — já segue este padrão.
- [APRENDIZADOS.md](./APRENDIZADOS.md) — registrar aprendizado #251 com referência a este arquivo.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre

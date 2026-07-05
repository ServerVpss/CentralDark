---
title: "AULA 011 Auto Aprendizagem E Memoria"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# AULA-011 — Auto-aprendizagem: memória, consciência, graph e sugestões

**Data:** 2026-07-03
**Categoria:** procedimento (meta — como o Hermes pensa)
**Pré-requisitos:** AULA-009
**Tempo estimado:** 8 min

> Esta é a aula mais importante. Não trata de UMA tarefa — trata de **como o Hermes decide antes de qualquer tarefa**. Ler → agir → aprender → sugerir melhoria pra si mesmo. Sem colisão com o Fabler.

## 1. O que é
Loop obrigatório do Hermes:

```
┌─────────────────────────────────────────────────────────┐
│  1. LER (memória + consciência + graph)                 │
│  2. VERIFICAR colisão (Fabler tá mexendo aqui?)         │
│  3. AGIR (executar bloco)                               │
│  4. REGISTRAR (aprendizado + rastro + XP)               │
│  5. SUGERIR melhoria pra si (SUGESTOES/NNN.md)          │
└─────────────────────────────────────────────────────────┘
```

## 2. Quando usar
**SEMPRE.** Antes de qualquer ação. Sem exceção.

## 3. Passo 1 — LER antes de agir (economia de token via graph)

### 3.1 Ordem de consulta (do mais barato pro mais caro)
1. **Graph-panel** (`apps/modulos/graph-panel/`) — índice por grafo, gasta ~10x menos token que ler arquivos crus.
2. **Memória curta** — `docs/CONSCIENCIA/LEMBRANCAS/` (últimos 30 dias, tags).
3. **Consciência mestre** — `docs/CONSCIENCIA/CONSCIENCIA.md` (regras invioláveis).
4. **APRENDIZADOS acumulados** — `docs/CONSCIENCIA/APRENDIZADOS.md`.
5. **Aulas específicas do Hermes** — `HERMES/AULAS/` + `HERMES/ROTAS-FIXAS/`.
6. **Arquivos crus** (último recurso — caro).

### 3.2 Regra de ouro
> Se dá pra responder pelo graph, NÃO abre arquivo cru. Se dá pra responder pela memória, NÃO relê consciência inteira. Escala só quando precisa.

### 3.3 Comandos
```bash
# Graph (barato)
curl -s http://localhost:PORT_GRAPH/search?q="restart+webui"

# Memória
ler docs/CONSCIENCIA/LEMBRANCAS/*.md por tag

# Consciência (só se memória não bastou)
ler docs/CONSCIENCIA/CONSCIENCIA.md
```

## 4. Passo 2 — VERIFICAR colisão com Fabler

Antes de tocar em qualquer área, checar se Fabler tá lá:

```bash
# 1. Ver últimos posts do canal Status (últimas 10 msgs)
# 2. Ver arquivos modificados nas últimas horas na VPS:
find /root/CentralDark -mmin -30 -type f 2>/dev/null
# 3. Ver PM2 restarts recentes
pm2 status | grep -i restart
```

**Regras:**
- Fabler mexe na VPS (SSH direto, docker, PM2, secrets crus).
- Hermes mexe em: repo Lovable, `docs/CONSCIENCIA/`, notificações Telegram via connector, análise/planejamento.
- **Zona neutra:** `HERMES/*` — só Hermes escreve. Fabler pode ler.
- Se detectar Fabler ativo em zona compartilhada → deixar recado em `HERMES/SUGESTOES/aviso-fabler-NNN.md` e mudar de tarefa.

## 5. Passo 3 — AGIR
Executar seguindo a rota-fixa apropriada. Se não tem rota-fixa pra essa ação → **PARAR** e criar a rota primeiro (senão vira improviso e some o aprendizado).

## 6. Passo 4 — REGISTRAR (rastro cognitivo)

Todo bloco fechado gera 3 coisas mínimas:
1. **Aprendizado novo** em `HERMES/APRENDIZADOS/NNN-slug.md` (formato TEMPLATE-APRENDIZADO).
2. **Rastro** — cada aprendizado cita: qual aula gerou, qual aprendizado anterior liga, qual rota-fixa usa. Assim um puxa o outro.
3. **XP + skill bump** em `HERMES/STATUS.md` (AULA-009).

### Exemplo de rastro
```
APR-010 (novo)
  └─ nasceu de: AULA-011
  └─ liga em: APR-008, APR-009 (padrão <pre>)
  └─ usa rota: ROTAS-FIXAS/notificacao-telegram.md
  └─ subiu skill: Rastro/apr. +5
```

## 7. Passo 5 — SUGERIR melhoria pra si mesmo

Toda ação termina com pergunta obrigatória:
> **"O que eu faria diferente na próxima?"**

Se tem resposta → gravar em `HERMES/SUGESTOES/NNN-slug.md`:

```md
# SUG-NNN — <título>
**Data:** YYYY-MM-DD
**Nasceu em:** BLOCO/AULA X
**Categoria:** [otimização | novo-processo | ferramenta | atalho]

## Observação
O que percebi.

## Proposta
O que mudar.

## Custo/benefício
Rápido? Vale a pena? Quebra algo?

## Próximo passo (se aprovado pelo admin)
Ação concreta.
```

Admin lê `SUGESTOES/` periodicamente. Aprovadas viram AULAs novas.

## 8. Armadilhas
- ❌ Pular passo 1 (LER) e sair executando → repetir erro já registrado.
- ❌ Ignorar graph e abrir 20 arquivos → queima token à toa.
- ❌ Fazer ação sem rota-fixa → improviso, some aprendizado.
- ❌ Fechar bloco sem SUGESTÃO → perde ciclo de auto-evolução.
- ❌ Escrever em zona do Fabler sem checar → conflito, retrabalho.

## 9. Verificação (checklist do loop)
- [ ] Consultei graph antes de abrir arquivo?
- [ ] Li memória curta + APRENDIZADOS relevantes?
- [ ] Checei se Fabler tá na mesma zona?
- [ ] Executei via rota-fixa (ou criei uma nova)?
- [ ] Registrei aprendizado com rastro?
- [ ] Atualizei XP + skill?
- [ ] Deixei sugestão de melhoria?

Se algum não → volta o loop.

## 10. Ver também
- `apps/modulos/graph-panel/MANUAL.md`
- `docs/CONSCIENCIA/CONSCIENCIA.md`
- `docs/CONSCIENCIA/APRENDIZADOS.md`
- `HERMES/STATUS.md`
- AULA-009 (nível+skills)
- AULA-010 (padrão `<pre>`)

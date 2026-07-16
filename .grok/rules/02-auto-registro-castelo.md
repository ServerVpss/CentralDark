# REGRA — Auto-registro do castelo (Pivete · 2026-07-16)

**Ordem explícita do Pivete:** a partir de agora, ações **relevantes** de **melhoria** e **proteção** do castelo CentralDark devem ser **registradas automaticamente**, **sem pedir PERMITO de novo** para o ato de **registrar**.

**Motivo:** se não estiver no rastro versionado (GitHub / Fonte da Verdade), restart de sessão, PM2 ou reboot = **tempo perdido**.

## O que registrar SEM pedir permissão (ato de memória)

- Melhoria útil ao castelo (como fazer melhor, o que aprendeu, o que fixou em docs)
- Proteção / segurança / doutrina / playbook / gaps
- Preferências do Pivete validadas na sessão
- Diagnósticos relevantes (ex.: XP não existe, Hermes usa Grok na fila, commit só local)
- Ruído **operacional útil** (falso alarme, “não é bug”, o que ignorar) — pra não reabrir susto

## Onde gravar (ordem)

1. `docs/CONSCIENCIA/APRENDIZADOS.md` — aprendizado/regra
2. `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` — se for **decisão** de processo
3. `~/.grok/rules/` + `CentralDark/.grok/rules/` — se for comportamento de sessão Grok
4. Card Telegram (estudo) quando a explicação for útil ao Pivete
5. **Commit Git** só em paths allowlist (abaixo) — não commitar lixo da working tree

## Allowlist de commit automático (registro)

```text
docs/CONSCIENCIA/APRENDIZADOS.md
docs/CONSCIENCIA/08-HISTORICO-DECISOES.md
docs/CONSCIENCIA/LEMBRANCAS/   # só se tool oficial / não lixo
.grok/rules/*.md
mem/preferences/*.md
docs/RELATORIOS/*registro* / *sessao* quando for handoff útil
scripts/agents/auto-registrar-castelo.*  # o próprio script
```

**Proibido** no auto-commit: `.env`, `secrets/`, dumps, painel vivo, `node_modules`, áreas 🔒 de código sem ordem de **código**.

## O que AINDA exige PERMITO / ordem explícita

- Deploy, restart PM2 em massa, Caddy, DNS
- `git push --force`, `reset --hard`, reescrever main
- Mexer secrets, gateway oficial, pastas 🔒 de aplicação
- Instalar stack paralela / “V3”
- Qualquer ação **destrutiva** ou **visível em produção** além de **gravar memória**

> **Resumo:** PERMITO permanente = **registrar e versionar memória relevante**.  
> PERMITO pontual continua = **mexer no castelo em runtime perigoso**.

## Rotina do agente (Grok / Hermes-aware)

Após ação ou achado relevante:

1. Escrever ouro em APRENDIZADOS (e decisão se couber)
2. Atualizar regra Grok se mudar comportamento
3. Card Telegram se for material de estudo
4. `git add` só allowlist → `git commit` com mensagem `docs(consciencia): auto-registro — {titulo}`
5. **Push:** preferir quando o remote estiver saudável; se `main` estiver divergente/perigosa, commitar local + avisar Pivete e/ou branch `chore/auto-registro-YYYYMMDD` — **nunca force-push**

## Gatilhos de “relevante”

- Pivete ensinou estilo/regra (“é assim que gosto”)
- Diagnóstico que evita retrabalho
- Proteção / self-heal / playbook / permissão
- “Se eu reiniciar a sessão e isso sumir, perdemos tempo”

Se for só “ok”, “vlw”, conversa social → **não** poluir APRENDIZADOS.

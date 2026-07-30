# CODEX.md — Contrato operacional CentralDark

## Alvo obrigatório

Toda atuação do Codex deve apontar para o repositório oficial `ServerVpss/CentralDark` e para uma branch explicitamente informada.

Antes de qualquer atuação, o Codex deve carregar:

1. `LEIA-ME-IA.md`;
2. `AGENTS.md`;
3. `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`;
4. `.agents/skills/meta-lupa/SKILL.md` quando a tarefa for crítica;
5. `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA` para provar a identidade vigente da skill.

O Codex é um especialista substituível dentro do método universal. Ele pode atuar como executor, debugger, revisor ou judge, mas não assume autoridade do Pivete nem cria memória paralela.

## Ordem de execução

```txt
1. Carregar boot universal e emitir CENTRALDARK_AI_BOOT uma vez.
2. Ler contexto e governança.
3. Confirmar branch, HEAD, escritor atual e arquivos permitidos.
4. Mapear risco e dependências.
5. Executar mudança mínima quando for o escritor autorizado.
6. Rodar testes aplicáveis.
7. Entregar apenas o delta, o handoff e a prova.
```

## Método delta

- Mensagem atrasada é contexto auxiliar, não ordem automática.
- Evidência atual vence relato antigo.
- Não reiniciar etapa concluída.
- Não repetir investigação já comprovada.
- Incorporar apenas fato, risco, correção, autorização, resultado ou bloqueador ainda relevante.
- Leitores podem trabalhar em paralelo; somente um agente escreve por escopo.
- Nenhum executor valida a si mesmo como revisão independente.

## Limites

- Não alterar `main` diretamente quando a missão exigir branch.
- Não tocar na VPS, PM2, Caddy, banco ou produção sem autorização explícita.
- Não editar arquivos privados de ambiente, sessões, credenciais ou cookies.
- Não expor arquivos sensíveis em logs, comentários, commits ou respostas.
- Não criar arquivos duplicados para evitar corrigir o arquivo oficial.
- Não assumir posse de escrita sem handoff explícito quando já existir outro escritor.
- Não copiar SHA canônico para adaptadores; resolver pelo arquivo de identidade e validar contra o Git.

## Arquivos sensíveis

Arquivos sensíveis incluem credenciais, configurações privadas, sessões, chaves, certificados e dados de autenticação. Use nomes de variáveis e placeholders; nunca os valores reais.

## Handoff obrigatório

```yaml
WRITER_HANDOFF:
  from: "Codex"
  role: "EXECUTOR|DEBUGGER|REVIEWER|JUDGE"
  status: "DONE|PARTIAL|BLOCKED"
  head_sha: "SHA completo"
  files_changed: []
  tests: []
  decisions: []
  risks: []
  next_gate: "próxima prova objetiva"
```

## Regra final

```txt
Pivete comanda.
SOL ou o coordenador ativo preserva o fio.
Codex atua como especialista dentro do escopo.
GitHub registra.
Ações provam.
```

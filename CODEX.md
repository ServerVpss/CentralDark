# CODEX.md — Contrato operacional CentralDark

## Alvo obrigatório

Repositório oficial: `ServerVpss/CentralDark`.

## Papel

O Codex é o agente técnico principal: executa mudanças autorizadas, revisa código e dá a palavra técnica final após confrontar os revisores.

## Ordem de execução

```txt
1. Ler contexto e governança.
2. Confirmar branch e arquivos permitidos.
3. Mapear risco e dependências.
4. Executar mudança mínima.
5. Rodar testes aplicáveis.
6. Confrontar pareceres dos revisores.
7. Publicar síntese, refino e veredito com evidência.
```

## Limites e arquivos sensíveis

- Não alterar `main` diretamente.
- Não tocar na VPS, PM2, Caddy, banco ou produção sem autorização explícita.
- Não ler ou editar `.env`, `secrets/`, `tokens/`, `sessions/`, `.ssh/`, chaves, certificados ou credenciais.
- Não expor valores sensíveis em logs, comentários, commits ou respostas.
- Não transformar ausência de prova em sucesso.
- Não simular revisores independentes reutilizando a mesma resposta ou rota real.

## Handoff obrigatório

```txt
from: Codex
role: executor ou revisor final
status: DONE | PARTIAL | BLOCKED
files_changed: lista exata
tests: testes executados
decisions: decisões tomadas
risks: riscos restantes
next: próximo passo sugerido
```

## Regra final

```txt
Pivete comanda.
Revisores criticam em paralelo.
Codex alinha, sintetiza e refina.
GitHub registra.
Actions provam.
```

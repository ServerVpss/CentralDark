# Receipt — Hermes continuidade + delegação

- Data: 2026-11-04
- Ponto fixo: `F:/CentralDark`
- Reconciliação CentralDark: `HEAD=9139b852c176d60bf021df2d5412218e98dd3bc2`; `origin/main` igual; divergência `0/0`.
- Estado do checkout CentralDark: DIRTY/UNKNOWN; alterações pré-existentes preservadas, sem reset/overwrite.

## Alterações efetivas

- `C:/Users/Administrador/AppData/Local/hermes/hermes-agent/gateway/slash_commands.py`
  - `/restart` agora persiste checkpoint JSON bounded: rota original, sessão, contexto da missão, pendência, `NEXT_CURSOR` literal ou `UNKNOWN`, timestamp, contador ativo e configuração observada de coordenador/delegação.
- `C:/Users/Administrador/AppData/Local/hermes/hermes-agent/gateway/run_notifications.py`
  - aviso de retorno usa: `🟢 Voltei! Missão recuperada... Estado... Pendências... Próxima ação...`;
  - o marcador é removido somente após entrega confirmada; falha permanece para retry e não gera falso sucesso.
- `C:/Users/Administrador/AppData/Local/hermes/hermes-agent/tests/gateway/test_restart_notification.py`
  - contraprova de falha atualizada para exigir persistência do marcador.
- `C:/Users/Administrador/AppData/Local/hermes/config.yaml`
  - coordenador: `openai-codex/gpt-5.6-luna-900k`;
  - subdelegação preferencial: `nous/reflection/beam-1.0-501b-a23b:free`.

## Contraprovas

- Configuração Beam executada: `BEAM_OK model=reflection/beam-1.0-501b-a23b:free`; schema válido; 1 chamada; 5,5 s.
- Sintaxe Python: `compileall` passou.
- `git diff --check`: passou.
- Ambiente de testes recuperado com `uv sync --locked` e reinstalação de `httpx==0.28.1` no `.venv`.
- Testes pytest: PASS — `16 passed in 10.27s` em `test_restart_notification.py` e `test_multiplex_notice_egress_profile_adapter.py` via `uv run --with pytest --with pytest-asyncio`.
- Suíte ampla `tests/gateway`: NÃO PASSOU em coleta, com 3 bloqueios ambientais independentes: `fcntl` indisponível no Windows, mock `lark_oapi.__spec__` inválido e instalação `fastapi` incompleta (`fastapi.applications`).
- Testes focados após integração documental: PASS — `34 passed in 16.89s` (restart, multiplex notice, token exposure e Feishu), com 1 warning de depreciação do Starlette.
- Depois da comparação, os comentários de código deixam explícito que `.restart_notify.json` é complementar ao `.restart_pending.json` oficial; o diff atual do Hermes é `58 inserções / 12 remoções`, ainda sem commit.

- O repositório oficial `NousResearch/hermes-agent` (`origin/main=71736c9f32597bbca9d89cede5aa136e55946b2f`) já contém capacidade equivalente de continuidade/restart, mas não a mesma implementação local de checkpoint contextual com `NEXT_CURSOR`.
- Evidências oficiais: `gateway/restart_notice.py`, `_replay_pending_planned_restart_notification()`, recuperação em `run_startup.py`, e commits `86a61729d3` (marker no restart Windows), `1205a010f7` (um writer/ordenação), `21c35c6115` (restaurar rotas após restart) e `18e16bdd7d` (completions sobrevivem restart).
- Veredito da busca oficial: NÃO há prova de uma função idêntica à extensão local; há sobreposição material no mecanismo de marker, aviso pós-restart e recuperação de rotas. A extensão local deve ser tratada como complemento/deduplicação a revisar, não como capacidade inexistente no upstream.

## NEXT_CURSOR

- Persistência implementada no checkpoint como `metadata.NEXT_CURSOR`; quando ausente, grava literalmente `UNKNOWN` e nunca inventa cursor.
- Nesta execução não havia `NEXT_CURSOR` fornecido: valor observado `UNKNOWN`.

## Contraprovas ainda bloqueadas

- Não executar novo restart/shutdown/verificação: há instrução de sistema explícita de que o restart anterior já ocorreu e não deve ser repetido.
- Por isso, entrega real do aviso WhatsApp pós-restart, recuperação end-to-end e deduplicação não podem ser declaradas PASS nesta sessão.
- O aviso depende de adapter WhatsApp operacional; falhas de entrega deixam o marcador durável para retry.

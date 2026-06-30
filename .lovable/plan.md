# 🔍 Diagnóstico — `database is locked` no [ui.centralldark.com](http://ui.centralldark.com)

## Identificação do alvo

`ui.centralldark.com` = container Docker **Open-WebUI** (`ghcr.io/open-webui/open-webui:main`), definido em `apps/modulos/WebUI/docker-compose.yml`. O banco fica em `/app/backend/data/webui.db` (volume `open-webui`). O código FastAPI/SQLAlchemy/aiosqlite **não está neste repositório** — é upstream do Open-WebUI. Por isso o diagnóstico abaixo é baseado em (a) leitura do compose deste repo e (b) conhecimento do código upstream (`open-webui/backend/open_webui/internal/db.py` e `models/users.py`).

## Causa raiz (alta confiança)

O erro acontece exatamente no `UPDATE user SET last_active_at=? WHERE user.id=?`. Esse update dispara em **toda requisição autenticada** (middleware `update_last_active`). Combinação que produz o lock:

1. **SQLite default sem WAL.** O Open-WebUI sobe com `DATABASE_URL` apontando para `sqlite:///...webui.db` quando nenhum Postgres é configurado. O `docker-compose.yml` atual **não define `DATABASE_URL` nem `DATABASE_POOL_***` → cai no default SQLite, modo `journal_mode=DELETE`, que serializa escritas e bloqueia leitores concorrentes.
2. **Pool do SQLAlchemy maior que 1 com SQLite.** O upstream usa `QueuePool` quando `DATABASE_POOL_SIZE>0`. Sem WAL, múltiplas conexões disputam o mesmo arquivo e a primeira que segura a transação faz as outras estourarem o `busy_timeout` padrão (5 s) → `OperationalError: database is locked`.
3. `**busy_timeout` baixo + escrita em hot path.** Como `last_active_at` é gravado a cada request (chat streaming, websockets, polling de modelos), a janela de contenção é permanente sob qualquer carga real.
4. **Falta do PRAGMA `synchronous=NORMAL**` (recomendado junto com WAL) — sem isso, mesmo com WAL ativo cada commit faz fsync e amplia a janela de lock.

Não é bug de query — é configuração de engine SQLite inadequada para um app async com escrita por request.

## Evidência a coletar (read-only, sem alterar nada)

Comandos sugeridos para rodar na VPS (apenas leitura):

```text
docker exec CentralDark-WebUI env | grep -E 'DATABASE_URL|DATABASE_POOL|WEBUI'
docker exec CentralDark-WebUI sqlite3 /app/backend/data/webui.db "PRAGMA journal_mode; PRAGMA busy_timeout; PRAGMA synchronous;"
docker exec CentralDark-WebUI ls -la /app/backend/data/ | grep -E 'webui\.db(-wal|-shm)?'
docker logs --tail=200 CentralDark-WebUI | grep -i 'locked\|operational'
```

Esperado se a hipótese estiver correta:

- `DATABASE_URL` ausente (default `sqlite:///./data/webui.db`).
- `journal_mode = delete`, `busy_timeout = 5000`, `synchronous = 2`.
- Não existe `webui.db-wal` no diretório.

## Trecho de código exato a ajustar (upstream Open-WebUI)

Arquivo: `backend/open_webui/internal/db.py` (engine factory). Onde está hoje:

```python
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    **({"pool_size": DATABASE_POOL_SIZE, ...} if "sqlite" not in SQLALCHEMY_DATABASE_URL else {}),
)
```

Ajuste mínimo recomendado (a aplicar quando sair do modo somente-leitura):

```python
from sqlalchemy import event

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"timeout": 30, "check_same_thread": False}
        if "sqlite" in SQLALCHEMY_DATABASE_URL else {},
)

if "sqlite" in SQLALCHEMY_DATABASE_URL:
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, _):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA journal_mode=WAL;")
        cur.execute("PRAGMA synchronous=NORMAL;")
        cur.execute("PRAGMA busy_timeout=30000;")
        cur.execute("PRAGMA temp_store=MEMORY;")
        cur.close()
```

E em `models/users.py` (`update_user_last_active_by_id`): trocar o `UPDATE` síncrono no hot path por um **batch debounced** (ex.: gravar `last_active_at` no máximo a cada 30–60 s por usuário, em background task) — assim mesmo sob lock residual o usuário não vê 500.

## Correção recomendada sem tocar no upstream

Como este repo só controla o compose, a correção real cabe em duas linhas de env (a aplicar em modo build, **não agora**):

```yaml
- DATABASE_URL=sqlite:////app/backend/data/webui.db?timeout=30
# e o ideal, definitivo:
# - DATABASE_URL=postgresql+psycopg://webui:***@host.docker.internal:5432/webui
```

Migrar para Postgres elimina a classe inteira do problema; é o caminho recomendado para um Open-WebUI em produção atrás de domínio público.

## Conclusão

- **Gargalo:** SQLite em modo `DELETE` + `busy_timeout` curto, com escrita por request em `users.last_active_at`.
- **Trecho a ajustar:** engine factory em `backend/open_webui/internal/db.py` (PRAGMAs WAL/synchronous/busy_timeout) e o updater em `models/users.py` (debounce).
- **Mitigação 1-linha no nosso lado:** setar `DATABASE_URL=sqlite:///...?timeout=30` no compose; **definitivo:** migrar para Postgres.
- Nada foi alterado. Nenhum container reiniciado. Nenhuma migration rodada.

> Próximo passo sugerido: aprove sair do modo somente-leitura para eu coletar a evidência via `docker exec` listada acima e confirmar os PRAGMAs reais antes de propor o patch definitivo.
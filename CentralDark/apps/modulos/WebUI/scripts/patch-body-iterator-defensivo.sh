#!/usr/bin/env bash
# ============================================================================
# PATCH DEFENSIVO — Open WebUI: JSONResponse.body_iterator
# ============================================================================
# Objetivo: evitar o erro
#   "'JSONResponse' object has no attribute 'body_iterator'"
# que ocorre quando o provider/model devolve JSONResponse (erro) e o fluxo
# de streaming do Open WebUI tenta iterar como se fosse StreamingResponse.
#
# Estratégia:
#   1. Faz backup de /app/backend/open_webui/routers/chat.py
#      (e main.py e middleware.py caso o trecho esteja lá)
#   2. Envolve TODA leitura de `response.body_iterator` num guard:
#        - se a resposta NÃO for StreamingResponse -> devolve JSON de erro
#          claro pro frontend (status real + mensagem legível) ao invés
#          de crashar 500 genérico.
#   3. Reinicia só o processo do webui (sem tocar em Zendriver/Gateway).
#
# Uso na VPS:
#   bash /root/CentralDark/apps/modulos/WebUI/scripts/patch-body-iterator-defensivo.sh
#
# Rollback:
#   cp <arquivo>.bak.<timestamp> <arquivo> && docker restart open-webui
# ============================================================================

set -euo pipefail

CONTAINER="${CONTAINER:-open-webui}"
TS="$(date +%Y%m%d-%H%M%S)"

echo "🛡️  Patch defensivo body_iterator — container=$CONTAINER"
echo "⏱️  Timestamp backup: $TS"

# 1) localiza arquivos-alvo dentro do container
mapfile -t TARGETS < <(docker exec "$CONTAINER" sh -c \
  "grep -rl 'body_iterator' /app/backend/open_webui/ 2>/dev/null || true")

if [ ${#TARGETS[@]} -eq 0 ]; then
  echo "⚠️  Nenhum body_iterator encontrado — nada a fazer."
  exit 0
fi

echo "🎯 Arquivos com body_iterator:"
printf '   - %s\n' "${TARGETS[@]}"

# 2) copia patch python pro container
PATCH_PY="/tmp/patch_body_iterator_${TS}.py"
docker cp - "$CONTAINER:$PATCH_PY" <<'PYEOF'
"""
Patch defensivo: envolve `response.body_iterator` num guard isinstance.
Roda idempotente — se já foi aplicado, não duplica.
"""
import re, sys, io, os, time, shutil

MARK = "# [PATCH_BODY_ITERATOR_DEFENSIVO]"

GUARD_IMPORT = (
    "from starlette.responses import StreamingResponse, JSONResponse  "
    + MARK + "\n"
)

# Substitui `response.body_iterator` por acesso protegido.
# Antes:  async for chunk in response.body_iterator:
# Depois: (guard que devolve erro JSON claro se não for StreamingResponse)
PATTERN = re.compile(
    r"(?P<indent>[ \t]*)async for (?P<var>\w+) in (?P<resp>[\w\.\[\]]+)\.body_iterator:"
)

REPLACEMENT = (
    "\\g<indent>" + MARK + "\n"
    "\\g<indent>if not isinstance(\\g<resp>, StreamingResponse):\n"
    "\\g<indent>    # Provider devolveu JSONResponse (erro). Repassa limpo\n"
    "\\g<indent>    # ao frontend em vez de crashar com body_iterator.\n"
    "\\g<indent>    try:\n"
    "\\g<indent>        import json as _json\n"
    "\\g<indent>        _body = getattr(\\g<resp>, 'body', b'') or b''\n"
    "\\g<indent>        _payload = _json.loads(_body.decode('utf-8') or '{}')\n"
    "\\g<indent>    except Exception:\n"
    "\\g<indent>        _payload = {'error': 'upstream_non_streaming'}\n"
    "\\g<indent>    _status = getattr(\\g<resp>, 'status_code', 502)\n"
    "\\g<indent>    return JSONResponse(\n"
    "\\g<indent>        status_code=_status,\n"
    "\\g<indent>        content={\n"
    "\\g<indent>            'error': True,\n"
    "\\g<indent>            'code': _status,\n"
    "\\g<indent>            'message': (\n"
    "\\g<indent>                _payload.get('error', {}).get('message')\n"
    "\\g<indent>                if isinstance(_payload.get('error'), dict)\n"
    "\\g<indent>                else _payload.get('error') or _payload.get('message')\n"
    "\\g<indent>                or 'Provider retornou resposta nao-streaming (JSONResponse)'\n"
    "\\g<indent>            ),\n"
    "\\g<indent>            'upstream': _payload,\n"
    "\\g<indent>        },\n"
    "\\g<indent>    )\n"
    "\\g<indent>async for \\g<var> in \\g<resp>.body_iterator:"
)

def patch_file(path: str) -> bool:
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    if MARK in src:
        print(f"   ⏭️  já patchado: {path}")
        return False
    new = PATTERN.sub(REPLACEMENT, src)
    if new == src:
        print(f"   ⚠️  padrão não bateu em: {path}")
        return False
    # garante import
    if "from starlette.responses import" in new and "JSONResponse" not in new.split("\n",50)[0]:
        pass
    if MARK not in new.split("\n", 1)[0]:
        # insere import logo após o primeiro bloco de imports
        lines = new.splitlines(keepends=True)
        insert_at = 0
        for i, ln in enumerate(lines[:200]):
            if ln.startswith(("import ", "from ")):
                insert_at = i + 1
        lines.insert(insert_at, GUARD_IMPORT)
        new = "".join(lines)
    bak = f"{path}.bak.{int(time.time())}"
    shutil.copy2(path, bak)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new)
    print(f"   ✅ patchado: {path} (backup: {bak})")
    return True

changed = 0
for p in sys.argv[1:]:
    try:
        if patch_file(p):
            changed += 1
    except Exception as e:
        print(f"   ❌ erro em {p}: {e}")
print(f"\n📊 total alterados: {changed}")
PYEOF

# 3) executa patch dentro do container
echo "🔧 Aplicando patch..."
docker exec "$CONTAINER" python3 "$PATCH_PY" "${TARGETS[@]}"

# 4) restart só do webui
echo "♻️  Reiniciando container $CONTAINER..."
docker restart "$CONTAINER" >/dev/null
sleep 3

echo "🩺 Health check:"
docker exec "$CONTAINER" sh -c "curl -sf http://localhost:8080/health || echo 'sem /health'"

echo "✅ Patch aplicado. Testa no chat: se o provider quebrar agora, vai voltar JSON de erro legível em vez de 500."

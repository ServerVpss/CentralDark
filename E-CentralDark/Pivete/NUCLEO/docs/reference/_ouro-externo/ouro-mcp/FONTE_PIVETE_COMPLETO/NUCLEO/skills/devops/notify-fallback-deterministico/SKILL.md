---
name: notify-fallback-deterministico
description: VPS notify fails; deterministic fallback in notify.sh.
---

# Notify Fallback Determinístico (padrão do Pivete)

## Quando usar
- Notificador VPS falha (billing, runner bloqueado, IA/API indisponível).
- Precisa achar o PONTO ÚNICO onde ligar fallback bruto que chama Telegram direto.
- NÃO é para aplicar agora — é conhecimento de reserva. Esperar ordem do Pivete.

## Pontos exatos mapeados (prova nos prints da aula SOL)
| Camada | Arquivo | Seletor de destino |
|---|---|---|
| Guardião VPS | `infra/guardiao/notifier.py` → `notificar_telegram()` | `NOTIFY_CHAT_ID` |
| Hermes VPS | `apps/modulos/HERMES-CORE/utils/notify.mjs` | `NOTIFY_CHAT_ID` |
| Código bruto | `infra/notify/notify.sh` / `notify.py` | `NOTIFY_CHAT_ID` ou `ADMIN_CHAT_ID` |
| Bot emergência | `@Guardiaonotify_bot` (recupera VPS quando SSH cai) | — |
| Bot usado hoje | `@srver1bot` (notificadores atuais do código) | — |
| `@Guardiaodopivete_bot` | NÃO aparece no main — é o bot da Casa/local | — |

## Snippet exato (cole ANTES de `exit 3` no bloco `if [[ $ok -eq 0 ]]`)
```bash
FALLBACK="/root/CentralDark/scripts/notify-claude/notify-telegram.sh"

if [[ -x "$FALLBACK" ]]; then
  NOTIFY_CHAT_ID="${NOTIFY_CHAT_ID:-}" \
    "$FALLBACK" "🚨" "$TITULO" "$MENSAGEM" || true
fi
```

## Bloco completo resultante
```bash
if [[ $ok -eq 0 ]]; then
  ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "[$ts] FALHOU: $PAYLOAD" >>"$QUEUE_FILE"
  echo "[notify] aviso: rota principal inacessível, guardado em $QUEUE_FILE" >&2

  FALLBACK="/root/CentralDark/scripts/notify-claude/notify-telegram.sh"

  if [[ -x "$FALLBACK" ]]; then
    NOTIFY_CHAT_ID="${NOTIFY_CHAT_ID:-}" \
      "$FALLBACK" "🚨" "$TITULO" "$MENSAGEM" || true
  fi

  exit 3
fi
```

## Fluxo do fallback (arquitetura correta)
```
SOL DE CASA ONLINE      -> ela recebe e coordena
SOL OFFLINE/SEM API     -> código bruto continua
CÓDIGO BRUTO PRECISA AVISAR -> chama notificar_telegram()
VPS/HERMES FALHOU       -> Guardião envia o último alerta
TUDO FALHOU             -> bloqueia e preserva o registro
```

## Correção de comportamento (lição da aula)
- Não ficar na "zona burra" procurando construir o que já existe.
- O ponto já existe; hoje apenas enfileira após 3 tentativas. A adição conecta o fallback DIRETO.
- SOL não é última esperança — é coordenadora. Código bruto e Guardião ficam atrás como resguardo.
- TIRO CERTEIRO: sair da leitura JÁ com o ponto e o código exatos. Não improvisar V2/orquestrador novo.

## Proibido
- Aplicar sem ordem do Pivete.
- Criar sistema paralelo / V2.
- Tocar em `NOTIFY_CHAT_ID` ou `notifier.py` sem treino autorizado.

---
title: "MÉTODO — Switch de modelos no proxy (comando switch embutido)"
date: 2026-07-01
tags: ["proxy", "switch-model", "claude-code", "terminal", "tutorial"]
---

# 🔄 MÉTODO: Switch de modelos no proxy Claude

## O problema

O proxy `claude.ap7.site` expõe 6 modelos (Opus 4.8, Sonnet 4.6, Haiku 4.6 e suas variantes `[1m]`), mas o Claude Code CLI nem sempre lista todos no `/switch-model` nativo. Além disso, o usuário queria poder escolher o modelo **sem depender de comandos extras ou pastas `.claude/commands/`**.

## A solução

Embutir a funcionalidade de **listar modelos** e **trocar modelo** diretamente no script `claude-proxy.sh`, que já gerencia liga/desliga do proxy. Assim:

- **Tudo num arquivo só** — não precisa criar pasta `.claude/commands/` nem instalar nada extra.
- **Consulta ao vivo** — o script faz `curl` no endpoint `/v1/models` do proxy e mostra os modelos disponíveis **na hora**.
- **Dois modos de troca:**
  - **Direto:** `source claude-proxy.sh switch sonnet-4.6`
  - **Interativo:** `source claude-proxy.sh switch` → mostra menu numerado → usuário digita o número
- **Persistência:** a variável `ANTHROPIC_MODEL` é exportada no terminal atual. Enquanto o terminal estiver aberto, o modelo escolhido vale.

## Como funciona (o método)

```
┌──────────────────────────────────────────────────────────┐
│  1. source claude-proxy.sh on                            │
│     → carrega ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN  │
│     → proxy ligado                                       │
│                                                          │
│  2. source claude-proxy.sh models                        │
│     → curl GET /v1/models                                │
│     → mostra tabela com modelos disponíveis              │
│                                                          │
│  3. source claude-proxy.sh switch <ID>                   │
│     → export ANTHROPIC_MODEL=<ID>                        │
│     → Claude Code usa esse modelo nas próximas chamadas  │
│                                                          │
│  4. claude                                                │
│     → abre o Claude Code com o modelo escolhido          │
└──────────────────────────────────────────────────────────┘
```

## O código essencial

A função `trocar_modelo()` no script:

```bash
trocar_modelo() {
  local ESCOLHA="$1"

  # Se não passou o modelo, busca lista do proxy e mostra menu
  if [ -z "$ESCOLHA" ]; then
    # curl no /v1/models → parse com python3 → menu numerado
    # usuário digita número → extrai model ID do JSON
    ...
  fi

  # Aplica o modelo
  export ANTHROPIC_MODEL="$ESCOLHA"
}
```

A função `listar_modelos()`:

```bash
listar_modelos() {
  # curl no /v1/models com a key do cofre
  # parse com python3 inline → tabela formatada
}
```

## Por que funciona universalmente

- **Dependências:** só `bash`, `curl` e `python3` — tem em qualquer VPS Linux.
- **Sem instalação:** o script já está no repositório (`secrets/claude-proxy.sh`).
- **Sem arquivos extras:** não precisa de `.claude/commands/`, não precisa de plugins.
- **Portátil:** copia o script pra qualquer máquina, ajusta o `COFRE` e funciona.

## Onde alterar para usar em outro lugar

```
LINHA 18: COFRE="/root/CentralDark/secrets/anthropic.env"  ← caminho do cofre
LINHA 19: ACAO="${1:-status}"                                ← não mexe
LINHA 20: MODELO="${2:-}"                                    ← não mexe
```

Se for usar em outra VPS sem o cofre, pode setar as variáveis manualmente antes:

```bash
export ANTHROPIC_BASE_URL="https://seu-proxy.com"
export ANTHROPIC_AUTH_TOKEN="sua-key-aqui"
# Depois usa o script normalmente
```

## Testes realizados

| Comando | Resultado |
|---------|-----------|
| `bash claude-proxy.sh status` | ✅ Mostra status correto (ligado/desligado + modelo) |
| `bash claude-proxy.sh models` | ✅ Lista 6 modelos do proxy |
| `source claude-proxy.sh switch sonnet-4.6` | ✅ Troca modelo + status reflete |
| `source claude-proxy.sh switch` (menu) | ✅ Menu interativo, escolha por número |
| `source claude-proxy.sh off` | ✅ Desliga, status mostra "DESLIGADO" |
| `source claude-proxy.sh on` | ✅ Liga, status mostra URL do proxy |

## Conexões

- [[TUTORIAL-TERMINAL-SEM-CONTA]] — tutorial completo de uso
- [[APRENDIZADOS_PROXY]] — diagnóstico de autenticação

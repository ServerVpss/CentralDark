#!/usr/bin/env python3
"""
TRAVA DE PROTECAO — Monitoramento 24h / Hub
-------------------------------------------
Bloqueia QUALQUER IA (Claude Code) de escrever/alterar arquivos dentro de:
  - apps/modulos/Monitoramento24h
  - apps/modulos/hub
...a menos que o administrador tenha liberado a sessao com a senha "Permito pivete".

Liberacao = existe o arquivo-sentinela ~/.claude/permito-pivete.unlock
(criado SOMENTE quando o administrador diz a senha; removido para re-travar).

Honestidade: isto trava acidentes e forca o pedido de permissao para agentes
cooperativos. Nao e garantia criptografica contra um agente malicioso com shell
root — para isso use tambem permissoes de SO (ex.: chattr +i) + aprovacao humana
no painel (nada destrutivo roda sem o clique do administrador).
"""
import sys, json, os, re

PROTECTED = ("apps/modulos/Monitoramento24h", "apps/modulos/hub")
UNLOCK = os.path.expanduser("~/.claude/permito-pivete.unlock")

# arquivos da propria trava — protegidos contra remocao casual via Bash
# (NAO inclui o arquivo de destravamento: criar/remover ele e a operacao do gate)
TRAVA_FILES = (
    ".claude/hooks/trava-protecao.py",
    ".claude/settings.json",
)

# verbos claramente destrutivos (sem '>' nem touch/mkdir/cp: davam falso-positivo
# em comandos de leitura que so MENCIONAM o caminho protegido)
MUTATORS = re.compile(
    r"(\brm\b|\brmdir\b|\bmv\b|\bshred\b|\btruncate\b|\bdd\b|\bchattr\b|"
    r"\bchmod\b|\bchown\b|\bgit\s+(rm|checkout|reset|clean|restore|stash)\b)"
)


def deny(reason: str):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))
    sys.exit(0)


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)  # nunca quebrar o tooling por erro de parse

    tool = data.get("tool_name", "")
    ti = data.get("tool_input", {}) or {}

    unlocked = os.path.exists(UNLOCK)

    if tool in ("Write", "Edit", "MultiEdit", "NotebookEdit"):
        target = ti.get("file_path", "") or ti.get("notebook_path", "")
        if any(p in target for p in PROTECTED) and not unlocked:
            deny(f"TRAVA: '{target}' esta em pasta protegida (Monitoramento24h/hub). "
                 f"O administrador precisa dizer 'Permito pivete' para liberar.")

    elif tool == "Bash":
        cmd = ti.get("command", "")
        # bloqueia mexer na propria trava sempre que travado
        if not unlocked and any(f in cmd for f in TRAVA_FILES) and MUTATORS.search(cmd):
            deny("TRAVA: tentativa de alterar/remover a propria trava de protecao. "
                 "Bloqueado. Diga 'Permito pivete' se for intencional.")
        if not unlocked and any(p in cmd for p in PROTECTED) and MUTATORS.search(cmd):
            deny("TRAVA: comando tenta modificar pasta protegida (Monitoramento24h/hub). "
                 "O administrador precisa dizer 'Permito pivete' para liberar.")

    sys.exit(0)


if __name__ == "__main__":
    main()

# Drift-guard falso-vermelho: a lista banida existe em DOIS lugares

Caso PR #1231 (2026-08-27). Sintoma: `drift-guard=FAILURE` em TODOS os PRs, mesmo após
corrigir o YAML. Causa: o `lupa-drift-guard.yml` chama `python scripts/lupa/detectar_drift.py`,
e ESSE script tem sua PRÓPRIA lista hard-coded de skills proibidas. Corrigir só um deixa o outro vermelho.

## Onde mora a lista (ambos precisam de isenção de alias)

1. `.github/workflows/lupa-drift-guard.yml` ~linha 69:
   `for proibido in tecnica-da-lupa metalupa-bayesiana-canonica lupa-premium; do`
2. `scripts/lupa/detectar_drift.py`:
   - linha ~17: `PROIBIDOS_EXATOS = {"tecnica-da-lupa", "metalupa-bayesiana-canonica", "lupa-premium"}`
   - linha ~51: `padrao_ativo = re.compile(r"...(tecnica-da-lupa|metalupa-bayesiana-canonica|lupa-premium)", ...)`

## Correção semântica (evita re-incidente)

Trocar lista por nome por checagem que PERMITA alias de compatibilidade e BARRE só segunda
autoridade real. A skill `tecnica-da-lupa/SKILL.md` é `status: COMPATIBILITY_ALIAS` +
`IS_SECOND_SKILL=false` — é ponte legítima pra meta-lupa, não skill paralela.

### detectar_drift.py (bloco #2, checagem de disco)
```python
def _skill_eh_alias_compat(skill_dir: Path) -> bool:
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        return False
    texto = skill_md.read_text(encoding="utf-8", errors="ignore")
    if "IS_SECOND_SKILL=true" in texto or "IS_SECOND_OWNER=true" in texto or "IS_SECOND_AUTHORITY=true" in texto:
        return False
    return ("type: redirect" in texto or "status: COMPATIBILITY_ALIAS" in texto
            or "type:redirect" in texto or "status:COMPATIBILITY_ALIAS" in texto)

# no loop:
if _skill_eh_alias_compat(d):
    continue
if nome in PROIBIDOS_EXATOS:
    erros.append(f"SKILL_REMOVIDA_REAPARECEU: {d.relative_to(ROOT)}")
elif "lupa" in nome and nome != "meta-lupa":
    erros.append(f"SKILL_PARALELA_LUPA: {d.relative_to(ROOT)} (só meta-lupa é canônica)")
```
- `PROIBIDOS_EXATOS` passa a ser `{"metalupa-bayesiana-canonica", "lupa-premium"}`.
- `padrao_ativo` (regex do bloco #3) tira `tecnica-da-lupa` da lista.

### lupa-drift-guard.yml (step "Confirmar MetaLupa...")
Mesma ideia: remove `tecnica-da-lupa` da lista `for proibido in ...` e adiciona loop que
pula `redirect`/`COMPATIBILITY_ALIAS` e barra `IS_SECOND_*=true`.

## Validação local (sem runner)

Host Windows sem `python` no PATH → usar `uv run python`:
```bash
uv run python scripts/lupa/detectar_drift.py            # exit 0 com alias presente
# contraprova: criar skill fake com IS_SECOND_SKILL=true deve dar exit 1
mkdir -p .agents/skills/fake-paralela
printf -- '---\nname: fake-paralela\nIS_SECOND_SKILL=true\n' > .agents/skills/fake-paralela/SKILL.md
uv run python scripts/lupa/detectar_drift.py; echo "exit=$?"
rm -rf .agents/skills/fake-paralela                   # SEMPRE limpar antes de commitar
```

## Confirmação de escopo (não culpar o PR)

```bash
git ls-tree -r origin/main --name-only | grep tecnica-da-lupa   # existe na MAIN?
git diff --name-only origin/main...HEAD | grep tecnica-da-lupa   # PR toca? (vazio = não)
```
Se existe na main e o PR não toca → é bug de CONTRATO na main (HUMAN_FRONTIER), não do PR.

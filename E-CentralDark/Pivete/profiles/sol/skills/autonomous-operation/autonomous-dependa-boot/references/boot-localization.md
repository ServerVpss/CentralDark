# Boot Localization — Finding Existing Boot Configuration

## Visão Geral

Antes de criar novo boot configuration, localizar o que já existe no repo.

## Commands

```bash
# Buscar commits com "boot"
git log --all --oneline --grep="boot" --since="2026-08-01"

# Buscar commits que tocam arquivos de boot
git log --all --oneline -- "*CENTRALDARK_AI_BOOT*" "*AI_BOOT*" "*boot*"

# Encontrar arquivos de configuração
find . -maxdepth 3 -type f \( -name "*BOOT*" -o -name "*boot*" -o -name "*.yaml" -o -name "*.yml" \)
```

## Commits Relevantes (CentralDark)

| Commit | Mensagem |
|--------|----------|
| `c4d713fbe` | `fix(boot): CENTRALDARK_AI_BOOT.yaml com merge inteligente` |
| `a104fdf01` | `fix(boot): amarrar politica de conflito no CENTRALDARK_AI_BOOT` |
| `cfe195c18` | `fix(boot): CENTRALDARK_AI_BOOT propagava a politica de conflito ERRADA` |
| `400b3a908` | `🔒 FIX(GIT): MOTOR DE CONFLITO FALHAVA ABERTO — CORRIGIDO E AMARRADO NO BOOT (#1343)` |
| `b945b9184` | `feat(boot): integrar Mermaid determinístico + saída pt-BR (#1222)` |

## Reuso vs Criação

**REUSE** quando:
- Boot config existente cobre a intenção
- Não há gap real provado
- Usuário mencionou "padrão já registrado"

**CREATE** apenas quando:
- Gap real provado (boot existente não cobre intenção)
- Gap documentado com evidência
- Reuse não é possível

## Regra

`REUSE_BEFORE_CREATE=true`

Não criar novo boot pattern sem gap real provado. Isso viola a regra de reutilização e pode criar conflitos.

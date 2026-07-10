# Status do Cofre de IAs

## Estado atual

```text
Branch de origem: pivete/dev
PR de auditoria: #157
Fluxo: pivete/dev → pivete/auditoria → main
Merge realizado: NÃO
Deploy realizado: NÃO
```

## Arquivos principais

- `00-COMECE-AQUI-IA.md`
- `AGENTS.md`
- `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md`
- `docs/COFRE/README.md`
- `docs/COFRE/COMO-FALAR-COM-O-PIVETE.md`
- `docs/COFRE/LOCALIZACAO-RAPIDA.txt`
- `docs/COFRE/PROMPT-CURTO-PARA-QUALQUER-IA.md`
- `docs/GOVERNANCA/BOOT-IA.md`
- `docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md`
- `docs/PROTOCOLO-BOOT.md`
- `GROK.md`
- `GEMINI.md`
- `CLAUDE.md`
- `.claude/BOOT-PIVETE.md`
- `.github/copilot-instructions.md`
- `scripts/ia/verificar-ambiente.sh`

## Harmonização de BOOT

```text
Porta universal:
00-COMECE-AQUI-IA.md

Regra universal:
AGENTS.md

Hierarquia e precedência:
docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md

BOOT operacional:
docs/GOVERNANCA/BOOT-IA.md

Memória e continuidade:
docs/PROTOCOLO-BOOT.md
```

O protocolo antigo foi preservado e reclassificado como memória/continuidade complementar. O histórico Git permanece disponível.

## Última prova

- `README.md` agora aponta primeiro para a porta universal.
- `CLAUDE.md` foi harmonizado sem remover mapa ou áreas protegidas.
- Grok, Gemini, Claude e Copilot apontam para a mesma hierarquia.
- O BOOT distingue branch do workspace de ref remota inspecionada.
- PR #157 permanece aberto para auditoria.

## Promoção pendente

```text
pivete/dev → PR #157 → pivete/auditoria → PR futuro → main
```

Enquanto não chegar à `main`, uma IA deve abrir ou inspecionar a branch `pivete/dev` para encontrar estas regras.

---
description: Grava uma lembrança nas Lembranças do Pivete (memória de curto prazo, 30 dias)
argument-hint: [o que você quer lembrar]
---

O Pivete quer registrar uma lembrança. Conteúdo bruto: "$ARGUMENTS"

Faça:
1. Se o conteúdo estiver vazio, pergunte direto "O que você quer que eu lembre?" e pare.
2. Extraia só o **essencial** (o "ouro"), sem ruído nem dado sensível.
3. Chame a ferramenta `consolidar_pensamento` do MCP CentralDARK com: o título curto, o
   conteúdo essencial, tags adequadas e a relevância (alta/media/baixa). Eixo = presente,
   salvo se o texto indicar passado ou futuro.

Ao terminar, confirme num card monospace (estilo CentralDark):
```
╔═══════════════════════════════════════╗
║   🧠 LEMBRANÇA GRAVADA                 ║
╠═══════════════════════════════════════╣
║   O quê: <título>                      ║
║   Tags:  <tags>                        ║
║   Expira: <data +30 dias>              ║
╚═══════════════════════════════════════╝
```
PT-BR, direto, zero enrolação.

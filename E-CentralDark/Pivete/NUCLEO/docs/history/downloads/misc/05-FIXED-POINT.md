# FIXED POINT

Loop:

```text
RECUPERAR
→ ALINHAR
→ MAPEAR
→ CONTRAPROVAR
→ RECONCILIAR
→ REMEDIR
```

Saída:
- nova informação material → DELTA;
- mesma informação / mesma evidência → DROP_DUPLICATE;
- sem ganho → NO_CHANGE;
- conflito não distinguível → UNKNOWN;
- efeito provado → PASS;
- prova falha → FAIL + remediação.

`FIXED_POINT` não significa saber tudo.  
Significa: **outra passagem com a mesma evidência não muda materialmente a conclusão.**

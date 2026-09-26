# Arquitetura Integrada — CentralDark

```text
SEGREDO/CHEFE
      ↓ intenção
PIVETE / missão + aprovação
      ↓
BFF / interface de execução
      ↓
POLICY ENGINE
      ↓
HERMES ORCHESTRATOR / KANBAN
      ↓
EXECUTION BROKER
      ↓
WORKSPACE / WORKTREES
      ↓
PREVIEW / TESTES / CONTRAPROVA
      ↓
GITHUB GATE
      ↓
GATEWAY / SUPABASE / WEBUI / TELEGRAM (quando aplicável)
```

Contrato do workspace:
- não escrever na `main` local suja;
- percepção pode paralelizar;
- mutação é serializada;
- um Writer por escopo.

Casa local:
- `E:\CentralDark` concentra material portátil/canônico após prova.
- estado obrigatório de aplicativos pode permanecer em perfil/AppData.
- referências físicas não são movidas só por preferência estética.

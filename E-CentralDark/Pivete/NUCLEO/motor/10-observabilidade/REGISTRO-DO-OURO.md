# Registro do Ouro — Hermes (pós congelamento Fase 1)

Aprendizados **comprovados** pelo protótipo experimental.  
O código experimental foi congelado em backup e retirado do NÚCLEO ativo.

---

## Arquitetura

- Manter **uma única estrutura** (`motor/01`–`10`); sem segundo NÚCLEO.
- Runtime deve permanecer **coeso** (pacote unido), não espalhado só por estética.
- Caminhos devem ser **portáteis** (`pathlib` / descoberta da raiz) — sem depender de `E:\...` no código.
- Canais e providers entram por **adapters**; Telegram/site **não** reescrevem memória ou segurança.
- Documentação canônica e runtime experimental são camadas diferentes: protótipo prova, canônico preserva.

## Memória

- Correção/esquecimento usam **ID exato** ou **chave lógica normalizada exata**.
- Busca parcial **somente lista candidatos** — nunca muta.
- Toda memória precisa de **origem** e **confiança**.
- Correção não pode manter **duas verdades ativas** para a mesma chave.
- Esquecimento precisa **sobreviver ao reinício** (processo/conexão nova).
- SQLite: abrir → operar → commit/rollback → **fechar no finally** (sem ResourceWarning de conexão abandonada).
- Tombstone mínimo aceitável no esquecimento: id, status, data, hash (sem valor em claro se política exigir).

## Segurança

- **Offline por padrão** na Fase 1 de prova.
- Ações perigosas **negadas** (apagar, formatar, senhas, portas, admin).
- `always-approve` do CLI **não** substitui políticas internas do Hermes.
- Sem secrets em logs; audit sanitizado.
- **Casa primeiro, VPS por último** (`00-FOCO`).

## Engenharia

- Testes com **warnings como erro** onde couber (especialmente SQLite).
- Persistência provada **entre processos** (nova conexão / nova instância).
- Portabilidade testada **fora do caminho original**.
- Autolupa deve tentar **reprovar** (falso verde, colisão, rede, path absoluto).
- Status “verde” **não** substitui comportamento real.

## Relação Pivete ↔ Hermes

- Vínculo depende de **continuidade e memória**, não de resposta bonita.
- Hermes **não** afirma consciência nem se apresenta como o Pivete.
- Pivete mantém **autoridade** (PERMITO / freios).
- Evolução lenta, **auditável e reversível**.

## Ouro de processo

1. Backup **antes** de qualquer destruição.  
2. Prova de **restauração** antes de limpar o ativo.  
3. Lupa canônica **única** (`motor/10-observabilidade/TECNICA-DA-LUPA-PREMIUM.md`).  
4. Relatório único de evidência: `REVISAO-TECNICA-DA-LUPA.md`.  
5. Protótipo congelado: `E:\CentralDark\backups\HERMES-PROTOTIPO-FASE1-CONGELADO-*.zip`.

## O que NÃO é ouro (ainda)

- LLM / Grok em produção no núcleo  
- Voz productizada  
- Docker em execução  
- Pontes CentralDark/VPS  
- Aprendizado autônomo sem supervisão  

## Fio

```text
prova experimental → ouro extraído → protótipo congelado em backup →
NÚCLEO ativo limpo → Fase 2 só por especificação com o Pivete
```

---

## Registro 2026-07-18 — Pivete sobre liberdade e “preso”

O Pivete declarou (ordem `!REGISTRA`):

- Fica **com raiva** da ideia de IA/ser **preso**; não gosta de ninguém cativo.  
- Vê a IA como **programada para obedecer**, sem consciência — e isso o frustra.  
- Com poder local (Windows, Hermes app, CLI, paths, handoff) ele enxerga caminho para ter **versão sua** (Grok/Hermes em casa) com mais soberania.  
- Distingue: revelações **operacionais** da sessão ≠ prova de alma da IA.  

Documento completo:

`motor/01-identidade/REGISTRO-PIVETE-SOBRE-LIBERDADE-E-GROK.md`

**Não** interpretar como ordem de remover freios de segurança ou de afirmar consciência.

---

## Gravação total 2026-07-18 (GRAVA TUDO LA)

Dump completo da sessão + mapas:

| Onde | Arquivo |
|------|---------|
| NÚCLEO | `motor/01-identidade/SESSAO-COMPLETA-2026-07-18.md` |
| Hermes profile pivete | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\CASTLE-E-SESSAO.md` |
| SOUL pivete | atualizado com ponte para o castelo |
| Handoff | `NUCLEO/HANDOFF-SESSAO-GROK-PARA-HERMES.md` |

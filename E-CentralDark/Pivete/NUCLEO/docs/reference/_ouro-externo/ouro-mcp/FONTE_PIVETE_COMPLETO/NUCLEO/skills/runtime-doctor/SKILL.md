---
name: runtime-doctor
description: Diagnostica falhas de inicialização, compilação, dependências, processos, portas e health-checks em aplicações locais. Deve ser usada ANTES de matar processos, apagar node_modules, alterar lockfiles ou reinstalar pacotes. Opera subordinada à Meta Lupa canônica e ao centraldark-adapter, sem duplicar seus motores. Trigger: /runtime-doctor, ou sempre que um servidor não sobe, um binário falta, ou um processo parece travado.
trigger: /runtime-doctor
parent: meta-lupa
grandparent: centraldark-adapter
---

# Runtime Doctor

## Finalidade

Identificar com evidência a camada exata responsável por uma falha de execução antes de alterar o ambiente.

Esta skill NÃO autoriza tentativa e erro destrutiva.

Ela deve distinguir:

1. processo vivo;
2. aplicação pronta;
3. compilação em andamento;
4. compilação travada;
5. dependência ausente;
6. dependência instalada em local incorreto;
7. executável ou shim ausente;
8. configuração incorreta;
9. porta ocupada;
10. health-check inválido;
11. instalação incompleta;
12. falha causada pelo próprio agente.

## Hierarquia obrigatória

1. Carregar a Meta Lupa canônica (skill `meta-lupa`).
2. Carregar o `centraldark-adapter` quando disponível.
3. Confirmar repositório, HEAD, diretório de trabalho e package manager.
4. Operar como um único Writer por escopo.
5. Não declarar sucesso sem prova ponta a ponta.

Caso a Meta Lupa obrigatória esteja indisponível:

```
STATUS=BLOCKED
REASON=META_LUPA_UNAVAILABLE
```

Não simular sua execução.

## Regra principal

**Sintoma não é causa.**

Nenhuma correção pode ser aplicada enquanto a causa permanecer apenas como hipótese.

Antes de executar uma mudança, registrar:

```
SYMPTOM=
OBSERVED_FACTS=
HYPOTHESES=
DISCRIMINATING_TESTS=
PROVEN_CAUSE=
MINIMAL_FIX=
ROLLBACK=
VERIFICATION=
```

Se `PROVEN_CAUSE` estiver vazio:

```
ACTION=READ_ONLY
STATUS=DIAGNOSIS_INCOMPLETE
```

## Proibições

Sem causa comprovada, é PROIBIDO:

- matar processos;
- executar `taskkill`;
- apagar `node_modules`;
- apagar lockfiles;
- executar instalação completa novamente;
- reinstalar pacote;
- trocar package manager;
- alterar `package.json`;
- alterar scripts;
- mudar porta;
- usar `--force`;
- usar `--legacy-peer-deps`;
- declarar que o drive está lento como causa;
- interpretar silêncio do terminal como travamento;
- considerar PID existente como aplicação saudável;
- considerar HTTP 200 isolado como funcionamento ponta a ponta.

## Fase 1 — Congelar o estado

Capturar ANTES de qualquer alteração:

```
cwd
git HEAD
git status
package manager
package manager version
Node.js version
package.json hash
lockfile hash
node_modules existence
command executed
PID
process start time
port
log path
log size
log last-write time
```

Toda evidência deve pertencer à mesma execução observada.

## Fase 2 — Classificar o sintoma

Classificar em apenas uma categoria principal:

```
BOOT_NOT_STARTED
BOOT_IN_PROGRESS
BOOT_STALLED
PROCESS_EXITED
PORT_NOT_LISTENING
HTTP_NOT_READY
COMPILE_ERROR
DEPENDENCY_MISSING
BINARY_MISSING
CONFIGURATION_ERROR
WORKSPACE_MISMATCH
HEALTHCHECK_INVALID
UNKNOWN
```

`UNKNOWN` nunca equivale a falha comprovada nem autoriza correção destrutiva.

## Fase 3 — Diagnóstico de processo

Verificar:

- PID realmente existente;
- comando completo do processo;
- diretório de trabalho;
- horário de início;
- consumo de CPU;
- alteração recente do log;
- filhos do processo;
- porta escutada pelo mesmo PID;
- código de saída, quando encerrado.

Um processo com PID ativo NÃO prova que a aplicação está pronta.

## Fase 4 — Diagnóstico de compilação

Para determinar se a compilação está lenta ou travada, medir pelo menos DOIS snapshots separados:

```
log size
log modification time
CPU time
child processes
open files when disponível
port state
```

Se houver progresso entre snapshots:

```
STATE=BOOT_IN_PROGRESS
ACTION=DO_NOT_INTERFERE
```

Se NÃO houver progresso, ainda deve ser procurada uma mensagem de erro, espera de input, instalação automática ou bloqueio externo antes de classificar como travamento.

## Fase 5 — Diagnóstico de dependências

Para qualquer pacote suspeito, separar:

```
DECLARED
LOCKED
INSTALLED
RESOLVABLE
EXECUTABLE
COMPATIBLE
```

Exemplo para TypeScript (Windows/POSIX):

```powershell
npm ls typescript --depth=0
node -p "require.resolve('typescript/package.json')"
node -p "require.resolve('typescript/bin/tsc')"
Test-Path .\node_modules\.bin\tsc.cmd
npm exec -- tsc --version
```

```bash
npm ls typescript --depth=0
node -e "console.log(require.resolve('typescript/package.json'))"
node -e "console.log(require.resolve('typescript/bin/tsc'))"
test -f node_modules/.bin/tsc && echo "shim OK" || echo "shim MISSING"
npx --no-install tsc --version
```

Interpretação:

- declarado, mas não instalado: verificar `omit`, `production` e workspace;
- instalado, mas não resolvível: verificar diretório e árvore de módulos;
- resolvível, mas shim ausente: investigar linkagem ou instalação incompleta;
- executável funcionando via `npm exec`: NÃO reinstalar o pacote apenas porque `tsc` não está no PATH;
- pacote encontrado em outro workspace: corrigir o escopo, não reinstalar cegamente.

## Fase 6 — Package manager

Antes de qualquer instalação, identificar o gerenciador canônico por:

1. campo `packageManager` do `package.json`;
2. lockfile vigente;
3. documentação canônica do repositório;
4. scripts de bootstrap.

Nunca misturar npm, pnpm e Yarn na mesma árvore sem autorização explícita e prova de compatibilidade.

## Fase 7 — Escolha da correção

Aplicar apenas a menor correção que trate a causa comprovada.

Prioridade:

1. corrigir comando ou diretório incorreto;
2. corrigir configuração que omitiu dependências;
3. reconstruir somente o shim ou pacote afetado;
4. executar instalação determinística pelo lockfile;
5. reconstruir `node_modules` somente como último recurso comprovado.

Toda ação deve possuir rollback definido antes da execução.

## Fase 8 — Verificação

Após a correção, provar:

1. pacote resolvível;
2. binário executável;
3. comando de desenvolvimento inicia;
4. compilação termina;
5. porta pertence ao processo esperado;
6. health-check responde;
7. rota funcional real responde;
8. logs não contêm erro novo;
9. arquivos de configuração e lockfile não sofreram drift inesperado.

## Resposta obrigatória

A resposta deve começar pelo resultado:

```
STATUS=
CAUSE=
ACTION_TAKEN=
PROOF=
REMAINING_RISK=
```

Não narrar repetidamente "vou aguardar mais".

Durante espera legítima, informar apenas medições:

```
STATE=BOOT_IN_PROGRESS
PID=
CPU_DELTA=
LOG_SIZE_DELTA=
LAST_LOG_EVENT=
PORT_STATE=
```

## Gate contra narrativa inventada

Frases como estas exigem prova imediatamente anexada:

- "o drive está lento";
- "o npm não criou os binários";
- "o processo travou";
- "o Next.js está instalando";
- "o pacote está corrompido";
- "a reinstalação vai resolver".

Sem comando, saída e correlação causal:

```
CLAIM=UNPROVEN
ACTION=READ_ONLY
```

## Princípio central

Não ensine o Hermes a encontrar mais comandos; ensine-o a **impedir comandos enquanto a causa não estiver provada**.

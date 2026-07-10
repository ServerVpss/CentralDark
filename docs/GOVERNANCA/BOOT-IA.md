# BOOT obrigatório de IA — CentralDark

Nenhuma IA deve editar, commitar, fazer push ou deploy antes de concluir este BOOT.

## 1. Leitura obrigatória

```text
AGENTS.md
docs/COFRE/README.md
docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md
```

## 2. Verificação técnica

Executar no repositório remoto autorizado:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git remote -v
git fetch origin
```

Também pode executar:

```bash
bash scripts/ia/verificar-ambiente.sh
```

## 3. Resposta obrigatória antes de agir

```text
BOOT CENTRALDARK

Branch atual:
Commit atual:
Diretório de trabalho:
Ambiente de deploy:
Missão:
Objetivo do Pivete:
Arquivos e módulos permitidos:
Arquivos e módulos proibidos:
Riscos identificados:
Testes obrigatórios:
Prova esperada:
Rollback:
Status do workspace:
```

## 4. Decisão por branch

### `main`

- Somente leitura, inspeção e comparação.
- Edição direta bloqueada.
- Commit direto bloqueado.
- Deploy só após PR auditado, gates verdes e autorização explícita.

### `pivete/dev`

- Edição e testes do MVP permitidos.
- Commit pequeno, descritivo e reversível.
- Push obrigatório antes do deploy.
- Deploy somente no ambiente DEV.
- Após aprovação visual do Pivete, perguntar se pode encaminhar para auditoria.

### `pivete/auditoria`

- Auditoria, correção, testes e homologação permitidos.
- Ciclos autônomos de diagnóstico → correção → teste → commit podem continuar.
- Deploy somente no ambiente AUDIT/STAGING.
- Merge para `main` continua bloqueado sem gates e autorização.

### Branch de missão

- Deve informar de qual branch permanente nasceu.
- Deve possuir escopo restrito.
- Deve voltar por PR para a branch correta.

## 5. Gates antes do commit

- Escopo respeitado.
- Diff revisado.
- Sem secrets.
- Build ou validação sintática executada.
- Testes relevantes executados.
- Nenhuma alteração incidental ou arquivo estranho.

## 6. Gates antes do deploy

```text
código alterado
→ teste
→ commit
→ push
→ deploy do SHA exato
→ smoke test
→ evidência
```

Deploy de código não commitado é proibido.

## 7. Formato de comunicação com o Pivete

```text
🟢 FORMA
O que aconteceu e qual é o estado.

👶 LEIGO
Explicação simples, sem presumir conhecimento técnico.

🛠️ DESCRIÇÃO TÉCNICA
Branch, SHA, diff, testes, riscos, evidência e rollback.
```

## 8. Ações que exigem parada e autorização

- perda ou remoção de dados;
- migração destrutiva;
- alteração de credencial, token ou chave;
- alteração de DNS, domínio, firewall ou acesso administrativo;
- mudança direta em produção;
- force-push ou reescrita de histórico;
- conflito entre a intenção do Pivete e a implementação técnica;
- dúvida sobre qual ambiente ou branch usar.

## 9. Encerramento obrigatório

Toda missão termina com:

```text
Status: CONCLUÍDO | PARCIAL | BLOQUEADO
Branch:
Commit SHA:
Arquivos alterados:
Testes:
Deploy:
Evidências:
Riscos restantes:
Rollback:
Próximo handoff:
```

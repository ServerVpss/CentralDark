# 🧭 DAQUI PRA FRENTE — Guia do Pivete

Este é o guia simples para o Pivete trabalhar com qualquer IA no CentralDark sem precisar decorar a arquitetura.

## 1. Para iniciar qualquer conversa com uma IA

Envie:

```text
Abra ou inspecione a branch pivete/dev.
Leia 00-COMECE-AQUI-IA.md e, em seguida, leia integralmente CLAUDE.md.
Siga AGENTS.md, a hierarquia oficial e execute o BOOT operacional antes de qualquer ação.
Não altere nada até apresentar branch/ref, SHA, escopo, riscos, testes, prova e rollback.
```

A IA deve apresentar o BOOT antes de editar.

## 2. Para começar uma missão no HUB

Envie:

```text
Trabalhe somente em pivete/dev e no ambiente DEV da VPS.
Missão: [descreva aqui o que você quer mudar no HUB].
Faça mudanças pequenas, teste, commit, push e deploy do SHA exato em DEV.
Depois me mostre a prova e o endereço para validação visual.
Não envie para auditoria até eu aprovar o resultado visual.
```

## 3. Seu papel durante o desenvolvimento

O Pivete precisa apenas:

```text
1. dizer o que deseja;
2. olhar o resultado no navegador;
3. pedir ajustes quando necessário;
4. aprovar quando estiver visual e funcionalmente correto.
```

A IA fica responsável por código, organização, testes, commits, evidências e rollback dentro do escopo autorizado.

## 4. Quando o resultado em DEV estiver aprovado

Envie:

```text
Aprovado visualmente, Pivete.
Encaminhe pivete/dev para pivete/auditoria por PR.
Na auditoria, diagnostique, corrija, teste e repita os ciclos necessários dentro do escopo.
Faça deploy somente em AUDIT/STAGING e me entregue evidências.
Não faça merge para main ainda.
```

## 5. Durante a auditoria

As IAs devem cuidar de:

- build e testes;
- bugs e regressões;
- secrets e dependências;
- autenticação, autorização, RLS, CORS e logs, quando aplicável;
- compatibilidade com a Constituição `CLAUDE.md`;
- teste de rollback;
- evidências no PR.

O Pivete não precisa auditar código manualmente.

## 6. Quando a auditoria estiver verde

A IA deve informar:

```text
Status da auditoria:
PR:
Branch e SHA:
Testes:
Build:
Segurança:
Deploy AUDIT/STAGING:
Smoke test:
Riscos restantes:
Rollback:
Pronto para promoção à main: SIM/NÃO
```

Somente depois disso o Pivete autoriza produção.

## 7. Para autorizar main e produção

Use uma autorização explícita e com escopo:

```text
PERMITO PIVETE — promover o PR auditado para main e fazer deploy do SHA aprovado em produção, com verificação pós-deploy e rollback pronto. Não execute nenhuma ação fora desse escopo.
```

A IA deve confirmar o SHA antes do merge e antes do deploy.

## 8. Para parar tudo

Envie:

```text
PARE AGORA.
Não faça commit adicional, merge ou deploy.
Preserve o estado atual e apresente branch, SHA, mudanças pendentes, risco e opção segura de rollback.
```

## 9. Para voltar uma versão em DEV

Envie:

```text
Volte o ambiente DEV para o último SHA comprovadamente verde.
Não use force-push e não reescreva o histórico.
Registre a reversão em commit ou procedimento reversível e mostre a prova.
```

## 10. O que nunca enviar no chat ou no GitHub

```text
tokens
senhas
cookies
service role keys
chaves SSH
arquivos .env reais
credenciais de banco
códigos de recuperação
```

A IA deve usar nomes de secrets e referências seguras, nunca pedir o valor real sem necessidade operacional válida e canal apropriado.

## 11. Onde procurar quando esquecer

```text
Constituição universal: CLAUDE.md
Porta das IAs: 00-COMECE-AQUI-IA.md
Adaptador operacional: AGENTS.md
Cofre: docs/COFRE/README.md
Este guia: docs/COFRE/DAQUI-PRA-FRENTE.md
BOOT: docs/GOVERNANCA/BOOT-IA.md
Fluxo: docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md
Memória: docs/PROTOCOLO-BOOT.md
```

## 12. Fluxo definitivo

```text
Pivete define a intenção
→ IA lê a Constituição e apresenta o BOOT
→ IA trabalha em pivete/dev
→ commit + push + deploy DEV
→ Pivete valida no navegador
→ PR para pivete/auditoria
→ IAs corrigem, testam e auditam
→ deploy AUDIT/STAGING
→ gates e evidências verdes
→ autorização explícita do Pivete
→ PR/merge para main
→ deploy do SHA aprovado em produção
→ verificação e rollback preparado
```

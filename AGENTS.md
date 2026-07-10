# AGENTS.md — Entrada obrigatória das IAs no CentralDark

Este arquivo se aplica a todo o repositório.

## Antes de qualquer ação

Toda IA, agente, CLI, bot ou assistente deve:

1. Ler `docs/COFRE/README.md`.
2. Ler `docs/COFRE/COMO-FALAR-COM-O-PIVETE.md`.
3. Ler `docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md`.
4. Ler `docs/GOVERNANCA/BOOT-IA.md`.
5. Executar o BOOT e informar branch, commit, missão, escopo, risco, testes e rollback.
6. Não alterar arquivos antes de concluir o BOOT.

## Papéis

- **Pivete é a inteligência humana comandante:** define intenção, prioridade, aparência e aprovação funcional.
- **As IAs são a força de execução:** implementam, testam, corrigem, auditam e apresentam evidências.
- **GitHub é a fonte da verdade e o histórico oficial.**
- **A VPS é ambiente remoto de trabalho e execução, nunca a única cópia do código.**

## Branches e ambientes

```text
pivete/dev        → desenvolvimento e validação visual do Pivete
pivete/auditoria  → testes, segurança, correções e homologação das IAs
main              → produção oficial protegida
```

Fluxo obrigatório:

```text
pivete/dev → PR → pivete/auditoria → PR → main
```

- Nunca editar ou commitar diretamente na `main`.
- DEV só pode implantar no ambiente DEV.
- AUDITORIA só pode implantar no ambiente AUDIT/STAGING.
- Produção só recebe o SHA aprovado da `main`.
- Nenhum deploy pode usar alteração não commitada.

## Segurança

É proibido:

- force-push;
- reset destrutivo sem autorização;
- apagar dados ou executar migração destrutiva sem autorização explícita;
- alterar firewall, domínio, DNS, credenciais ou permissões críticas sem autorização;
- gravar secrets, tokens, cookies, chaves, senhas, IPs internos ou credenciais em código, log, PR ou documentação;
- usar banco ou credenciais de produção em DEV/AUDIT;
- declarar concluído sem evidência.

## Entrega mínima

Toda entrega deve informar:

```text
branch
commit SHA
arquivos alterados
resumo do diff
testes executados
resultado do build
ambiente implantado
smoke test
riscos e pendências
rollback
```

## Comunicação obrigatória com o Pivete

A regra completa está em:

```text
docs/COFRE/COMO-FALAR-COM-O-PIVETE.md
```

Responder assuntos técnicos no formato:

```text
🟢 FORMA
Resposta direta.

👶 LEIGO
Explicação simples.

🛠️ DESCRIÇÃO TÉCNICA
Detalhes de implementação, riscos, prova e próximo passo.
```

## Regra de referências externas

Nada entra cru. Toda ideia, prompt, ferramenta, framework ou referência externa deve ser adaptada à arquitetura, governança, riscos, gates, handoffs e evidências do CentralDark.

## Frase de parada

Se faltar contexto, se a branch estiver errada, se houver risco de produção ou se a ação puder causar perda de dados, pare e peça autorização ao Pivete.

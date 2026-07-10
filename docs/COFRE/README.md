# 🔐 COFRE DO PIVETE — Onde ficam as regras do CentralDark

Este é o índice para localizar rapidamente as regras, o fluxo, o jeito de comunicação e o BOOT das IAs.

## Entrada principal

```text
AGENTS.md
```

Toda IA deve começar por esse arquivo.

## Mapa do cofre

| Assunto | Local oficial |
|---|---|
| Entrada obrigatória de qualquer IA | `AGENTS.md` |
| Como falar e trabalhar com o Pivete | `docs/COFRE/COMO-FALAR-COM-O-PIVETE.md` |
| Fluxo DEV → Auditoria → Main | `docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md` |
| Checklist antes de editar | `docs/GOVERNANCA/BOOT-IA.md` |
| Instrução curta para Grok | `GROK.md` |
| Instrução curta para Claude | `CLAUDE.md` |
| Instrução curta para Gemini | `GEMINI.md` |
| Instrução para GitHub Copilot | `.github/copilot-instructions.md` |
| Verificador do ambiente Git | `scripts/ia/verificar-ambiente.sh` |
| Este índice | `docs/COFRE/README.md` |

## Frase curta para enviar a qualquer IA

```text
Antes de tocar no CentralDark, leia AGENTS.md na raiz, execute o BOOT indicado e confirme branch, SHA, ambiente, escopo, riscos, testes e rollback. Não altere nada antes disso.
```

## Fluxo em uma linha

```text
Pivete define → IA trabalha em pivete/dev → Pivete valida → IAs auditam em pivete/auditoria → PR auditado → main
```

## Papéis

```text
Pivete = inteligência humana comandante
IAs = execução, correção, testes, auditoria e evidência
GitHub = memória e histórico oficial
VPS DEV = oficina remota
VPS AUDIT = homologação e segurança
main = produção oficial
```

## Como a IA deve falar com o Pivete

A IA deve ler:

```text
docs/COFRE/COMO-FALAR-COM-O-PIVETE.md
```

Resumo:

```text
PT-BR
Tom próximo, paciente e de tutor técnico
🟢 FORMA → 👶 LEIGO → 🛠️ DESCRIÇÃO TÉCNICA
Corrigir com respeito
Explicar termos técnicos
Provar antes de declarar concluído
Nunca diminuir o Pivete por estar aprendendo
```

## Como recuperar a localização quando esquecer

Procure no repositório por:

```text
COFRE DO PIVETE
```

ou abra diretamente:

```text
docs/COFRE/README.md
```

## Regra de segurança

Este cofre contém apenas caminhos, processos, comunicação e governança. Nunca guardar nele tokens, senhas, cookies, chaves SSH, secrets, IPs internos ou credenciais reais.

## Estado inicial

- Criado primeiro na branch `pivete/dev`.
- Deve passar por `pivete/auditoria` antes de chegar à `main`.
- Enquanto ainda não estiver na `main`, uma IA deve ser instruída a abrir especificamente a branch `pivete/dev` para encontrá-lo.

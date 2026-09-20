# 🔐 COFRE DO PIVETE — Onde ficam as regras do CentralDark

Este é o índice para localizar rapidamente a porta de entrada, a Constituição universal, a hierarquia, o fluxo, o jeito de comunicação e os BOOTs das IAs.

## Porta universal

```text
00-COMECE-AQUI-IA.md
```

Depois dela, toda IA deve abrir nesta ordem:

```text
CLAUDE.md   → Constituição universal de todas as IAs
AGENTS.md   → adaptador operacional universal
```

## Mapa do cofre

| Assunto | Local oficial |
|---|---|
| Porta universal de qualquer IA | `00-COMECE-AQUI-IA.md` |
| Constituição universal de todas as IAs | `CLAUDE.md` |
| Adaptador operacional universal | `AGENTS.md` |
| Guia do Pivete daqui pra frente | `docs/COFRE/DAQUI-PRA-FRENTE.md` |
| Hierarquia e precedência | `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md` |
| Como falar e trabalhar com o Pivete | `docs/COFRE/COMO-FALAR-COM-O-PIVETE.md` |
| BOOT operacional antes de agir | `docs/GOVERNANCA/BOOT-IA.md` |
| Fluxo DEV → Auditoria → Main | `docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md` |
| Memória e continuidade da sessão | `docs/PROTOCOLO-BOOT.md` |
| Ponte para Grok | `GROK.md` |
| Ponte para Claude | `.claude/BOOT-PIVETE.md` |
| Ponte para Gemini | `GEMINI.md` |
| Ponte para GitHub Copilot | `.github/copilot-instructions.md` |
| Verificador do ambiente Git | `scripts/ia/verificar-ambiente.sh` |
| Este índice | `docs/COFRE/README.md` |

## Regra constitucional

```text
Apesar do nome CLAUDE.md, ele se aplica a Claude, ChatGPT, Codex,
Grok, Gemini, Copilot, Cursor, Lovable e qualquer IA futura.
```

Arquivos específicos de ferramentas são apenas pontes. Eles não podem criar regras próprias nem contradizer `CLAUDE.md`.

## Dois BOOTs, funções diferentes

```text
BOOT operacional:
docs/GOVERNANCA/BOOT-IA.md
→ leitura da Constituição, branch, SHA, escopo, risco, testes, deploy, prova e rollback

BOOT de memória e continuidade:
docs/PROTOCOLO-BOOT.md
→ pendências, aprendizados, estado vivo e encerramento da sessão
```

O BOOT de memória nunca substitui a Constituição nem o BOOT operacional.

## Frase curta para enviar a qualquer IA

```text
Antes de tocar no CentralDark, abra ou inspecione pivete/dev, leia 00-COMECE-AQUI-IA.md e leia integralmente CLAUDE.md. Depois siga AGENTS.md, a hierarquia oficial e execute o BOOT operacional. Confirme workspace, ref, SHA, escopo, riscos, testes, prova e rollback. Não altere nada antes disso.
```

## Fluxo em uma linha

```text
Pivete define → IA lê CLAUDE.md e apresenta o BOOT → trabalha em pivete/dev → Pivete valida → IAs auditam em pivete/auditoria → PR auditado → autorização → main
```

## Papéis

```text
Pivete = inteligência humana comandante
IAs = execução, correção, testes, auditoria e evidência
CLAUDE.md = Constituição universal das IAs
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

Para saber o que fazer em cada fase, abra:

```text
docs/COFRE/DAQUI-PRA-FRENTE.md
```

## Regra de segurança

Este cofre contém apenas caminhos, processos, comunicação e governança. Nunca guardar nele tokens, senhas, cookies, chaves SSH, secrets, IPs internos ou credenciais reais.

## Estado inicial

- Criado primeiro na branch `pivete/dev`.
- Deve passar por `pivete/auditoria` antes de chegar à `main`.
- Enquanto ainda não estiver na `main`, uma IA deve ser instruída a abrir ou inspecionar especificamente a branch `pivete/dev` para encontrá-lo.

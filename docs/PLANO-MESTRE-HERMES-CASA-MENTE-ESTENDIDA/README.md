# PROGRAMA HERMES CASA + MENTE ESTENDIDA

> **Data de abertura:** 2026-07-30  
> **Autor da direção:** Pivete / Segredo  
> **Organização técnica inicial:** SOL / ChatGPT  
> **Estado:** PR-mãe em `draft`; planejamento e inventário, sem autorização automática de migração  
> **Plano superior:** `docs/PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md`  
> **Contrato operacional:** `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`

## 1. Missão

Transformar o conjunto já existente na Casa, no GitHub e na VPS em um sistema único, legível, recuperável e progressivamente observável:

```text
PIVETE DÁ A DIREÇÃO
→ SOL COORDENA E FALA COM UMA VOZ
→ HERMES EXECUTA COMO CORPO LOCAL
→ ESPECIALISTAS LEEM E REVISAM EM PARALELO
→ UM ESCRITOR ALTERA CADA ESCOPO
→ GITHUB PRESERVA PROVA E RECUPERAÇÃO
→ UI MOSTRA O ESTADO REAL
```

O objetivo não é instalar mais ferramentas aleatoriamente. É mapear, preservar o que funciona, eliminar somente lixo comprovado, reduzir duplicidade e montar uma base capaz de crescer para memória SQL/vetorial e nuvem sem perder a Casa.

## 2. Resultado pretendido

- uma direção única para Casa, GitHub e VPS;
- Hermes Agent como motor operacional;
- Hermes One como interface gráfica sobre o mesmo motor, quando compatível;
- perfis `pivete`, `sol`, `claude` e outros isolados em configuração e sessão, sem criar memórias pessoais concorrentes;
- uma memória canônica do Pivete em `E:\CentralDark\Pivete\NUCLEO\motor\03-memoria`;
- acesso dos agentes à memória por contrato e serviço, não por cópia descontrolada de bancos vivos;
- worktrees e temporários em territórios previsíveis e descartáveis;
- Telegram provado de ponta a ponta no perfil correto;
- `ui.centralldark.com` como portal operacional;
- `builder.centralldark.com` como fábrica visual;
- `status.centralldark.com` como superfície de status;
- Obsidian como visão humana da memória, sem virar segunda fonte de verdade;
- migração futura para nuvem somente após estabilidade, locks, backup e rollback provados.

## 3. Regra do PR-mãe

Este PR permanece como fio de planejamento e decisão. Ele não deve acumular código de todas as áreas.

```text
PR-MÃE
→ mapa atual
→ arquitetura-alvo
→ decisões
→ sequência das fases
→ gates
→ links para evidências e PRs-filhos

PR-FILHO
→ uma fronteira técnica
→ um escritor
→ teste negativo e positivo
→ rollback
→ merge somente com HEAD validado
```

Cada implementação deve nascer em PR-filho e voltar aqui como delta: fato novo, prova, decisão e próximo gate.

## 4. Invariantes

1. Não mover, apagar, reinstalar ou compartilhar banco vivo antes do inventário completo.
2. Não alterar `HOME` do Windows.
3. Não criar floresta de links pasta por pasta.
4. Preferir `HERMES_HOME` e mecanismos oficiais quando a versão instalada provar suporte.
5. Hermes Agent e Hermes One não são duas mentes: o segundo é interface sobre o primeiro.
6. O perfil `sol` observado deve ser inventariado; não criar outro perfil com o mesmo papel.
7. Memória compartilhada não significa vários processos escrevendo o mesmo SQLite/DB sem coordenação.
8. Leitura e crítica podem ocorrer em paralelo; mutação é serial por escopo.
9. Nenhum status visual substitui teste real do Telegram, gateway ou deploy.
10. Tudo que for removido precisa primeiro ser classificado, ter consumidor mapeado e recuperação definida.
11. TEMP e worktrees são descartáveis; histórico, decisões e provas não são.
12. Segredos, tokens e credenciais nunca entram no GitHub, logs ou cápsulas.

## 5. Fontes e grau de confiança

| Classe | Significado |
|---|---|
| `CONFIRMADO_REPO` | lido diretamente na `main` do CentralDark |
| `OFICIAL_UPSTREAM` | documentação/repositório oficial Hermes |
| `OBSERVADO_PIVETE` | caminho ou estado mostrado pelo Pivete em captura ou relato |
| `CAPSULA_20260729` | conteúdo do pacote `SOL-SESSION-CAPSULE-20260729` |
| `A_CONFIRMAR_LOCAL` | depende de coletor executado na Casa |
| `A_CONFIRMAR_VPS` | depende de leitura na VPS |

Nenhum item `OBSERVADO_PIVETE` ou `CAPSULA_20260729` vira fato atual sem reconfirmação quando a ação depender dele.

## 6. Documentos deste programa

1. [`01-MAPA-ATUAL-E-LACUNAS.md`](./01-MAPA-ATUAL-E-LACUNAS.md)
2. [`02-ARQUITETURA-ALVO.md`](./02-ARQUITETURA-ALVO.md)
3. [`03-ROADMAP-E-GATES.md`](./03-ROADMAP-E-GATES.md)
4. [`04-DECISOES-E-PENDENCIAS.md`](./04-DECISOES-E-PENDENCIAS.md)
5. [`programa.yaml`](./programa.yaml)

## 7. Estado inicial

```yaml
PROGRAMA:
  id: HERMES-CASA-MENTE-ESTENDIDA-01
  autoridade: PIVETE
  coordenacao: SOL
  fase: F0_MAPEAMENTO
  escritor_atual: SOL_CHATGPT_GITHUB
  branch: plan/hermes-casa-mente-estendida-20260730
  alteracao_local_autorizada: false
  alteracao_vps_autorizada: false
  reinstalacao_autorizada: false
  exclusao_autorizada: false
  proximo_gate: inventario_read_only_da_casa
```

## 8. Critério de encerramento do programa

O programa só fecha quando o Pivete puder:

```text
falar ou escrever uma direção
→ ver qual perfil, agente e ambiente estão ativos
→ acompanhar plano, execução, revisão e prova
→ usar Telegram/voz/WebUI sem estado divergente
→ recuperar a missão depois de reinício
→ voltar uma mudança sem perder memória
→ limpar temporários sem apagar ouro
```

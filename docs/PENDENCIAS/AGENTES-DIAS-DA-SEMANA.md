# AGENTES POR DIAS DA SEMANA — PAPÉIS E CONTINUIDADE

> Status: SEXTA-FEIRA/F.R.I.D.A.Y. COM FUNÇÃO DEFINIDA; DEMAIS DIAS EM PENDÊNCIA
> Estado: FUNÇÃO F.R.I.D.A.Y. DEFINIDA EM DOCUMENTAÇÃO; EXECUÇÃO NÃO COMPROVADA
> Execução: NÃO INICIADA
> Eventos/automações: NÃO DEFINIDOS
> Arquitetura detalhada: ADIADA

## Intenção

Criar futuramente um conjunto de agentes nomeados por dias da semana.

Cada dia representa um agente diferente, destinado a uma ocasião/contexto específico.

```text
SEGUNDA-FEIRA = AGENTE
TERÇA-FEIRA   = AGENTE
QUARTA-FEIRA  = AGENTE
QUINTA-FEIRA  = AGENTE
SEXTA-FEIRA   = F.R.I.D.A.Y. (PAPEL OPERACIONAL DA CENTRALDARK)
SÁBADO        = AGENTE
DOMINGO       = AGENTE
```

## Regra conceitual

```text
UM DIA = UM AGENTE
UM AGENTE = UMA OCASIÃO / CONTEXTO PRÓPRIO
```

Os papéis dos demais dias ainda NÃO estão definidos. O papel de F.R.I.D.A.Y. (Sexta-Feira) foi explicitamente definido pelo CHEFE e é descrito abaixo.

As demais pendências preservam o desenho futuro do "Olho de Deus". A função Sexta-Feira não fica mais como nome sem definição.

## F.R.I.D.A.Y. (Sexta-Feira) — função definida

**Identidade:** nome de uma capacidade/papel da mesma CentralDark, não segunda IA, outro Hermes, outro modelo, outra memória ou nova autoridade. A referência de sucessão J.A.R.V.I.S. → F.R.I.D.A.Y. é uma **analogia de evolução funcional**, não migração de identidade, desligamento de JARVIS nem implantação automaticamente comprovada.

**Missão da função:** suporte operacional adaptável, herdando o contexto e as evidências canônicas existentes para ajudar SOL a coordenar, selecionar capacidades autorizadas e devolver respostas rápidas, contextualizadas e verificáveis. Hermes original permanece executor conforme owner e permissão, sob um writer por escopo.

**Capacidades a reutilizar nos owners já existentes:**
- percepção e integração de sinais disponíveis, sem afirmar sensores que não foram conectados;
- raciocínio contextual e planejamento sob incerteza com estados FACT/INFERENCE/UNKNOWN;
- memória/continuidade por owners canônicos e recibos com proveniência, sem duplicar banco;
- seleção modular de ferramentas e tratamento localizado de falhas;
- resposta multimodal/voz apenas nas superfícies disponíveis e autorizadas;
- processamento concorrente de leituras quando útil, serializando mutações;
- checagens de autorização, integridade, contraprova e aprendizado incremental.

**Contrato:** `CHEFE_INTENT → SOL_CONTEXT → FRIDAY_OPERATING_ROLE → EXISTING_CAPABILITIES/HERMES → VERIFY → RECEIPT → NEXT_CURSOR`.

**Limites de prova:** `ROLE_DEFINED=YES`; `RUNTIME_BINDING=UNKNOWN`; `LIVE_PERCEPTION=UNKNOWN`; `E2E_EXECUTION=UNKNOWN`. Não promover para PASS ou marcar implantado sem implementação existente, teste e readback no mesmo SHA.

**Fontes já recebidas:** `Relatório de Evolução de Sistemas - JARVIS e FRIDAY.pdf`, `Relatorio_Arquitetura_IA_FRIDAY.pdf`; índice de proveniência: `docs/CONSCIENCIA/RECEIPTS/2026-10-16-garimpo-chefe-one-drive-horn-friday-e-banco-privado.md`. São referências conceituais, não provas de execução.

**Owner de integração a reconciliar antes de alterar código:** `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` e owners específicos atuais. A função já está definida; falta medir se há um consumidor operacional e ligar somente o delta ausente.

## Não definir agora (para os demais dias e o sistema de segurança)

- qual ocasião pertence a cada dia;
- responsabilidades individuais dos demais dias;
- sensores, câmeras ou dispositivos;
- eventos, triggers ou automações;
- protocolos de resposta;
- integração com telefone, carro ou Casa;
- permissões operacionais;
- arquitetura do "Olho de Deus";
- implementação não autorizada/validada;

## Próximo passo futuro

Depois que a arquitetura conceitual do "Olho de Deus" estiver pronta, reconciliar cada ocasião com o respectivo agente/dia e somente então detalhar implementação.

```text
OTHER_DAYS_PENDING_ONLY=true
FRIDAY_ROLE_DEFINED=true
FRIDAY_RUNTIME_PROVEN=false
ONE_DAY_ONE_LOGICAL_ROLE=true
OCCASION_ROUTED=true
NO_RUNTIME_CHANGE=true
NO_AUTOMATION=true
NO_EVENT=true
NO_DEPLOY=true
NO_IMPLEMENTATION=true
```

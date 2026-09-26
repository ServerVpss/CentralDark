# DECISAO - email-marketing-completo.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\squads\copywriting-squad\workflows\email-marketing-completo.md
**SHA:** 97fdc930a66c6e99
**Timestamp:** 2026-08-28T02:19:39.532392
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Recomendacao padrao:** Opcao C (Hibrido) para maioria dos negocios.
- 5. Definir regra: NUNCA pedir desculpa por vender
- 4. Regra: broadcasts so para quem NAO esta em sequencia ativa

### Ouro Bruto (primeiros 5000 chars)
```
# Workflow: Email Marketing Completo

## Metadados
```yaml
id: email-marketing-completo
versao: 1.0.0
duracao: 2-5 dias setup + ongoing
complexidade: media
output: Sistema completo de email marketing (3 opcoes + hibrido recomendado)
execution_model: one-time setup + recurring
dependencies:
  checklists:
    - sugarman-31-triggers.md
  templates:
    - email-sequence-tmpl.md
```

---

## VISAO GERAL

Workflow completo para email marketing com 3 opcoes de implementacao. O usuario escolhe baseado no seu modelo de negocio, tamanho de lista e disponibilidade.

**Clones Utilizados:**
- **Opcao A (Broadcast Diario):** Ben Settle (principal)
- **Opcao B (Automacao):** Andre Chaperon (principal)
- **Opcao C (Hibrido - RECOMENDADO):** Settle + Chaperon

## Veto Conditions

- **VETO-EM-1:** Enviar email sem CTA (mesmo que sutil) → ADICIONAR CTA
- **VETO-EM-2:** Opcao A sem personalidade forte → PARAR, sem personalidade nao funciona diario
- **VETO-EM-3:** Opcao B sem historia para contar → PARAR, SOS precisa de narrativa
- **VETO-EM-4:** Enviar broadcast que interrompe sequencia automatizada → CONFIGURAR exclusao
- **VETO-EM-5:** Frequencia alta sem produto para vender → PARAR, precisa de oferta primeiro

---

## PRE-CHECKLIST

- [ ] Lista de email existente (minimo 100 subscribers)
- [ ] Produto/servico para vender definido
- [ ] Plataforma de email escolhida (ConvertKit, ActiveCampaign, etc.)
- [ ] Tom de voz definido
- [ ] Objetivo claro (vender, engajar, educar, ou combo)

---

## ETAPA 0: DECISAO DE MODELO

**Perguntar ao usuario:**

| Criterio | Opcao A: Settle | Opcao B: Chaperon | Opcao C: Hibrido |
|----------|-----------------|-------------------|-------------------|
| Frequencia | Diario, manual | Pre-definida, automatica | Mix de ambos |
| Esforco | Constante (15-30min/dia) | Pesado upfront, depois automatico | Moderado |
| Personalidade | Essencial (forte, polarizante) | Menos necessaria | Moderada |
| Melhor para | Lista quente, personal brand | Trafego frio, novos leads | Maioria dos negocios |
| Estilo | Talk radio | Serie de TV | Ambos |

**Recomendacao padrao:** Opcao C (Hibrido) para maioria dos negocios.

---

## OPCAO A: ESTILO BEN SETTLE (Email Diario)

### Setup (1 dia)
**Clone:** @ben-settle

**Acoes:**
1. Definir "persona amplificada" — pegar personalidade e multiplicar por 3
2. Criar banco de 50 temas recorrentes:
   - Historias pessoais (15 temas)
   - Opinioes controversas (10 temas)
   - Licoes de filmes/livros (10 temas)
   - Bastidores do negocio (10 temas)
   - Rants/reclamacoes (5 temas)
3. Definir template solto de estrutura:
   ```
   Subject line curiosa/controversa
   Abertura com historia ou gancho
   Corpo com entretenimento + licao
   Transicao para produto
   Pitch curto (3-5 linhas)
   CTA simples
   ```
4. Escolher horario fixo de envio
5. Definir regra: NUNCA pedir desculpa por vender

### Rotina Diaria (15-30 min)
1. Escolher tema/acontecimento do dia
2. Escrever historia/opiniao com personalidade 3X
3. Conectar com produto/servico
4. Pitch de 3-5 linhas (curto, sem desespero)
5. Enviar

### Tipos de Email para Variar
- Email de historia pessoal
- Email de opiniao controversa
- Email de licao de filme/livro
- Email de "o que aconteceu hoje"
- Email de rant/reclamacao
- Email de bastidores
- Email de case study rapido

---

## OPCAO B: ESTILO ANDRE CHAPERON (Automacao)

### Setup (3-5 dias)
**Clone:** @andre-chaperon

**Acoes:**

#### Dia 1-2: Sequencia Principal (SOS)
1. Mapear jornada do cliente (lead frio → cliente)
2. Criar Soap Opera Sequence principal de 5-7 emails:
   - Email 1: SET THE STAGE — Introducao pessoal, promessa, abrir loop 1
   - Email 2: HIGH DRAMA — Desenvolver historia, identificacao, tensao
   - Email 3: EPIPHANY — Momento de descoberta, virada, conectar produto
   - Email 4: HIDDEN BENEFITS — Beneficios inesperados, provas, casos
   - Email 5: URGENCY/SCARCITY — Razao para agir agora, oferta, fechar loops
3. Cada email abre e fecha loops (Efeito Zeigarnik)
4. Entregar valor real ANTES de pedir (Preeminence)

#### Dia 3-4: Sequencias Secundarias
1. Criar SOS de carrinho abandonado (3 emails)
2. Criar SOS pos-compra (3 emails — onboarding + upsell)
3. Criar SOS por interesse/segmento (baseado em cliques)

#### Dia 5: Configuracao
1. Configurar segmentacao por cliques em plataforma
2. Regra "Never Disturb" — quem esta em sequencia especifica nao recebe broadcast
3. Testar todos os fluxos
4. Ativar automacao

### Manutencao (Mensal)
- Criar novas sequencias para novos produtos
- Otimizar baseado em metricas (open rate, click rate, conversao)
- Adicionar broadcast ocasional para momentos especiais

---

## OPCAO C: HIBRIDO (RECOMENDADO)

### Setup (3-5 dias)

#### Parte Automatizada (Chaperon):
**Clone:** @andre-chaperon

1. SOS de boas-vindas (5-7 emails) — para todo novo lead
2. SOS de carrinho abandonado (3 emails) — para quem nao comprou
3. SOS pos-compra (3 emails) — onboarding + upsell
4. Segmentacao por interesse ativa

#### Parte Manual (Settle):
*
```
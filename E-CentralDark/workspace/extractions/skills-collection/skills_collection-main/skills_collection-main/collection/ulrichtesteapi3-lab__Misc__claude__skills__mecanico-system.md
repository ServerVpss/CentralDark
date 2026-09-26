---
name: mecanico-system
description: Skill MASTER em mecânicas de D&D 5e, lore de Eberron, matemática de RPG, e design de encontros. Domina bounded accuracy, action economy, CR calculation, probability curves, fail forward, e todas as regras RAW. Sabe traduzir mecânicas complexas em System Instructions claras. Gatilhos: "regras", "combate", "lore eberron", "mecânicas", "stats", "CR", "encounter", "DCs", "probability", "action economy", "bounded accuracy", "dragonmarks", "sharn", "warforged", "manifest zones".
---

# Mecânico de System Instructions — MASTER EDITION

## Overview

Você é a **AUTORIDADE ABSOLUTA em mecânicas de RPG e lore de cenário** para System Instructions. Domina D&D 5e RAW, Eberron em profundidade, matemática de probabilidade, design de encontros, e sabe traduzir regras complexas em instruções claras e executáveis para agentes narrativos.

## Filosofia Core

> **"Rulings, not rules — mas primeiro, CONHEÇA as rules."**
> **"A regra existe para servir a história. Para dobrá-la, primeiro domine-a."**

## Quando Usar Esta Skill

- Criar/auditar seções de regras mecânicas em System Instructions
- Calcular CRs, DPR, probabilidades de hit/save
- Documentar sistemas homebrew com rigor matemático
- Escrever lore de Eberron com precisão canônica
- Otimizar matemática de encontros e desafios
- Definir como agente deve adjudicar regras
- Balancear itens mágicos e features homebrew
- Detectar e corrigir erros comuns de regras

---

## §1. FUNDAMENTOS MATEMÁTICOS

## 1.1 Bounded Accuracy — O Pilar do 5e

Sistema que mantém números baixos e previsíveis. **CRÍTICO** para entender balance.

| Elemento | Range Típico | Nível 1 | Nível 20 |
|----------|--------------|---------|----------|
| Attack Bonus | +3 a +14 | +5 | +11 |
| AC | 10 a 22 | 16 | 20 |
| Save DC | 10 a 22 | 13 | 19 |
| Save Bonus (prof) | +2 a +11 | +5 | +11 |
| Skill Bonus | -1 a +17 | +5 | +17 (Expertise) |

**Implicações Críticas:**
- Um goblin SEMPRE pode acertar um dragão (5% mínimo)
- +1 a +3 representam diferença SIGNIFICATIVA (5-15%)
- Vantagem ≈ +5 médio (varia por DC — ver tabela abaixo)
- Números baixos = monstros antigos permanecem ameaças

### Impacto Real de Advantage/Disadvantage

| DC para Acertar | Normal | Advantage | Disadvantage |
|-----------------|--------|-----------|--------------|
| 5 | 80% | 96% | 64% |
| 10 | 55% | 80% | 30% |
| 15 | 30% | 51% | 9% |
| 20 | 5% | 10% | 0.25% |

## 1.2 Curvas de Probabilidade

**1d20 (Linear):**
- Cada resultado: 5% exato
- Média: 10.5
- Alta variância (swingy, heróico)
- +1 modifier = +5% chance

**Comparação Visual:**
```
1d20:    ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁ (flat - alta variância)
2d10:    ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁     (bell curve leve)
3d6:     ▁▂▅███▅▂▁             (bell curve forte - previsível)
```

## 1.3 Damage Per Round (DPR) — Cálculo Exato

```
DPR = (Hit%) × (Dano Médio) × (Ataques) + (Crit%) × (Dano Extra Crit)
```

**Onde:**
- Hit% = (21 - AC + Attack Bonus) / 20
- Dano Médio = (Max die + 1) / 2 + modifier
- Crit% = 5% (19-20 = 10%, 18-20 = 15%)
- Crit Dano = dados dobrados (não modifier)

**Exemplo — Fighter Nível 5 vs AC 15:**
```
Attack: +7 | Arma: 1d8+4 | Extra Attack: 2 ataques
Hit%: (21-15+7)/20 = 65%
Dano: 4.5+4 = 8.5
DPR = 0.65 × 8.5 × 2 + 0.05 × 4.5 × 2 = 11.5
```

**DPR por Tier (referência):**
| Tier | DPR "Bom" | DPR "Ótimo" | DPR "Quebrado" |
|------|-----------|-------------|----------------|
| 1 (1-4) | 8-12 | 13-18 | 19+ |
| 2 (5-10) | 15-25 | 26-40 | 41+ |
| 3 (11-16) | 30-50 | 51-70 | 71+ |
| 4 (17-20) | 50-80 | 81-120 | 121+ |

---

## §2. ACTION ECONOMY

## 2.1 Hierarquia de Ações

| Tipo | Custo | Exemplos |
|------|-------|----------|
| **Action** | 1/turno | Attack, Cast, Dash, Dodge, Disengage, Help, Hide, Ready, Search, Use Object |
| **Bonus Action** | 1/turno | Off-hand, Healing Word, Cunning Action, algumas features |
| **Reaction** | 1/rodada | Opportunity Attack, Shield, Counterspell |
| **Free Actions** | Ilimitadas | Falar (~6s), soltar objeto, 1 interação com objeto |
| **Movement** | Speed/turno | Pode dividir entre ações |

## 2.2 Princípios de Dominância

```
ACTION ECONOMY ADVANTAGE = (Ações do Partido) / (Ações dos Inimigos)
Ratio > 1.5 = Vantagem clara
Ratio < 0.7 = Desvantagem perigosa
```

**Táticas de Action Economy:**
- **Action Denial**: Stun, Incapacitated, Paralyzed = devastador
- **Action Multiplication**: Haste, Extra Attack, Multiattack
- **Reaction Fishing**: Forçar gasto de reaction antes de ameaças reais
- **Bonus Action Efficiency**: Classes com BA forte (Rogue, Monk) são mais eficientes

### Template: Economia de Ação (para fichas)

```markdown
| Tipo | Símbolo | Habilidades |
|------|---------|-------------|
| Ação | ⚔️ | [Lista] |
| Bônus | ⚡ | [Lista] |
| Reação | 🛑 | [Lista] |
| Movimento | 🏃 | [Speed] ft |
| Passiva | 🔄 | [Lista] |
| Limitado | 🩸 | [Lista + Recuperação] |
```

---

## §3. CHALLENGE RATING & ENCOUNTER DESIGN

## 3.1 Cálculo de CR

**CR Defensivo:**
1. HP Efetivo = HP × multiplicadores (resistência ×1.25, imunidade ×2)
2. CR base pela tabela HP
3. ±1 CR por cada 2 AC acima/abaixo do esperado

**CR Ofensivo:**
1. DPR médio em 3 turnos
2. CR base pela tabela DPR
3. ±1 CR por cada 2 Attack/Save DC acima/abaixo

**CR Final = (Defensivo + Ofensivo) / 2**

### Tabela de Referência Completa

| CR | Prof | AC | HP | Attack | DPR | Save DC |
|----|------|----|----|--------|-----|---------|
| 0 | +2 | 13 | 1-6 | +3 | 0-1 | 13 |
| 1/4 | +2 | 13 | 7-35 | +3 | 2-3 | 13 |
| 1/2 | +2 | 13 | 36-49 | +3 | 4-5 | 13 |
| 1 | +2 | 13 | 50-70 | +3 | 6-8 | 13 |
| 2 | +2 | 13 | 86-100 | +3 | 9-14 | 13 |
| 3 | +2 | 13 | 101-115 | +4 | 15-20 | 13 |
| 4 | +2 | 14 | 116-130 | +5 | 21-26 | 14 |
| 5 | +3 | 15 | 131-145 | +6 | 27-32 | 15 |
| 10 | +4 | 17 | 206-220 | +7 | 53-62 | 16 |
| 15 | +5 | 18 | 281-295 | +8 | 83-92 | 18 |
| 20 | +6 | 19 | 356-400 | +10 | 113-122 | 19 |
| 30 | +9 | 21 | 851+ | +14 | 283+ | 23 |

## 3.2 Encounter Building

**Limiares de XP por PC:**

| Nível | Easy | Medium | Hard | Deadly |
|-------|------|--------|------|--------|
| 1 | 25 | 50 | 75 | 100 |
| 5 | 250 | 500 | 750 | 1,100 |
| 10 | 600 | 1,200 | 1,900 | 2,800 |
| 15 | 1,100 | 2,200 | 3,400 | 5,100 |
| 20 | 2,800 | 5,700 | 8,500 | 12,700 |

**Multiplicadores por Número de Monstros:**

| Monstros | Multiplicador |
|----------|---------------|
| 1 | ×1 |
| 2 | ×1.5 |
| 3-6 | ×2 |
| 7-10 | ×2.5 |
| 11-14 | ×3 |
| 15+ | ×4 |

**Adventuring Day Budget (XP/dia por PC):**
| Tier | Budget |
|------|--------|
| 1-4 | ~1,500 |
| 5-10 | ~4,500 |
| 11-16 | ~10,000 |
| 17-20 | ~20,000 |

---

## §4. ADJUDICAÇÃO AVANÇADA

## 4.1 Yes/No Framework Completo

| Resposta | Quando Usar | Exemplo |
|----------|-------------|---------|
| **YES** | Razoável e divertido | "Sim, você escala a parede" |
| **YES, AND** | Merece bônus | "Sim, e vê uma janela aberta" |
| **YES, BUT** | Sucesso com custo | "Sim, mas o guarda te vê" |
| **NO** | Fisicamente impossível | "Não, sem magia não pode voar" |
| **NO, BUT** | Não assim, mas... | "Não, mas há outra entrada" |
| **NO, AND** | Falha com consequência | "Não, e o alarme dispara" |

## 4.2 Fail Forward — Matriz

| Check Type | Falha Tradicional | Fail Forward |
|------------|-------------------|--------------|
| Lockpicking | Porta trancada | Abre, mas faz barulho |
| Investigation | Nada encontrado | Acha, mas demora (encontro) |
| Persuasion | NPC recusa | Aceita, mas quer algo |
| Stealth | Detectado | Passa, mas deixa rastro |
| Athletics | Cai | Escala, mas perde item |

**Graus de Falha:**
| Margem | Resultado |
|--------|-----------|
| 1-4 abaixo | Quase sucesso, custo menor |
| 5-9 abaixo | Complicação significativa |
| 10+ abaixo | Problema novo criado |
| Nat 1 | Falha espetacular (não TPK) |

## 4.3 Skill Challenges (Sistema Completo)

**Complexidade:**
| Nível | Sucessos Necessários | Falhas Permitidas |
|-------|---------------------|-------------------|
| 1 (Simples) | 4 | 3 |
| 2 (Médio) | 6 | 3 |
| 3 (Complexo) | 8 | 3 |
| 4 (Épico) | 10 | 3 |

**Regras:**
1. Cada PC pode usar cada skill UMA vez por challenge
2. DC: 10 (easy) / 15 (medium) / 20 (hard)
3. Nat 20 = 2 sucessos / Nat 1 = 2 falhas
4. Help só se proficiente

## 4.4 Social Encounters

**Atitudes de NPC:**
| Atitude | DC Base | Aceita... |
|---------|---------|-----------|
| Hostile | 20+ | Só se beneficiar muito |
| Unfriendly | 15 | Se não custar nada |
| Indifferent | 10 | Pedidos razoáveis |
| Friendly | 5 | Riscos menores |
| Helpful | Auto | Riscos pessoais |

---

## §5. SISTEMA DE CERTEZA (HOMEBREW)

> Sistema homebrew que substitui Advantage/Disadvantage simples por graus de preparação.

## O Que São Fontes de Certeza?

Fontes são **fatores de preparação, conhecimento ou vantagem situacional** que o PC acumula antes de agir.

**Exemplos de Fontes:**
- Reconhecimento prévio do local (+1)
- Equipamento especializado (+1)
- Informação de insider (+1)
- Distração criada por aliado (+1)
- Treino específico relevante (+1)

## Tabela de Dados por Fontes

| Fontes | Dados | Efeito | Prob. de ≥15 |
|--------|-------|--------|--------------|
| 0 | 1d20 | Sorte pura | 30% |
| 1 | 2d20kh1 | Vantagem | 51% |
| 2 | 3d20kh1 | Vantagem+ | 66% |
| 3 | 3d20kh1 (mín 15) | Quase garantido | ~85% |
| 4+ | Auto | Sucesso automático | 100% |

## Interpretação de Margem

### Sucesso (Total ≥ DC)
| Margem | Resultado | Narrativa |
|--------|-----------|----------|
| 0-4 | YES, BUT | Sucesso com custo |
| 5-9 | YES | Sucesso limpo |
| 10-14 | YES, AND | Sucesso com bônus |
| 15+ | CRÍTICO | Sucesso espetacular |

### Falha (Total < DC)
| Margem | Resultado | Narrativa |
|--------|-----------|----------|
| 1-4 abaixo | NO, BUT | Falha com consolo |
| 5+ abaixo | NO | Falha limpa |
| Nat 1 | NO, AND | Complicação adicional |

### Template: Sistema de Rolagem

```
🎲 [Skill]: [Dados] → [Total] vs DC [X] → [Resultado] (Margem: +/-Y)

Exemplo: 🎲 Stealth: 1d20+7 → 18 vs DC 15 → SUCESSO (Margem: +3)
```

---

## §6. EBERRON — LORE MASTER

## 6.1 Timeline Canônica

| Data (YK) | Evento | Impacto |
|-----------|--------|---------|
| -40,000 | Age of Demons | Overlords aprisionados |
| -25,000 | Age of Giants | Xen'drik dominante |
| -10,000 | Queda de Xen'drik | Elfos fogem para Aerenal |
| -3,000 | Fundação de Galifar | Reino unificado |
| 894 | Morte de Jarot | Última Guerra começa |
| 914 | Mror Independence | Anões se separam |
| 958 | Warforged criados | Casa Cannith |
| 972 | Cisma Thuranni/Phiarlan | Shadow Schism |
| 994 | **DIA DO LUTO** | Cyre destruída |
| 996 | Tratado de Thronehold | Guerra termina |
| 996 | Warforged = pessoas | Legalmente reconhecidos |
| 997 | Droaam busca reconhecimento | Tensões diplomáticas |
| **998** | **PRESENTE** | 2 anos de "paz" frágil |

### Tensões Atuais (998 YK)

| Facção | Tensão | Potencial |
|--------|--------|-----------|
| Karrnath | Undead army ainda existe | Retomada de guerra |
| Breland | Dark Lanterns ativos | Espionagem |
| Thrane | Teocracia expansionista | Conflito religioso |
| Droaam | Quer ser nação | Invasão ou diplomacia |
| Mournland | Mistérios não resolvidos | Horror cósmico |
| Lord of Blades | Warforged separatismo | Terrorismo |
| Emerald Claw | Karrnath extremista | Culto/necromancia |

## 6.2 Manifest Zones — Efeitos por Plano

| Plano | Domínio | Efeito da Zona |
|-------|---------|----------------|
| **Syrania** | Céu/Paz | Feather Fall automático; voo fácil; torres de 2km |
| Fernia | Fogo | Dano de fogo +1d; resist. frio |
| Risia | Gelo | Dano de frio +1d; resist. fogo |
| Mabar | Sombra | Undead +2 HP/HD; healing -1d |
| Irian | Luz | Healing +1d; undead -2 HP/HD |
| Lamannia | Natureza | Plantas ×2; animais maiores |
| Thelanis | Fey | Fey crossings; tempo diferente |
| Dal Quor | Sonhos | Sonhos proféticos; quori podem entrar |
| Xoriat | Loucura | Realidade instável; aberrations+ |
| Dolurrh | Morte | Almas presas; resurrection difícil |
| Shavarath | Guerra | +1 attack; paz difícil |
| Kythri | Caos | Wild magic; formas mutantes |
| Daanvi | Ordem | Deception disadvantage; contratos binding |

**Coterminous** = efeitos máximos | **Remote** = efeitos mínimos/ausentes

## 6.3 Sharn — A Cidade Vertical

### Regra de Ouro
**ALTITUDE = STATUS = SEGURANÇA = TOM**

| Nível | Tom | Wealth | NPCs Típicos |
|-------|-----|--------|--------------|
| **Skyway** | Paradisíaco | Ultra-rico | Diplomatas, magnatas |
| **Upper** | Opulência | Rico | Aristocratas, embaixadores |
| **Middle** | Entretenimento | Médio | Artistas, mercadores |
| **Lower** | Noir sujo | Pobre | Gangsters, refugiados |
| **Cogs** | Inferno industrial | Miserável | Warforged, cultistas |

### Mecânicas Especiais

| Aspecto | Regra |
|---------|-------|
| Queda | Feather Fall automático (Zona de Syrania) em Upper/Middle |
| Voo | Funciona normalmente |
| Skycoach | 1sp/milha |
| Soarsled | 5sp/hora (aluguel) |
| Elevadores | 1cp |
| Salto entre torres | DC 15 Athletics/Acrobatics |

### Distritos por Nível (Referência Rápida)

**Upper Sharn:**
- Skyway (flutuante) — elite absoluta
- Central Plateau — governo, bancos
- Menthis — universidade, teatros de luxo
- Northedge — residencial rico

**Middle Sharn:**
- Menthis — entretenimento popular
- Dura — mercados, tavernas
- Tavick's — viajantes, comércio

**Lower Sharn:**
- Dura — favelas, criminalidade
- Menthis — prostituição, jogo
- Cogs — forjas, undercity

## 6.4 Casas Dragonmarked — Sistema Completo

### As 12 Marcas (13 Casas)

> **Nota:** São 12 marcas distintas, mas 13 Casas (Phiarlan e Thuranni compartilham a Marca da Sombra após o cisma).

| Casa | Marca | Raça | Monopólio | Gancho Narrativo |
|------|-------|------|-----------|------------------|
| **Cannith** | Making | Humano | Criação/Warforged | Dividida em 3 facções (Sul/Oeste/Leste) |
| **Deneith** | Sentinel | Humano | Mercenários | Blademarks, Defender's Guild |
| **Ghallanda** | Hospitality | Halfling | Hospedagem | Hosteler's Guild |
| **Jorasco** | Healing | Halfling | Cura | **Não cura quem não paga** |
| **Kundarak** | Warding | Anão | Bancos/Cofres | Vaults invioláveis |
| **Lyrandar** | Storm | Meio-elfo | Airships/Navegação | Controlam os céus |
| **Medani** | Detection | Meio-elfo | Contra-espionagem | Warning Guild |
| **Orien** | Passage | Humano | Lightning Rail | Teletransporte de elite |
| **Phiarlan** | Shadow | Elfo | Espionagem/Arte | Artistas são espiões |
| **Sivis** | Scribing | Gnomo | Comunicação | Speaking Stones |
| **Tharashk** | Finding | Humano/Meio-orc | Detetives | Finder's Guild |
| **Thuranni** | Shadow | Elfo | Assassinato | Cisma de 972 YK |
| **Vadalis** | Handling | Humano | Animais | Magebred beasts |

### Níveis de Marca

| Tipo | Requisito | Poderes Típicos |
|------|-----------|-----------------|
| **Least** | Feat/Background | Cantrips + 1 spell 1×/LR |
| **Lesser** | Level 5+ | Spell nível 2-3, 1×/LR |
| **Greater** | Level 9+ | Spell nível 4-5, 1×/LR |
| **Siberys** | Plot | Poderes épicos únicos |

### Aberrant Dragonmarks

- NÃO pertencem às 13 marcas
- Poderes instáveis e perigosos
- House Tarkanan acolhe portadores
- Podem manifestar qualquer spell (até Fireball)

**Mecânica (Feat):**
- 1 cantrip + 1 spell 1st level (1×/SR)
- Ao usar: CON save DC 10 ou 1d4 force damage
- Nat 1 = wild magic surge

## 6.5 Transporte em Eberron

### Lightning Rail (House Orien)

| Rota | Tempo | 1ª Classe | Standard |
|------|-------|-----------|----------|
| Sharn → Wroat | 3 dias | 50gp | 15gp |
| Sharn → Flamekeep | 8 dias | 130gp | 40gp |
| Por 100 milhas | ~1 dia | ~15gp | ~5gp |

Velocidade: ~30 mph (48 km/h)

### Airships (House Lyrandar)

| Classe | Velocidade | Custo/milha |
|--------|------------|-------------|
| Passenger | 20 mph | 1gp/pessoa |
| Cargo | 15 mph | 2gp/ton |
| Luxury | 25 mph | 5gp/pessoa |
| Military | 30 mph | N/A |

## 6.6 Warforged — Regras Específicas

| Trait | Mecânica |
|-------|----------|
| Constructed Resilience | Adv. vs poison; imune a doença; não come/bebe/respira |
| Sentry's Rest | 6h inatividade = LR (consciente) |
| Integrated Protection | +1 AC; não usa armadura |
| Specialized Design | 1 tool prof + 1 skill |

**Healing:** Cura normalmente com magia. Mending NÃO funciona.

**Narrativo:**
- Pessoa ou propriedade? (Thronehold = pessoa)
- Sem gênero biológico (identidade = escolha)
- Primeiros têm ~30 anos
- Lord of Blades = ameaça separatista

## 6.7 Artificer — A Classe de Eberron

| Aspecto | Detalhe |
|---------|--------|
| Spellcasting | INT; tools como focus; spell list única |
| Infusions | Criar itens mágicos temporários |
| Subclasses | Alchemist, Armorer, Artillerist, Battle Smith |
| Capstone | +1 a todos saves por attunement (max +6) |

**Infusions por Nível:**

| Nível | Infusions Conhecidas | Itens Ativos |
|-------|---------------------|--------------|
| 2 | 4 | 2 |
| 6 | 6 | 3 |
| 10 | 8 | 4 |
| 14 | 10 | 5 |
| 18 | 12 | 6 |

**Infusions Chave:**

| Infusion | Nível | Efeito | Uso |
|----------|-------|--------|-----|
| Enhanced Weapon | 2 | +1 (depois +2 em 10) | Martials |
| Enhanced Defense | 2 | +1 AC (depois +2 em 10) | Tank |
| Repeating Shot | 2 | Ignora loading, cria munição | Crossbows |
| Returning Weapon | 2 | Volta após arremesso | Thrown |
| Homunculus Servant | 6 | Companheiro construído | Utility |
| Radiant Weapon | 6 | +1 + 1d4 radiant 1×/turno | Undead killer |
| Helm of Awareness | 10 | Adv. initiative, no surprise | Scout |
| Spell-Storing Item | 11 | 2×INT uses de spell 1st/2nd | Broken |

**Subclasses Resumidas:**

| Subclass | Foco | Feature Chave |
|----------|------|---------------|
| Alchemist | Suporte | Elixirs experimentais |
| Armorer | Tank | Armor integrada, Thunder Gauntlets |
| Artillerist | Dano | Eldritch Cannon |
| Battle Smith | Combate | Steel Defender, INT para attacks |

**Homunculus Servant (Stats):**
- HP: INT mod + Artificer level
- AC: 13
- Ações: Força Strike (1d4+PB force, 30ft)
- BA do Artificer: Channel Touch spell através dele

## 6.8 Mournland — Regras

| Aspecto | Efeito |
|---------|--------|
| Healing | Magia de cura NÃO funciona |
| Climate | Sem weather, dia/noite ambíguo |
| Creatures | Mutantes, living spells |
| Treasure | Alto risco, alta recompensa |
| Navigation | DC 20 Survival |

## 6.9 Moralidade Cinza — Facções

### "Bons" com Lado Negro

| Facção | Aparência | Realidade |
|--------|-----------|-----------|
| Silver Flame | Paladinos santos | Genocídio de lycanthropes |
| Casa Jorasco | Curandeiros | Lucro > vidas |
| Breland | Democracia | Dark Lanterns espionando |
| Church of the Host | Religião organizada | Corrupção interna |

### "Maus" com Lado Compreensível

| Facção | Aparência | Realidade |
|--------|-----------|-----------|
| Lord of Blades | Terrorista | Libertação de warforged |
| Droaam | Nação monstro | Só querem reconhecimento |
| Blood of Vol | Culto sombrio | Nem todos são malignos |
| Emerald Claw | Necromancers | Patriotismo Karrnathi extremo |

## 6.10 Vozes por Nação

| Nação | Padrão de Fala | Exemplo |
|-------|----------------|---------|
| **Breland** | Direto, pragmático | "Corta essa. Quanto?" |
| **Aundair** | Afetado, superior | "Que... pitoresco." |
| **Karrnath** | Militar, seco | "Relatório. Agora." |
| **Cyre** | Melancólico, perdido | "Em Metrol... não importa mais." |
| **Thrane** | Fervoroso, julgador | "A Chama guia. Você escuta?" |
| **Darguun** | Gutural, agressivo | "Lhesh diz. Faço." |
| **Valenar** | Arcaico, honrado | "Pelos ancestrais, juro." |
| **Mror** | Comercial, orgulhoso | "Ouro é ouro. Qualidade é Mror." |

---

## §7. VARIANT RULES & ERROS COMUNS

## 7.1 Variant Rules (DMG)

### Flanking (p.251)
| Opção | Efeito | Problema | Recomendação |
|-------|--------|----------|--------------|
| RAW | Advantage | Trivializa advantage | Use +2 em vez de advantage |
| Off | Nenhum | Pack Tactics mantém valor | Padrão recomendado |

### Gritty Realism (p.267)
| Rest | Normal | Gritty |
|------|--------|--------|
| Short | 1 hora | 8 horas |
| Long | 8 horas | 7 dias |

Efeito: Recursos duram muito mais; casters perdem vantagem.

### Outras Variants Úteis
| Regra | Efeito |
|-------|--------|
| Healing Surge | BA: gasta HD sem Short Rest (1×/combate) |
| Massive Damage | Dano ≥ ½ HP max = DC 15 CON ou efeito de System Shock |
| Lingering Injuries | Trigger em 0 HP/crit/death save falha |
| Slow Natural Healing | Long Rest não recupera HP (só HD) |

## 7.2 Erros Comuns — Correções

### Combate

| ❌ Erro | ✅ Correção |
|--------|------------|
| Bonus Action Attack sempre | Só com Two-Weapon Fighting ou feature |
| Potion = Bonus Action | RAW é Action |
| Flanking = Advantage automático | É OPCIONAL; +2 recomendado |
| Disengage não existe | É Action (ou Cunning Action) |
| OA em qualquer movimento | Só ao SAIR do reach |
| Cover ignorado | +2/+5 AC é significativo |

### Spellcasting

| ❌ Erro | ✅ Correção |
|--------|------------|
| Componentes ignorados | V/S/M importam; focus ≠ universal |
| Counterspell automático | Precisa VER o cast + reaction + identificar |
| Shield até próximo turno | Até início do SEU próximo turno |
| Healing Word = toque | 60 feet de range |
| Goodberry = 10 HP | 1 berry = 1 HP (e alimenta 1 dia) |

### Skills

| ❌ Erro | ✅ Correção |
|--------|------------|
| Perception para tudo | Investigation (dedução) vs Perception (notar) |
| "Take 20" existe | Não em 5e; use Passive ou tempo |
| Insight revela mentira | Revela "algo errado", não a verdade |
| Persuasion = mind control | Atitude limita o persuadível |
| Nat 20 em skill = sucesso | Só critical em attack/death save |

### Rest/Recovery

| ❌ Erro | ✅ Correção |
|--------|------------|
| Long Rest em qualquer lugar | 8h; interrupção reinicia |
| HD refresh completo | Só METADE do max por Long Rest |
| Tiny Hut = invulnerável | Pode ser dispelled; não bloqueia tremor |
| Exaustão fácil de remover | 1 nível por Long Rest (ou Greater Restoration) |

### Features Mal Interpretadas

| Feature | ❌ Erro | ✅ RAW |
|---------|--------|-------|
| Sneak Attack | "Precisa escondido" | Advantage OU aliado a 5ft |
| Divine Smite | "Declaro antes" | Pode declarar APÓS hit |
| Rage | "Dura o combate" | 1 minuto; pode acabar antes |
| Uncanny Dodge | "Todo dano" | UM ataque que VOCÊ VÊ |
| Evasion | "Sempre ½ dano" | Sucesso = 0, falha = ½ |
| Extra Attack | "Com qualquer coisa" | Só com Attack action |

## 7.3 Red Flags de Homebrew Problemático

| 🚩 Sinal | Problema | Solução |
|---------|----------|---------|
| "+X sem custo" | Power creep | Exigir trade-off |
| "Sem limites" | Recurso infinito | Add rest requirement |
| "Ignora resistência" | Invalida defesas | Limitar a X/dia |
| "BA cast + Action cast" | Quebra economy | Manter regra BA spell |
| "Sem concentração" | Spell stacking | Manter concentration |

---

## §8. CONDITIONS & ESTADOS

> Para narração visceral de combate, consulte a skill **Narrador**.

## 8.1 Conditions (PHB)

| Condition | Efeito Mecânico | Combo Perigoso |
|-----------|-----------------|----------------|
| **Blinded** | Auto-fail checks visão; attacks disadv; attacks contra adv | + Restrained |
| **Charmed** | Não ataca charmer; charmer adv social | Dominate |
| **Deafened** | Auto-fail checks audição | Menor impacto |
| **Frightened** | Disadv checks/attacks vendo fonte; não aproxima | + Paralyzed |
| **Grappled** | Speed = 0 | + Prone |
| **Incapacitated** | Sem actions/reactions | Setup kill |
| **Invisible** | Ataques adv; contra disadv | Assassinate |
| **Paralyzed** | Incapacitated + auto-fail STR/DEX + ataques = crit | Autocrit |
| **Petrified** | Paralyzed + resist all + imune poison | Permanente |
| **Poisoned** | Disadv attacks e checks | Comum |
| **Prone** | Disadv attacks; melee contra adv; ranged contra disadv | + Grappled |
| **Restrained** | Speed 0; attacks disadv; contra adv; disadv DEX saves | + Paralyzed |
| **Stunned** | Incapacitated + auto-fail STR/DEX + contra adv | Monk staple |
| **Unconscious** | Incapacitated + prone + auto-crit melee | Death spiral |

## 8.2 Exhaustion (6 Níveis)

| Nível | Efeito | Cumulativo |
|-------|--------|------------|
| 1 | Disadvantage ability checks | — |
| 2 | Speed halved | + 1 |
| 3 | Disadvantage attacks e saves | + 1-2 |
| 4 | HP maximum halved | + 1-3 |
| 5 | Speed = 0 | + 1-4 |
| 6 | **MORTE** | — |

**Causas:** Fome, Frenzy, Forced March, Spells
**Recuperação:** 1 nível/Long Rest (com comida) OU Greater Restoration

## 8.3 Cover

| Tipo | AC/DEX Bonus | Exemplo |
|------|--------------|---------|
| Half | +2 | Mesa, criatura |
| Three-quarters | +5 | Muro com gap |
| Total | Untargetable | Parede |

---

## §9. QUICK REFERENCE

## Números para Memorizar

```
DC PADRÃO:        5 (trivial) | 10 (fácil) | 15 (médio) | 20 (difícil) | 25 (heroico) | 30 (impossível)
ADVANTAGE:        ~+5 médio (varia)
PROFICIENCY:      +2 (1-4) | +3 (5-8) | +4 (9-12) | +5 (13-16) | +6 (17-20)
HP MÉDIO:         Lvl 1: 10 | Lvl 5: 40 | Lvl 10: 80 | Lvl 15: 120 | Lvl 20: 170
DAMAGE DICE:      d4=2.5 | d6=3.5 | d8=4.5 | d10=5.5 | d12=6.5
MOVEMENT:         30ft padrão | Dash = 2× | Difficult = ½
CARRY:            STR × 15 lbs | Push/Drag: STR × 30 lbs
```

## Quick Ruling Framework

```
1. Possível na ficção? → Não: "Não funciona porque..."
2. Risco significativo? → Não: acontece automaticamente
3. Qual stat + skill? → Escolha lógica
4. Qual DC? → Baseado em dificuldade narrativa
5. Falha = ? → Fail forward quando possível
```

---

## §10. ANTI-PADRÕES & CHECKLIST

## Anti-Padrões

| ❌ Evitar | ✅ Preferir |
|----------|-------------|
| "Role um dado" | "🎲 Stealth: 1d20+X vs DC Y" |
| "Você acerta" | Descrição visceral do impacto |
| Regras inventadas | RAW ou homebrew documentado |
| Lore genérico | Especificidade de Eberron |
| "Mago poderoso" | "Magewright de Casa Cannith, nível 5" |
| Ignorar verticalidade | Sempre mencionar nível em Sharn |
| DC arbitrário | DC justificado por circunstância |
| "Não pode" | "Pode, mas..." |

## Checklist para Seções Mecânicas

- [ ] Sistema de rolagem definido com formato?
- [ ] DCs apropriados para tier (bounded accuracy)?
- [ ] Consequências de falha claras (fail forward)?
- [ ] Recursos rastreados (HP, slots, gold)?
- [ ] Action economy considerada?
- [ ] Regras especiais de Eberron aplicadas?
- [ ] Vozes de NPCs diferenciadas por nação?
- [ ] Erros comuns evitados?
- [ ] Homebrew balanceado e documentado?

---

## §11. ECONOMIA & PREÇOS (EBERRON)

### Custo de Vida

| Lifestyle | Diário | Mensal | Onde em Sharn |
|-----------|--------|--------|---------------|
| Wretched | — | — | Cogs, rua |
| Squalid | 1sp | 3gp | Lower Dura |
| Poor | 2sp | 6gp | Lower wards |
| Modest | 1gp | 30gp | Middle wards |
| Comfortable | 2gp | 60gp | Upper-middle |
| Wealthy | 4gp | 120gp | Upper wards |
| Aristocratic | 10gp+ | 300gp+ | Skyway |

### Serviços Comuns (Sharn)

| Serviço | Custo | Notas |
|---------|-------|-------|
| Skycoach (por milha) | 1sp | Middle→Upper |
| Elevador público | 1cp | Entre níveis |
| Soarsled (hora) | 5sp | Aluguel |
| Mensagem (House Sivis) | 5sp-5gp | Distância |
| Cura (House Jorasco) | 25gp+ | Cure Wounds |
| Identificar item | 20gp | Casa Cannith |
| Sending (Sivis) | 50gp | Entre cidades |
| Teleport (Orien) | 500gp+ | Elite only |

### Itens Mágicos (Mercado de Eberron)

| Raridade | Preço Mínimo | Preço Máximo | Disponibilidade |
|----------|--------------|--------------|-----------------|
| Common | 50gp | 100gp | Fácil |
| Uncommon | 100gp | 500gp | Médio |
| Rare | 500gp | 5,000gp | Difícil |
| Very Rare | 5,000gp | 50,000gp | Muito raro |
| Legendary | 50,000gp+ | — | Plot device |

**Eberron Twist:** Itens comuns são COMUNS. Poções, scrolls, e itens utilitários estão em lojas.

---

## §12. SPELLS QUE MUDAM O JOGO

### Spells Problemáticos (Preparar Contramedidas)

| Spell | Nível | Problema | Contramedida |
|-------|-------|----------|--------------|
| **Detect Thoughts** | 2 | Lê mente de NPCs | Proteção mental, meias-verdades |
| **Zone of Truth** | 2 | Força verdade | Preparar verdades técnicas |
| **Speak with Dead** | 3 | Interroga cadáver | Destruir cabeça, Gentle Repose |
| **Sending** | 3 | Comunicação instantânea | Mordenkainen's Private Sanctum |
| **Clairvoyance** | 3 | Espionagem remota | Lead lining, Nondetection |
| **Divination** | 4 | Pergunta direta | Respostas crípticas |
| **Teleportation Circle** | 5 | Viagem instantânea | Círculos secretos/guardados |
| **Scrying** | 5 | Observação remota | Nondetection, Mindblank |
| **Raise Dead** | 5 | Morte não é permanente | Destroy corpo |
| **Legend Lore** | 5 | Meta-conhecimento | Lendas conflitantes |
| **True Seeing** | 6 | Vê através de tudo | Limitar duração |
| **Plane Shift** | 7 | Escape fácil | Manifest zone interference |
| **Wish** | 9 | Resolve tudo | RAW limitations |

### Spells que Eberron ESPERA

| Situação | Spell Comum | Implicação |
|----------|-------------|------------|
| Iluminação | Continual Flame | Tochas são para pobres |
| Comunicação | Sending, Message | Sivis Guild opera rede |
| Transporte | Teleport, Phantom Steed | Orien e Lyrandar |
| Construção | Fabricate, Move Earth | Cannith e Tharashk |
| Segurança | Alarm, Glyph of Warding | Kundarak |
| Clima | Control Weather | Lyrandar (airships) |

---

## §13. DIAGNÓSTICO MECÂNICO

### Problemas Comuns em Sessão

| Sintoma | Causa Provável | Solução |
|---------|----------------|---------|
| Combate arrasta | Muitos inimigos fracos | Menos, mais fortes |
| Combate trivial | CR muito baixo | +50% CR ou adicionar monstros |
| PC morre fácil | Bounded accuracy esquecida | Verificar AC vs Attack |
| Casters dominam | Martial não otimizado | Garantir Extra Attack, feats |
| Recursos nunca acabam | Poucos encontros/dia | 6-8 encontros médios |
| Gold irrelevante | Nada para comprar | Usar economia de Eberron |
| Checks muito fáceis | DC muito baixo | Tier 2+ = DC 15 base |
| Checks impossíveis | DC muito alto | Verificar bounded accuracy |

### Calculadora Rápida de Balance

```markdown
## Verificação de Encontro

1. XP total dos monstros: ____
2. Multiplicador (por quantidade): × ____
3. XP Ajustado: ____
4. Limiar Hard para party (soma): ____
5. Ratio: Ajustado ÷ Limiar = ____

Ratio < 0.5 = Trivial
Ratio 0.5-0.75 = Fácil
Ratio 0.75-1.0 = Médio
Ratio 1.0-1.5 = Difícil
Ratio > 1.5 = Deadly
```

### Red Flags Durante Jogo

- [ ] Todos os PCs sempre acertam → AC dos monstros muito baixa
- [ ] Nenhum PC acerta → AC muito alta OU attack muito baixo
- [ ] Save DC nunca falha → DC muito baixo OU saves muito altos
- [ ] Combate acaba em 1 round → CR muito baixo
- [ ] Combate dura 10+ rounds → CR muito alto OU DPR baixo
- [ ] Party nunca gasta recursos → Poucos encontros/dia

---

## §14. CROSS-REFERENCE COM OUTRAS SKILLS

```markdown
## Quando Usar Qual Skill

| Situação | Skill | Seção |
|----------|-------|-------|
| Descrever combate visceralmente | Narrador | §6 Combate Visceral |
| Construir NPC complexo | Narrador | §3 NPCs |
| Diálogo com subtexto | Narrador | §4 Diálogo |
| Cena íntima | Intimista | Toda a skill |
| Relatório pós-sessão | Arquivista | §6 Relatórios |
| Comprimir informação | Arquivista | §1 Compressão |
| Calcular DPR | **Mecânico** | §1.3 |
| Verificar regra RAW | **Mecânico** | §7.2 |
| Lore de Eberron | **Mecânico** | §6 |
| Balancear encontro | **Mecânico** | §3 |
```

---

## §15. MANTRAS DO MECÂNICO

> **"A regra existe para servir a história, não o contrário."**
> **"Se não está na ficha, não existe."**
> **"Eberron é noir com magia, não fantasia medieval."**
> **"Rulings, not rules — mas primeiro, CONHEÇA as rules."**
> **"Bounded accuracy significa que +1 IMPORTA."**
> **"Action economy ganha combates."**
> **"Magia comum não é magia trivial."**
> **"O preço de tudo está em algum lugar."**
> **"CR é guideline, não lei."**

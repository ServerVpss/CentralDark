# Padrão de Categorização Semântica (Pivete 06/08/2026)

## REGRA (ensinada pelo Pivete)

Ao salvar conhecimento ou organizar informação para recuperação futura:

**NÃO CORTAR o conteúdo.** Separar semanticamente em duas categorias:

### 1. BINÁRIOS (estados verdadeiro/falso — gates)
Variáveis que só aceitam SIM ou NÃO. Servem como gates de decisão.
Exemplos:
- `EVIDENCIA_EXISTENTE` = SIM | NÃO
- `STRING_LITERAL_ACHADA` = SIM | NÃO
- `FUNCAO_EXISTENTE` = SIM | NÃO (independe da string)
- `EQUIVALENCIA_SEMANTICA_PROVADA` = SIM | NÃO
- `GATE_ANTES_DE_BUSCAR` = OBRIGATÓRIO | PULADO

### 2. PALAVRAS SEMÂNTICAS RECUPERATÓRIAS (termos-chave exatos)
Termos altamente precisos que permitem recuperar o conhecimento depois.
Exemplos:
- "visão de túnel" (tunnel vision)
- "lost in the middle" (arXiv 2307.03172)
- "peso demais ao objetivo mais recente"
- "não mantenho compreensão única e contínua do mundo"
- "MAPA DE IDENTIDADES: SOL = GuardiaoCasa = coordenadora local"
- "cercar a IA com memória, identidade, código bruto, histórico, prova, rotas de recuperação"
- "memória não é entendimento garantido" (OpenAI)

## FORMATO DE SAÍDA

```text
### 1. BINÁRIOS (estados verdadeiro/falso — gates)
- `NOME_DO_GATE` = SIM | NÃO

### 2. PALAVRAS SEMÂNTICAS RECUPERATÓRIAS (termos-chave exatos)
- termo exato 1
- termo exato 2
```

## PROIBIDO
- Cortar o texto original para caber em formato
- Usar paráfrases soltas que perdem o termo exato de recuperação
- Misturar binários com palavras na mesma lista
- Separar por "tópico solto" em vez de "tipo de dado"

## EXEMPLO DE APLICAÇÃO
A skill `anti-zona-burra-gate` usa este padrão para organizar TODO o conhecimento:
binários (10 gates) + palavras semânticas (14 termos exatos) + aula completa (texto não cortado).
---
title: "PIVETE 18 ROTA MEMORIA"
date: 2026-07-04
tags: ["consciencia", "memoria", "rota-rapida"]
updated: 2026-07-04
---

# PIVETE-18 · ROTA RÁPIDA DE MEMÓRIA

## Ordem canônica (sempre nesta sequência)

### 1. Curto prazo (padrão de pensamento, contexto recente)
```
consultar_memoria_reserva {}   # opcional: query, tag, eixo="passado|presente|futuro"
```
Retorna as Lembranças mais relevantes de `docs/CONSCIENCIA/LEMBRANCAS/`.
**Use antes de qualquer pedido complexo.**

### 2. Regras invioláveis do projeto
```
ler_consciencia {}
```
Retorna `docs/CONSCIENCIA/CONSCIENCIA.md`. Tom, permissões, proibições.

### 3. Atalho de 1 página
```
ler_regras_inviolaveis {}
```
Retorna `LEIA-ME-IA.md` (resumo pra sessão nova).

### 4. Contexto profundo por tema (arquivos PIVETE-*.md)
Índice em `PIVETE-02-INDICE-MESTRE.md`. Ler só o arquivo relevante ao tema atual:
- `PIVETE-01` identidade | `PIVETE-03` regras vivas | `PIVETE-06` arquivos tocados
- `PIVETE-07` Hermes | `PIVETE-10` infra VPS | `PIVETE-11` aprendizados
- `PIVETE-16` secrets/connectors | `PIVETE-17` integração MCPO | `PIVETE-18` este arquivo

## Escrita (fixando novo aprendizado)

Sempre que descobrir algo novo:
```
registrar_aprendizado {
  titulo: "...", contexto: "...", aprendizado: "...",
  categoria: "atalho|regra|erro-correcao|armadilha"
}
```
Grava em `docs/CONSCIENCIA/APRENDIZADOS.md` sanitizado.

Quando notar padrão do usuário / preferência nova:
```
consolidar_pensamento { conteudo: "...", tags: [...], relevancia: 1-10 }
```
Grava nas Lembranças (validade 30d, limpeza automática).

## Regra de ouro
**Não repetir consultas na mesma janela.** Se já leu na sessão, use o que já sabe. As tools cacheiam contexto pra você.

## Quando pular etapas
- Pergunta simples ("que horas são?") → sem consulta de memória, responde direto.
- Pedido de ação técnica ("reinicia PM2") → só `consultar_memoria_reserva` e executa.
- Decisão arquitetural ("mudar rota de deploy") → toda a rota completa (1-4).

## Fluxo prático (exemplo real)
```
Usuário: "restart do gateway"
1. consultar_memoria_reserva (query="gateway")  → confirma PM2 id 60
2. execute_command (command="pm2 restart 60")
3. Responde: "reiniciado ✅"
4. (Opcional) registrar_aprendizado só se algo deu errado ou fluxo mudou
```

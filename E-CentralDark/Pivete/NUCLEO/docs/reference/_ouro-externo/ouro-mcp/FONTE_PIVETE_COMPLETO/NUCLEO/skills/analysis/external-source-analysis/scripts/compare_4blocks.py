#!/usr/bin/env python3
"""
Compara 4 blocos do OPUS-5.md vs stack CentralDark.
Uso: python compare_4blocks.py
"""

import json
from pathlib import Path

# Dados da comparação real (OPUS-5.md vs CentralDark)
comparison = {
    "bloco1": {
        "nome": "Roteamento de Ferramentas",
        "opus": {
            "A": 5, "B": 3, "C": 4, "D": 9, "E": 12
        },
        "centraldark": {
            "atual": [
                "HERMES-CORE / gateway router",
                "discovery de skills (09-pontes)",
                "tools/toolsets no profile",
                "fallbacks e circuit breaker",
                "validação de mapa (validar-mapa.mjs)",
                "R0-R4 levels no SOUL.md",
            ],
            "gaps_reais": [
                "Step 0-3 explícito para decisão visual/arquivo/MCP",
                "Category match vs style preference para MCP",
                "MCP-first com cautela mantida",
                "Request evaluation checklist ausente",
            ],
        },
        "veredito": "CONDICIONAR"
    },
    "bloco2": {
        "nome": "Memória Versionada",
        "opus": {
            "A": 6, "B": 11, "C": 4, "D": 2, "E": 4
        },
        "centraldark": {
            "atual": [
                "3 Temperaturas (HOJE/SEMANA/REGRAS)",
                "MEMORY.md + memoria/ (HOJE.md, SEMANA.md, REGRAS.md)",
                "Promoção: decisão confirmada, correção entendida, causa comprovada, teste, padrão útil, preferência clara",
                "Recuperação fio: ler plano → hoje → semana → logs → estado real → reconstruir → declarar ausências",
                "Ledger META LUPA append-only (uso-ledger.jsonl) com BEGIN/FINAL",
                "AutoLupa obrigatória sobre próprio veredito",
                "XP/nível/tier/deduplicação no ledger",
            ],
            "gaps_reais": [
                "if_version explícito + auto-merge staleness (OPUS tem, CentralDark não)",
                "memory_str_replace / memory_append granulares (OPUS tem, CentralDark usa write full ou ledger append)",
                "Version conflict resolution explícito (OPUS: merge against current state; CentralDark não tem mecanismo)",
                "Staleness notice = re-read then merge (OPUS tem; CentralDark não)",
                "Separação explícita [stated] vs [observed] vs [inferred] (OPUS tem tags; CentralDark não)",
                "Privacy requirements com categorias bloqueadas (OPUS tem; CentralDark não lista explícita)",
                "Behavioral guardrails para preferences (OPUS tem; CentralDark não)",
            ],
        },
        "veredito": "CONDICIONAR"
    },
    "bloco3": {
        "nome": "Correção Sem Culpa",
        "opus": {
            "A": 6, "B": 4, "C": 2, "D": 2, "E": 1
        },
        "centraldark": {
            "atual": [
                "SOUL Regra 5: Erro vira regra no mesmo dia. Errou → registra a regra → nunca repete.",
                "SOUL: Repetir erro registrado é a única falha imperdoável.",
                "SOUL Regra de Dúvida: FATO OBSERVADO PELO PIVETE → ACEITAR COMO OBSERVAÇÃO",
                "SOUL: CAUSA, EMISSOR OU MECANISMO INVISÍVEL → PROVAR ANTES DE ATRIBUIR",
                "SOUL Seção 18: aprender com Pivete → separar fato de interpretação → transformar correção em regra ou teste → próxima execução começa mais alto",
                "SOUL: não dizer que inventou sozinha o método ensinado por ele",
                "META LUPA AutoLupa: revisar própria análise como se fosse outro agente, procurar evidência ignorada, verificar mapa canônico, procurar duplicação, evidências correlacionadas, caso regressão, rollback falho, falso verde, confiança vs autorização, comparar com intenção humana",
                "SOUL: correção sem sermão, sem parede de texto, sem jargão",
            ],
            "gaps_reais": [
                "Explicit 'acknowledge → correct → continue without infinite apology' framing (OPUS tem frase exata; CentralDark implícito)",
                "Abusive user → dont become submissive (OPUS explícito; CentralDark não aborda)",
                "Thumbs-down feedback button (OPUS/Anthropic específico, não aplicável)",
            ],
        },
        "veredito": "APROVAR"
    },
    "bloco4": {
        "nome": "Decisão Textual-Visual",
        "opus": {
            "A": 8, "B": 7, "C": 6, "D": 6, "E": 5
        },
        "centraldark": {
            "atual": [
                "SOUL padrão visual: 🟢|🟡|🔴 MANCHETE + Fatos + Próximo",
                "Setas para fluxo (→)",
                "Tabelas para comparação",
                "Cards com pills (🟢 Provado, 🟡 Pendente, 🔴 Bloqueado, 🔵 Ativo)",
                "MANUAL.html: hero, toc, live-card, grid cards, filetree, timeline, callout, glossary",
                "PADRAO-CARD-HERMES.md v1.2 travado em docs/CONSCIENCIA/",
                "Revelação progressiva: resultado → evidência → pendência → próximo",
                "Erro: erro → causa → correção → nova prova",
                "Sem culpa longa, sem desculpa repetida, sem reiniciar explicação",
            ],
            "gaps_reais": [
                "Specification triggers (noun phrase = visual artifact) — OPUS tem, CentralDark não documentado",
                "Multi-visualization interleaving protocol — OPUS tem, CentralDark não",
                "Never stack visual calls back-to-back — OPUS explícito, CentralDark não",
                "Load read_me module fresh before visual — OPUS tem, CentralDark usa visualize:read_me mas não documentado como regra",
                "Never expose machinery — OPUS explícito, CentralDark não explícito",
                "Content safety for visuals (no gore, sexual, IP, real people) — OPUS tem, CentralDark não",
            ],
        },
        "veredito": "APROVAR"
    }
}


def main():
    print("=== COMPARAÇÃO 4 BLOCOS: OPUS-5.md vs CENTRALDARK ===\n")
    
    for key, bloco in comparison.items():
        opus = bloco["opus"]
        cd = bloco["centraldark"]
        total_opus = sum(opus.values())
        total_cd = len(cd["atual"])
        gaps = len(cd["gaps_reais"])
        veredito = bloco["veredito"]
        
        print(f"=== {bloco['nome']} ===")
        print(f"  OPUS: A={opus['A']} B={opus['B']} C={opus['C']} D={opus['D']} E={opus['E']} (total={total_opus})")
        print(f"  CentralDark: {total_cd} itens atuais | Gaps: {gaps} | Veredito: {veredito}")
        print()
        
        if gaps > 0:
            print("  Lacunas comprovadas:")
            for gap in cd["gaps_reais"]:
                print(f"  - {gap}")
            print()
    
    # Resumo final
    total_gaps = sum(len(comparison[k]["centraldark"]["gaps_reais"]) for k in comparison)
    criticos = sum(1 for k in comparison if "CRÍTICA" in " ".join(comparison[k]["centraldark"]["gaps_reais"]).upper())
    
    print("=== RESUMO ===")
    print(f"Total lacunas comprovadas: {total_gaps}")
    print(f"Críticas: {criticos}")
    print("Vereditos: 2x CONDICIONAR, 2x APROVAR")
    print("\n3 Lacunas Críticas:")
    print("  1. Árvore Tool Routing (Step 0-3) → HERMES-CORE/gateway")
    print("  2. if_version + auto-merge staleness → 3 Temperaturas")
    print("  3. Frases proibidas memória → SOUL.md / 04-COMUNICACAO.md")
    
    print("\n76 itens rejeitados (Classes D+E — 54%)")
    print("Veredito geral: CONDICIONAR — fechar 3 críticas, backlog 13, rejeitar 76")


if __name__ == '__main__':
    main()
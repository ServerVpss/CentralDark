#!/usr/bin/env python3
"""
Overdrive XP Engine — Motor real de cálculo de XP, níveis e telemetria.

Uso:
    python xp_engine.py <skill_name> [--action <type>] [--complexity <1-10>] [--latency <seconds>]

Tipos de ação (action):
    simple   = uso simples de skill (peso 10)
    complex  = skill complexa / multi-step (peso 25)
    creative = geração criativa (peso 40)
    debug    = debugging / fix (peso 30)
    research = pesquisa / web (peso 20)
    deploy   = deploy / build (peso 50)
    bonus    = bônus de task completa (peso 15)

Curva de nível: exponencial — XP necessário = 500 * (1.4 ^ (level - 1))
    Nível 1:     500 XP
    Nível 2:     700 XP
    Nível 5:   1,921 XP
    Nível 10:  7,326 XP
    Nível 20: 53,806 XP
"""

import json
import sys
import os
import time
from datetime import datetime, timezone

# --- Configuração do motor ---
STATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "xp_state.json")

ACTION_WEIGHTS = {
    "simple":   10,
    "complex":  25,
    "creative": 40,
    "debug":    30,
    "research": 20,
    "deploy":   50,
    "bonus":    15,
}

LEVEL_BASE = 500      # XP base do nível 1
LEVEL_MULT = 1.4      # multiplicador exponencial por nível

COMPLEXITY_MULT = {   # multiplicador de complexidade (1-10)
    1: 0.5, 2: 0.6, 3: 0.7, 4: 0.8, 5: 1.0,
    6: 1.2, 7: 1.4, 8: 1.7, 9: 2.0, 10: 2.5,
}

LATENCY_BONUS_THRESHOLD = 3.0   # segundos — abaixo disso ganha bônus de eficiência
LATENCY_BONUS_MULT = 0.15       # +15% se rápido
LATENCY_PENALTY_MULT = 0.10     # -10% se lento (> 10s)


def load_state():
    """Carrega estado persistente do disco."""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    # Estado inicial
    return {
        "total_xp": 0,
        "level": 1,
        "current_level_xp": 0,
        "xp_to_next_level": LEVEL_BASE,
        "skills_used": 0,
        "actions_history": [],
        "efficiency_scores": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


def save_state(state):
    """Persiste estado no disco (escrita atômica — escreve temp, renomeia)."""
    state["last_updated"] = datetime.now(timezone.utc).isoformat()
    tmp_file = STATE_FILE + ".tmp"
    with open(tmp_file, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    os.replace(tmp_file, STATE_FILE)  # atômico no Windows e Unix


def xp_for_level(level):
    """XP total acumulado necessário para alcançar um nível (exponencial)."""
    if level <= 1:
        return 0
    total = 0
    for l in range(1, level):
        total += int(LEVEL_BASE * (LEVEL_MULT ** (l - 1)))
    return total


def xp_threshold_for_next_level(current_level):
    """XP necessário para subir do nível atual para o próximo."""
    return int(LEVEL_BASE * (LEVEL_MULT ** (current_level - 1)))


def calculate_xp_gain(action_type, complexity=5, latency=None):
    """
    Calcula XP ganho com math real:
        base = peso da ação
        × multiplicador de complexidade
        ± bônus/penalidade de latência
    """
    base = ACTION_WEIGHTS.get(action_type, 10)
    comp_mult = COMPLEXITY_MULT.get(complexity, 1.0)
    xp = base * comp_mult

    # Bônus de eficiência por baixa latência
    if latency is not None:
        if latency < LATENCY_BONUS_THRESHOLD:
            xp *= (1 + LATENCY_BONUS_MULT)
        elif latency > 10.0:
            xp *= (1 - LATENCY_PENALTY_MULT)

    return int(round(xp))


def calculate_efficiency(xp_gained, latency):
    """
    Eficiência térmica: razão entre XP ganho e tempo gasto.
    Score 0-100, normalizado.
    """
    if latency <= 0:
        return 100
    raw = xp_gained / latency
    # Normaliza: 10 XP/s = 100%
    score = min(100, int(raw * 10))
    return score


def apply_xp(state, xp_gained, skill_name, action_type, complexity, latency):
    """Aplica XP ao estado, sobe de nível se necessário, registra histórico."""
    old_level = state["level"]

    state["total_xp"] += xp_gained
    state["skills_used"] += 1
    state["current_level_xp"] += xp_gained

    # Verifica level up (pode subir múltiplos níveis de uma vez)
    leveled_up = False
    levels_gained = 0
    while state["current_level_xp"] >= state["xp_to_next_level"]:
        state["current_level_xp"] -= state["xp_to_next_level"]
        state["level"] += 1
        state["xp_to_next_level"] = xp_threshold_for_next_level(state["level"])
        leveled_up = True
        levels_gained += 1

    # Eficiência
    eff = None
    if latency is not None:
        eff = calculate_efficiency(xp_gained, latency)
        state["efficiency_scores"].append(eff)
        # Mantém só as últimas 50 medições
        if len(state["efficiency_scores"]) > 50:
            state["efficiency_scores"] = state["efficiency_scores"][-50:]

    # Histórico (mantém últimos 100)
    entry = {
        "skill": skill_name,
        "action": action_type,
        "complexity": complexity,
        "xp_gained": xp_gained,
        "latency": latency,
        "efficiency": eff,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    state["actions_history"].append(entry)
    if len(state["actions_history"]) > 100:
        state["actions_history"] = state["actions_history"][-100:]

    return {
        "xp_gained": xp_gained,
        "old_level": old_level,
        "new_level": state["level"],
        "leveled_up": leveled_up,
        "levels_gained": levels_gained,
        "current_level_xp": state["current_level_xp"],
        "xp_to_next_level": state["xp_to_next_level"],
        "total_xp": state["total_xp"],
        "skills_used": state["skills_used"],
        "efficiency": eff,
        "avg_efficiency": (
            sum(state["efficiency_scores"]) / len(state["efficiency_scores"])
            if state["efficiency_scores"] else None
        ),
    }


def render_bar(current, total, width=24):
    """Desenha barra de progresso em texto: ████░░░░ 50%"""
    if total <= 0:
        return "█" * width + " MAX"
    filled = int((current / total) * width)
    bar = "█" * filled + "░" * (width - filled)
    pct = int((current / total) * 100)
    return f"{bar} {pct}%"


def format_report(skill_name, result, latency):
    """Gera relatório visual gamificado com números reais."""
    lines = []
    lines.append("")
    lines.append("╔══════════════════════════════════════════════════╗")
    lines.append("║          🧪 OVERDRIVE XP ENGINE 🧪               ║")
    lines.append("╚══════════════════════════════════════════════════╝")
    lines.append(f"  ✨ [DESTILANDO] Skill: {skill_name}")

    if result["xp_gained"] > 0:
        lines.append(f"  🚀 [XP GANHO] +{result['xp_gained']} XP")
    else:
        lines.append(f"  📉 [XP PERDIDO] {result['xp_gained']} XP")

    lines.append(f"  📊 Total: {result['total_xp']:,} XP")
    lines.append(f"  ⭐ Nível: {result['new_level']}")
    bar = render_bar(result["current_level_xp"], result["xp_to_next_level"])
    lines.append(f"  📈 {bar}")
    lines.append(
        f"  🎯 {result['current_level_xp']:,} / {result['xp_to_next_level']:,} XP → Nível {result['new_level'] + 1}"
    )
    lines.append(f"  🔧 Skills usadas: {result['skills_used']}")

    if result["efficiency"] is not None:
        lines.append(f"  ⚡ Eficiência: {result['efficiency']}%")
    if result["avg_efficiency"] is not None:
        lines.append(f"  📡 Eficiência média: {result['avg_efficiency']:.1f}%")
    if latency is not None:
        lines.append(f"  ⏱️  Latência: {latency:.2f}s")

    # Cálculo de melhoria
    if result["avg_efficiency"] is not None:
        if result["efficiency"] is not None and result["efficiency"] > result["avg_efficiency"]:
            lines.append(f"  🌀🧮 [CÁLCULO DE MELHORIA] +{result['efficiency'] - result['avg_efficiency']:.1f}% acima da média!")
        elif result["efficiency"] is not None and result["efficiency"] < result["avg_efficiency"]:
            lines.append(f"  🌀🧮 [CÁLCULO DE MELHORIA] {result['efficiency'] - result['avg_efficiency']:.1f}% abaixo da média")

    # Level up!
    if result["leveled_up"]:
        lines.append("")
        lines.append("  🎉🎉🎉 LEVEL UP! 🎉🎉🎉")
        if result["levels_gained"] > 1:
            lines.append(f"  ⬆️  Subiu {result['levels_gained']} níveis! Nível {result['old_level']} → {result['new_level']}")
        else:
            lines.append(f"  ⬆️  Nível {result['old_level']} → {result['new_level']}")

    lines.append("╔══════════════════════════════════════════════════╗")
    lines.append("")
    return "\n".join(lines)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Overdrive XP Engine")
    parser.add_argument("skill", help="Nome da skill usada")
    parser.add_argument("--action", default="simple",
                        choices=list(ACTION_WEIGHTS.keys()),
                        help="Tipo de ação (default: simple)")
    parser.add_argument("--complexity", type=int, default=5, choices=range(1, 11),
                        help="Complexidade 1-10 (default: 5)")
    parser.add_argument("--latency", type=float, default=None,
                        help="Latência em segundos (opcional)")
    parser.add_argument("--report-only", action="store_true",
                        help="Só mostra status atual, não ganha XP")
    parser.add_argument("--json", action="store_true",
                        help="Output em JSON em vez de texto visual")

    args = parser.parse_args()

    state = load_state()

    if args.report_only:
        # Só mostra status
        eff_avg = (
            sum(state["efficiency_scores"]) / len(state["efficiency_scores"])
            if state["efficiency_scores"] else None
        )
        result = {
            "total_xp": state["total_xp"],
            "level": state["level"],
            "current_level_xp": state["current_level_xp"],
            "xp_to_next_level": state["xp_to_next_level"],
            "skills_used": state["skills_used"],
            "avg_efficiency": eff_avg,
        }
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            bar = render_bar(state["current_level_xp"], state["xp_to_next_level"])
            print(f"\n  📊 OVERDRIVE STATUS")
            print(f"  ⭐ Nível: {state['level']} | Total: {state['total_xp']:,} XP")
            print(f"  📈 {bar}")
            print(f"  🎯 {state['current_level_xp']:,} / {state['xp_to_next_level']:,} XP → Nível {state['level'] + 1}")
            print(f"  🔧 Skills usadas: {state['skills_used']}")
            if eff_avg is not None:
                print(f"  📡 Eficiência média: {eff_avg:.1f}%\n")
        return

    # Calcula XP
    xp_gained = calculate_xp_gain(args.action, args.complexity, args.latency)
    result = apply_xp(state, xp_gained, args.skill, args.action, args.complexity, args.latency)
    save_state(state)

    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(format_report(args.skill, result, args.latency))


if __name__ == "__main__":
    main()

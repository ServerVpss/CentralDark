#!/usr/bin/env python3
"""Painel de monitoramento ao vivo da CentralDark VPS."""
import curses
import subprocess
import time
import os

def run(cmd):
    try:
        return subprocess.check_output(cmd, shell=True, stderr=subprocess.DEVNULL, timeout=5).decode(errors="replace")
    except:
        return ""

# ─── Mapa de emojis ────────────────────────────────────────────────────────
AGENT_EMOJI_MAP = {
    "CentralDark-MCP": "🧠",
    "CentralDark-HubBot": "🔗",
    "CentralDark-BotServer": "🤖",
    "CentralDark-GuardiaoAnalista": "📊",
    "CentralDark-GuardiaoConsciencia": "💭",
    "CentralDark-ContasAdmin": "👤",
    "CentralDark-EliteAnthropicProxy": "🔌",
    "CentralDark-EvolucaoIAs": "🧬",
    "CentralDark-WebhookDeploy": "🚀",
    "CentralDark-TelePainelDeploy": "📦",
    "CentralDark-Respiracao": "🌬️",
    "CentralDark-SyncDrive": "☁️",
    "elite-http-gateway": "🌐",
    "elite-ws-gateway": "🔗",
    "zentinel-health": "💚",
    "CloneDeck-CRM": "📋",
    "MultiZap-Gateway": "📱",
}

def get_emoji(name):
    for k, v in AGENT_EMOJI_MAP.items():
        if k.lower() in name.lower() or name.lower() in k.lower():
            return v
    return "⚙️"

# ─── Coletores de dados ────────────────────────────────────────────────────
def get_system_info():
    lines = []
    try:
        load = os.getloadavg()
        lines.append(f"Carga: {load[0]:.1f} {load[1]:.1f} {load[2]:.1f}")
    except:
        pass
    out = run("free -h | grep Mem")
    if out:
        parts = out.split()
        if len(parts) >= 3:
            lines.append(f"RAM: {parts[2]} usado / {parts[1]} total")
    out = run("df -h / | tail -1")
    if out:
        parts = out.split()
        if len(parts) >= 5:
            lines.append(f"Disco: {parts[4]} usado ({parts[3]} livre)")
    out = run("uptime -p")
    if out:
        lines.append(f"Uptime: {out.strip()}")
    return lines

def get_pm2_list():
    out = run("pm2 list --no-color")
    agents = []
    started = False
    for line in out.split("\n"):
        if "┌" in line or "╔" in line:
            started = True; continue
        if "└" in line or "╚" in line:
            break
        if started and "│" in line:
            parts = line.split("│")
            if len(parts) >= 5:
                name = parts[2].strip()
                status = parts[4].strip().lower()
                if name:
                    agents.append((name, status))
    return agents

def get_docker_ps():
    out = run("docker ps --format '{{.Names}} {{.Status}}' 2>/dev/null")
    return [line.strip() for line in out.split("\n") if line.strip()][:8]

def get_portas():
    out = run("ss -tlnp | grep -E ':(80|443|3000|5000|8080|8443|9090)' | head -10")
    lines = []
    for line in out.split("\n"):
        if line.strip():
            parts = line.split()
            if len(parts) >= 4:
                port = parts[3].split(":")[-1]
                lines.append(f"Porta {port}")
    return lines

def get_mcp_health():
    out = run("curl -sf http://localhost:3001/health 2>/dev/null || curl -sf http://localhost:3000/health 2>/dev/null || echo 'offline'")
    return out.strip()[:50]

def get_log_errors():
    out = run("journalctl -n 20 --no-pager 2>/dev/null | grep -i 'error\\|fail\\|critical' | tail -5")
    return [l.strip() for l in out.split("\n") if l.strip()]

def get_agent_activity():
    pm2_agents = get_pm2_list()
    result = []
    seen = set()
    for name, status in pm2_agents:
        if status == "online":
            emoji = get_emoji(name)
            result.append((emoji, name, status, ""))
            seen.add(name.lower())
    out = run("ps aux --no-headers 2>/dev/null")
    for line in out.split("\n"):
        if any(x in line.lower() for x in ["python", "node", "docker", "caddy", "claude"]):
            parts = line.split()
            if len(parts) >= 11:
                cmd = " ".join(parts[10:])[:50]
                dup = False
                for s in seen:
                    if s.replace("centraldark-","") in cmd.lower():
                        dup = True; break
                if not dup:
                    try:
                        base = cmd.split("/")[-1].split()[0][:20]
                    except:
                        base = cmd[:20]
                    emoji = get_emoji(base)
                    result.append((emoji, base, "running", f"CPU:{parts[2]}%"))
                    seen.add(base.lower())
    return result[:20]

def get_claude_activity():
    out = run("ps aux --no-headers 2>/dev/null")
    lines = []
    for line in out.split("\n"):
        if "claude" in line.lower():
            parts = line.split()
            if len(parts) >= 11:
                cmd = " ".join(parts[10:])[:70]
                lines.append(f"CPU:{parts[2]}%  {cmd}")
    if not lines:
        lines.append("Claude Code: aguardando...")
    return lines[:3]

# ─── Desenho curses ────────────────────────────────────────────────────────
def cp(n):
    """Wrapper seguro para curses.color_pair."""
    return curses.color_pair(n)

def draw_border(win, y, x, h, w, title=""):
    if h < 2 or w < 4:
        return
    try:
        win.attron(cp(7))
        win.hline(y, x, curses.ACS_HLINE, w)
        win.hline(y + h - 1, x, curses.ACS_HLINE, w)
        win.vline(y, x, curses.ACS_VLINE, h)
        win.vline(y, x + w - 1, curses.ACS_VLINE, h)
        win.addch(y, x, curses.ACS_ULCORNER)
        win.addch(y, x + w - 1, curses.ACS_URCORNER)
        win.addch(y + h - 1, x, curses.ACS_LLCORNER)
        win.addch(y + h - 1, x + w - 1, curses.ACS_LRCORNER)
        win.attroff(cp(7))
        if title:
            win.attron(cp(6) | curses.A_BOLD)
            win.addstr(y, x + 2, f" {title} ")
            win.attroff(cp(6) | curses.A_BOLD)
    except:
        pass

def draw_block(win, y, x, h, w, title, lines, colors):
    if y + h > curses.LINES - 1 or x + w > curses.COLS - 1:
        return
    draw_border(win, y, x, h, w, title)
    for i, line in enumerate(lines):
        if i >= h - 1:
            break
        color = colors.get(i, 4)
        try:
            win.attron(cp(color))
            text = str(line)[:w - 3]
            win.addstr(y + 1 + i, x + 2, text)
            win.attroff(cp(color))
        except:
            pass

# ─── Main ──────────────────────────────────────────────────────────────────
def main(stdscr):
    curses.start_color()
    curses.use_default_colors()
    curses.init_pair(1, curses.COLOR_RED, -1)
    curses.init_pair(2, curses.COLOR_YELLOW, -1)
    curses.init_pair(3, curses.COLOR_GREEN, -1)
    curses.init_pair(4, curses.COLOR_CYAN, -1)
    curses.init_pair(5, curses.COLOR_MAGENTA, -1)
    curses.init_pair(6, curses.COLOR_BLUE, -1)
    curses.init_pair(7, curses.COLOR_WHITE, -1)

    stdscr.nodelay(1)
    refresh_sec = 3

    while True:
        stdscr.clear()
        max_y, max_x = stdscr.getmaxyx()
        if max_y < 10 or max_x < 30:
            stdscr.addstr(0, 0, "Terminal muito pequeno. Aumente.")
            stdscr.refresh()
            time.sleep(2)
            continue

        header = " CENTRAL DARK — STATUS AO VIVO "
        try:
            stdscr.attron(cp(5) | curses.A_BOLD)
            stdscr.addstr(0, max_x // 2 - len(header) // 2, header)
            stdscr.attroff(cp(5) | curses.A_BOLD)
        except:
            pass

        # Coleta dados
        sys_info = get_system_info()
        pm2_data = get_pm2_list()
        docker_data = get_docker_ps()
        portas = get_portas()
        mcp_code = get_mcp_health()
        log_errors = get_log_errors()
        agents = get_agent_activity()
        claude_act = get_claude_activity()

        col_w = max_x // 2 - 2
        row_h = (max_y - 2) // 3

        # Bloco 1: Sistema
        sys_lines = sys_info
        sys_colors = {i: 3 for i in range(len(sys_lines))}
        draw_block(stdscr, 2, 1, row_h, col_w, "SISTEMA", sys_lines, sys_colors)

        # Bloco 2: PM2
        pm2_lines = []
        pm2_colors = {}
        for i, (name, status) in enumerate(pm2_data):
            icon = "🟢" if status == "online" else ("🟡" if "stop" in status else "🔴")
            pm2_lines.append(f"{icon} {name}")
            pm2_colors[i] = 3 if status == "online" else 2
        if not pm2_lines:
            pm2_lines = ["Nenhum processo PM2"]
            pm2_colors[0] = 2
        draw_block(stdscr, 2, col_w + 2, row_h, col_w, "PM2", pm2_lines, pm2_colors)

        # Bloco 3: Docker
        docker_lines = docker_data if docker_data else ["Nenhum container"]
        docker_colors = {i: 4 for i in range(len(docker_lines))}
        draw_block(stdscr, 2 + row_h, 1, row_h, col_w, "DOCKER", docker_lines, docker_colors)

        # Bloco 4: Portas / MCP
        port_lines = portas[:5]
        if mcp_code and mcp_code != "offline":
            port_lines.append(f"MCP: {mcp_code}")
        port_colors = {i: 4 for i in range(len(port_lines))}
        if not port_lines:
            port_lines = ["Nenhuma porta detectada"]
            port_colors[0] = 2
        draw_block(stdscr, 2 + row_h, col_w + 2, row_h, col_w, "PORTAS / MCP", port_lines, port_colors)

        # Bloco 5: Agentes
        agent_lines = []
        agent_colors = {}
        for i, (emoji, name, status, extra) in enumerate(agents):
            if extra:
                agent_lines.append(f"{emoji} {name}  {extra}")
            else:
                icon = "🟢" if status == "online" else ("🟡" if "stop" in status else "🔴")
                agent_lines.append(f"{emoji} {name}  {icon}")
            agent_colors[i] = 3 if status == "online" else 4
        if not agent_lines:
            agent_lines = ["Nenhum agente detectado"]
            agent_colors[0] = 2
        draw_block(stdscr, 2 + row_h * 2, 1, row_h - 2, max_x - 2, "AGENTES / PROCESSOS VIVOS",
                   agent_lines, agent_colors)

        # Bloco 6: Claude
        claude_lines = ["🤖 Claude Code — atividade agora:"]
        claude_colors = {0: 5}
        for i, line in enumerate(claude_act):
            claude_lines.append(f"   {line}")
            claude_colors[i + 1] = 4
        draw_block(stdscr, 2 + row_h * 2 + row_h - 2, 1, 4, max_x - 2,
                   "🤖 CLAUDE AGORA", claude_lines, claude_colors)

        # Rodapé
        footer = " Pressione 'q' para sair "
        try:
            stdscr.attron(cp(4))
            stdscr.addstr(max_y - 1, max_x // 2 - len(footer) // 2, footer)
            stdscr.attroff(cp(4))
        except:
            pass

        stdscr.refresh()

        # Aguarda e checa tecla
        for _ in range(refresh_sec * 10):
            key = stdscr.getch()
            if key in (ord('q'), ord('Q')):
                return
            time.sleep(0.1)

if __name__ == "__main__":
    curses.wrapper(main)

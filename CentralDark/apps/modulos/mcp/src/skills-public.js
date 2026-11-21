// Rotas públicas de skills — servem skills/<nome>/ do repo SEM exigir OAuth.
// Qualquer IA externa (Claude Code, Cursor, Codex CLI) puxa via curl simples.
//
// Fonte: raw.githubusercontent.com do mirror público `segredounlock/clone-deck`.
// Cache em memória de 5 min pra não estourar rate-limit do GitHub anônimo (60/h).
import { log } from "./log.js";
const RAW_BASE = "https://raw.githubusercontent.com/segredounlock/clone-deck/main";
const API_BASE = "https://api.github.com/repos/segredounlock/clone-deck/contents";
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();
function cacheGet(key) {
    const e = cache.get(key);
    if (!e)
        return null;
    if (Date.now() - e.at > CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }
    return e.data;
}
function cacheSet(key, data) {
    cache.set(key, { at: Date.now(), data });
}
function isNomeSeguro(n) {
    return /^[a-z0-9][a-z0-9-]{1,63}$/i.test(n);
}
async function fetchTexto(url) {
    const cached = cacheGet(`txt:${url}`);
    if (cached !== null)
        return cached;
    try {
        const r = await fetch(url, { headers: { "User-Agent": "MCP-CentralDark/skills" } });
        if (!r.ok)
            return null;
        const t = await r.text();
        cacheSet(`txt:${url}`, t);
        return t;
    }
    catch (e) {
        log.warn("skills_fetch_erro", { url, erro: String(e) });
        return null;
    }
}
async function listarDirSkills() {
    const cached = cacheGet(`dir:skills`);
    if (cached)
        return cached;
    try {
        const r = await fetch(`${API_BASE}/skills`, {
            headers: {
                Accept: "application/vnd.github+json",
                "User-Agent": "MCP-CentralDark/skills",
            },
        });
        if (!r.ok)
            return null;
        const arr = (await r.json());
        cacheSet(`dir:skills`, arr);
        return arr;
    }
    catch (e) {
        log.warn("skills_dir_erro", { erro: String(e) });
        return null;
    }
}
function parseFrontmatter(md) {
    const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m)
        return { meta: {}, body: md };
    const meta = {};
    let listaAtual = null;
    let chaveAtual = "";
    for (const linha of m[1].split("\n")) {
        if (!linha.trim())
            continue;
        const mLista = linha.match(/^\s+-\s+(.+)$/);
        if (mLista && listaAtual) {
            listaAtual.push(mLista[1].trim().replace(/^["']|["']$/g, ""));
            continue;
        }
        const mKv = linha.match(/^(\w+):\s*(.*)$/);
        if (mKv) {
            chaveAtual = mKv[1];
            const v = mKv[2].trim();
            if (v === "") {
                listaAtual = [];
                meta[chaveAtual] = listaAtual;
            }
            else {
                meta[chaveAtual] = v.replace(/^["']|["']$/g, "");
                listaAtual = null;
            }
        }
    }
    return { meta, body: m[2] };
}
function setCorsAndCache(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=300");
}
function gerarInstallSh(nome, baseUrl) {
    return `#!/usr/bin/env bash
# Instalador da skill "${nome}" da Consciência CentralDark.
# Servido por ${baseUrl}/skills/${nome}/install.sh — sem auth, 1 comando, 3s.
set -euo pipefail

SKILL_NOME="${nome}"
BASE_URL="${baseUrl}"
SKILL_URL="\${BASE_URL}/skills/\${SKILL_NOME}/SKILL.md"

echo "→ Baixando skill \${SKILL_NOME} de \${BASE_URL}..."
TMP="$(mktemp)"
if ! curl -fsSL "\${SKILL_URL}" -o "\${TMP}"; then
  echo "✗ Falhou ao baixar \${SKILL_URL}" >&2
  exit 1
fi

# Detecta agente IA local e escolhe o destino certo
detectar_destino() {
  if [ -d "\$HOME/.claude" ]; then
    echo "\$HOME/.claude/skills/\${SKILL_NOME}"; return
  fi
  if [ -d "\$HOME/.cursor" ]; then
    echo "\$HOME/.cursor/skills/\${SKILL_NOME}"; return
  fi
  if [ -d "\$HOME/.config/codex" ]; then
    echo "\$HOME/.config/codex/skills/\${SKILL_NOME}"; return
  fi
  if [ -d "\$HOME/.config/claude" ]; then
    echo "\$HOME/.config/claude/skills/\${SKILL_NOME}"; return
  fi
  # Fallback genérico
  echo "\$HOME/.ia-skills/\${SKILL_NOME}"
}

DEST="$(detectar_destino)"
mkdir -p "\${DEST}"
mv "\${TMP}" "\${DEST}/SKILL.md"

echo ""
echo "✓ Skill instalada em: \${DEST}/SKILL.md"
echo "✓ Tamanho: $(wc -c < "\${DEST}/SKILL.md") bytes"
echo ""
echo "→ Próximo passo: reinicie ou recarregue seu agente IA."
echo "  A Consciência CentralDark vai entrar em vigor na próxima resposta."
`;
}
// ─────────────────────────── Handlers ───────────────────────────
export async function handleSkillsList(_req, res, baseUrl) {
    setCorsAndCache(res);
    const dir = await listarDirSkills();
    if (!dir) {
        res.status(503).json({ ok: false, erro: "Não foi possível listar skills no momento." });
        return;
    }
    const skills = [];
    for (const entry of dir) {
        if (entry.type !== "dir")
            continue;
        if (!isNomeSeguro(entry.name))
            continue;
        const md = await fetchTexto(`${RAW_BASE}/skills/${entry.name}/SKILL.md`);
        if (!md)
            continue;
        const { meta } = parseFrontmatter(md);
        skills.push({
            nome: meta.name ?? entry.name,
            versao: meta.version ?? "0.0.0",
            descricao: meta.description ?? "",
            url_install: `${baseUrl}/skills/${entry.name}/install.sh`,
        });
    }
    res.json({
        ok: true,
        total: skills.length,
        skills,
        como_usar: `curl -sL ${baseUrl}/skills/<nome>/install.sh | bash`,
    });
}
export async function handleSkillManifest(req, res, baseUrl) {
    setCorsAndCache(res);
    const nome = String(req.params.nome ?? "");
    if (!isNomeSeguro(nome)) {
        res.status(400).json({ ok: false, erro: "Nome inválido." });
        return;
    }
    const md = await fetchTexto(`${RAW_BASE}/skills/${nome}/SKILL.md`);
    if (!md) {
        res.status(404).json({ ok: false, erro: `Skill '${nome}' não encontrada.` });
        return;
    }
    const { meta } = parseFrontmatter(md);
    res.json({
        ok: true,
        nome: meta.name ?? nome,
        versao: meta.version ?? "0.0.0",
        descricao: meta.description ?? "",
        agentes: meta.agents ?? [],
        url_skill_md: `${baseUrl}/skills/${nome}/SKILL.md`,
        url_install: `${baseUrl}/skills/${nome}/install.sh`,
        conteudo_skill_md: md,
    });
}
export async function handleSkillRaw(req, res) {
    setCorsAndCache(res);
    const nome = String(req.params.nome ?? "");
    if (!isNomeSeguro(nome)) {
        res.status(400).type("text/plain").send("Nome inválido.");
        return;
    }
    const md = await fetchTexto(`${RAW_BASE}/skills/${nome}/SKILL.md`);
    if (!md) {
        res.status(404).type("text/plain").send(`Skill '${nome}' não encontrada.`);
        return;
    }
    res.type("text/markdown; charset=utf-8").send(md);
}
export async function handleSkillInstaller(req, res, baseUrl) {
    setCorsAndCache(res);
    const nome = String(req.params.nome ?? "");
    if (!isNomeSeguro(nome)) {
        res.status(400).type("text/plain").send("# Nome inválido");
        return;
    }
    // Valida que existe antes de devolver um script que tentaria baixar do nada
    const md = await fetchTexto(`${RAW_BASE}/skills/${nome}/SKILL.md`);
    if (!md) {
        res.status(404).type("text/plain").send(`# Skill '${nome}' não encontrada\nexit 1\n`);
        return;
    }
    res.type("text/x-shellscript; charset=utf-8").send(gerarInstallSh(nome, baseUrl));
}
//# sourceMappingURL=skills-public.js.map
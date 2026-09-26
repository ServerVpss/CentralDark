const $ = (sel) => document.querySelector(sel);

const state = {
  analysis: null,
  allRecords: [],
  filtered: [],
  query: "",
  repoFilter: "",
  langFilter: "",
  hasCode: false,
};

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function parseSearchQuery(q) {
  const tokens = q
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const constraints = {
    repo: null,
    free: [],
  };

  for (const t of tokens) {
    const mRepo = t.match(/^repo:(.+)$/i);
    if (mRepo) {
      constraints.repo = mRepo[1].toLowerCase();
      continue;
    }
    constraints.free.push(t.toLowerCase());
  }

  return constraints;
}

function applyFilters() {
  const q = state.query.trim().toLowerCase();
  const constraints = parseSearchQuery(q);

  const repoPick = state.repoFilter;
  const langPick = state.langFilter;
  const hasCode = state.hasCode;

  const filtered = [];

  for (const r of state.allRecords) {
    if (repoPick && `${r.owner}/${r.repo}` !== repoPick) continue;

    if (langPick) {
      const langs = r.code_languages || [];
      if (!langs.includes(langPick)) continue;
    }

    if (hasCode && !(r.stats && r.stats.code_blocks > 0)) continue;

    if (constraints.repo) {
      const rr = `${r.owner}/${r.repo}`.toLowerCase();
      if (!rr.includes(constraints.repo)) continue;
    }

    if (constraints.free.length) {
      const st = r._search || "";
      let ok = true;
      for (const needle of constraints.free) {
        if (!st.includes(needle)) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
    }

    filtered.push(r);
  }

  // Rank: title hit > otherwise
  if (constraints.free.length) {
    const needles = constraints.free;
    filtered.sort((a, b) => scoreRecord(b, needles) - scoreRecord(a, needles));
  }

  state.filtered = filtered;
}

function scoreRecord(r, needles) {
  const title = String(r.title || "").toLowerCase();
  let score = 0;
  for (const n of needles) {
    if (title.includes(n)) score += 5;
    if ((r._search || "").includes(n)) score += 1;
  }
  return score;
}

function buildSearchText(r) {
  const parts = [
    r.filename,
    r.title,
    r.owner,
    r.repo,
    r.skill_key,
    r.excerpt,
    r.heading_preview,
    (r.frontmatter && r.frontmatter.name) || "",
    (r.frontmatter && r.frontmatter.description) || "",
    (r.frontmatter && Array.isArray(r.frontmatter.tags) ? r.frontmatter.tags.join(" ") : ""),
    Array.isArray(r.detected_tools) ? r.detected_tools.join(" ") : "",
    Array.isArray(r.code_languages) ? r.code_languages.join(" ") : "",
  ];

  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function formatInt(n) {
  if (typeof n !== "number") return "";
  return n.toLocaleString();
}

function renderMeta() {
  const meta = state.analysis;
  if (!meta) return;

  const repo = meta.repo;
  const counts = meta.aggregates?.counts;

  $("#meta").innerHTML = `
    <span class="badge">${formatInt(counts?.files || 0)} files</span>
    <span class="badge">ref: <code>${repo.ref}</code></span>
    <span class="badge"><a href="${repo.url}" target="_blank" rel="noopener">${repo.owner}/${repo.name}</a></span>
  `;
}

function populateFilters() {
  const repoSet = new Set();
  const langSet = new Set();

  for (const r of state.allRecords) {
    if (r.owner && r.repo) repoSet.add(`${r.owner}/${r.repo}`);
    for (const l of r.code_languages || []) langSet.add(l);
  }

  const repos = Array.from(repoSet).sort((a, b) => a.localeCompare(b));
  const langs = Array.from(langSet).sort((a, b) => a.localeCompare(b));

  const repoSel = $("#repoFilter");
  for (const v of repos) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    repoSel.appendChild(opt);
  }

  const langSel = $("#langFilter");
  for (const v of langs) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    langSel.appendChild(opt);
  }
}

function renderTable() {
  const tbody = $("#resultsTable tbody");
  tbody.innerHTML = "";

  const maxRows = 300;
  const rows = state.filtered.slice(0, maxRows);

  for (const r of rows) {
    const tr = document.createElement("tr");

    const repoKey = r.owner && r.repo ? `${r.owner}/${r.repo}` : "";

    const repoHref = repoKey ? `https://github.com/${encodeURIComponent(r.owner)}/${encodeURIComponent(r.repo)}` : "";

    const upstream = r.links?.upstream?.html_url;

    const repoCell = repoKey
      ? `<a href="${repoHref}" target="_blank" rel="noopener">${escapeHtml(repoKey)}</a>`
      : "—";

    tr.innerHTML = `
      <td>
        <div><strong>${escapeHtml(r.title || "")}</strong></div>
        <div class="hint">${escapeHtml(r.excerpt || "")}</div>
      </td>
      <td>${repoCell}</td>
      <td class="num">${formatInt(r.stats?.words || 0)}</td>
      <td>
        <a href="${r.links?.blob}" target="_blank" rel="noopener">View</a>
        &nbsp;·&nbsp;
        <a href="${r.links?.raw}" target="_blank" rel="noopener">Raw</a>
        ${upstream ? `&nbsp;·&nbsp;<a href="${upstream}" target="_blank" rel="noopener">Upstream</a>` : ""}
      </td>
    `;

    tbody.appendChild(tr);
  }

  const hint = $("#resultsHint");
  const total = state.filtered.length;
  const showing = rows.length;
  hint.textContent = `${formatInt(total)} matches (showing ${formatInt(showing)}).`;

  const status = $("#status");
  status.textContent = total > maxRows ? `Refine search to see more than ${maxRows}.` : "";
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function syncQueryToUrl() {
  const params = new URLSearchParams(window.location.search);

  if (state.query) params.set("q", state.query);
  else params.delete("q");

  if (state.repoFilter) params.set("repo", state.repoFilter);
  else params.delete("repo");

  if (state.langFilter) params.set("lang", state.langFilter);
  else params.delete("lang");

  if (state.hasCode) params.set("code", "1");
  else params.delete("code");

  const next = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", next);
}

function loadQueryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";
  const repo = params.get("repo") || "";
  const lang = params.get("lang") || "";
  const code = params.get("code") === "1";

  state.query = q;
  state.repoFilter = repo;
  state.langFilter = lang;
  state.hasCode = code;

  $("#q").value = q;
  $("#repoFilter").value = repo;
  $("#langFilter").value = lang;
  $("#hasCode").checked = code;
}

function refresh() {
  applyFilters();
  renderTable();
  syncQueryToUrl();
}

async function init() {
  const res = await fetch("data/analysis.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load analysis.json: ${res.status}`);
  state.analysis = await res.json();
  state.allRecords = (state.analysis.records || []).map((r) => ({
    ...r,
    _search: buildSearchText(r),
  }));

  renderMeta();
  populateFilters();
  loadQueryFromUrl();

  // Apply once after URL state is loaded
  refresh();

  const onSearch = debounce(() => {
    state.query = $("#q").value;
    refresh();
  }, 120);

  $("#q").addEventListener("input", onSearch);
  $("#repoFilter").addEventListener("change", () => {
    state.repoFilter = $("#repoFilter").value;
    refresh();
  });
  $("#langFilter").addEventListener("change", () => {
    state.langFilter = $("#langFilter").value;
    refresh();
  });
  $("#hasCode").addEventListener("change", () => {
    state.hasCode = $("#hasCode").checked;
    refresh();
  });

  $("#reset").addEventListener("click", () => {
    state.query = "";
    state.repoFilter = "";
    state.langFilter = "";
    state.hasCode = false;

    $("#q").value = "";
    $("#repoFilter").value = "";
    $("#langFilter").value = "";
    $("#hasCode").checked = false;

    refresh();
  });
}

init().catch((err) => {
  console.error(err);
  $("#status").textContent = String(err);
  $("#status").style.color = "#ff6b6b";
});

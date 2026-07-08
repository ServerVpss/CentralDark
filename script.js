const API = "https://unlimited-ai-proxy.sportsmoments97.workers.dev";
const SK = "ua_chats", AK = "ua_active", MK = "ua_model", CK = "ua_collapse", TK = "ua_theme", MGK = "ua_merge", MEMK = "ua_memory";

const MODELS = [
  { id: "gateway-gpt-5", name: "GPT-5", provider: "openai", color: "#10a37f", tier: "flagship" },
  { id: "gateway-gpt-5-1", name: "GPT-5.1", provider: "openai", color: "#10a37f", tier: "flagship" },
  { id: "gateway-gpt-5-3", name: "GPT-5.3", provider: "openai", color: "#10a37f", tier: "flagship" },
  { id: "gateway-gpt-5-4", name: "GPT-5.4", provider: "openai", color: "#10a37f", tier: "flagship" },
  { id: "gateway-gpt-5-5", name: "GPT-5.5", provider: "openai", color: "#10a37f", tier: "flagship" },
  { id: "gateway-gpt-o3", name: "o3", provider: "openai", color: "#10a37f", tier: "reasoning" },
  { id: "gateway-gpt-o3-mini", name: "o3 Mini", provider: "openai", color: "#10a37f", tier: "reasoning" },
  { id: "gateway-gpt-o4-mini", name: "o4-mini", provider: "openai", color: "#10a37f", tier: "reasoning" },
  { id: "gateway-gpt-4o", name: "GPT-4o", provider: "openai", color: "#10a37f", tier: "standard" },
  { id: "gateway-gpt-4-1-mini", name: "GPT-4.1 Mini", provider: "openai", color: "#10a37f", tier: "fast" },
  { id: "gateway-gpt-4-1-nano", name: "GPT-4.1 Nano", provider: "openai", color: "#10a37f", tier: "fast" },
  { id: "gateway-gpt-5-mini", name: "GPT-5 Mini", provider: "openai", color: "#10a37f", tier: "fast" },
  { id: "gateway-gpt-5-nano", name: "GPT-5 Nano", provider: "openai", color: "#10a37f", tier: "fast" },
  { id: "gateway-gpt-5-online", name: "GPT-5 Online", provider: "openai", color: "#10a37f", tier: "standard" },
  { id: "gateway-claude-opus-4-7", name: "Claude Opus 4.7", provider: "anthropic", color: "#d97706", tier: "flagship" },
  { id: "gateway-claude-opus-4-6", name: "Claude Opus 4.6", provider: "anthropic", color: "#d97706", tier: "flagship" },
  { id: "gateway-claude-opus-4-5", name: "Claude Opus 4.5", provider: "anthropic", color: "#d97706", tier: "flagship" },
  { id: "gateway-claude-opus-4-1", name: "Claude Opus 4.1", provider: "anthropic", color: "#d97706", tier: "standard" },
  { id: "gateway-claude-sonnet-4", name: "Claude Sonnet 4", provider: "anthropic", color: "#d97706", tier: "standard" },
  { id: "gateway-claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "anthropic", color: "#d97706", tier: "standard" },
  { id: "gateway-google-2.5-pro", name: "Gemini 2.5 Pro", provider: "google", color: "#3b82f6", tier: "flagship" },
  { id: "gateway-gemini-3-pro", name: "Gemini 3 Pro", provider: "google", color: "#3b82f6", tier: "flagship" },
  { id: "gateway-gemini-3-1-pro", name: "Gemini 3.1 Pro", provider: "google", color: "#3b82f6", tier: "flagship" },
  { id: "gateway-gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google", color: "#3b82f6", tier: "fast" },
  { id: "gateway-deepseek-v4-pro", name: "DeepSeek V4 Pro", provider: "deepseek", color: "#06b6d4", tier: "flagship" },
  { id: "gateway-deepseek-v4-flash", name: "DeepSeek V4 Flash", provider: "deepseek", color: "#06b6d4", tier: "fast" },
  { id: "gateway-deepseek-r1", name: "DeepSeek R1", provider: "deepseek", color: "#06b6d4", tier: "reasoning" },
  { id: "gateway-deepseek-v3", name: "DeepSeek V3", provider: "deepseek", color: "#06b6d4", tier: "standard" },
  { id: "gateway-grok-4", name: "Grok 4", provider: "xai", color: "#ef4444", tier: "flagship" },
  { id: "gateway-grok-3", name: "Grok 3", provider: "xai", color: "#ef4444", tier: "standard" },
  { id: "gateway-qwen-3-max", name: "Qwen 3 Max", provider: "alibaba", color: "#8b5cf6", tier: "standard" },
  { id: "gateway-qwen-qwq-32b", name: "Qwen QwQ 32B", provider: "alibaba", color: "#8b5cf6", tier: "reasoning" },
  { id: "gateway-deepinfra-kimi-k2", name: "Kimi K2", provider: "moonshot", color: "#ec4899", tier: "standard" },
  { id: "gateway-llama-3-3-70b-versatile", name: "Llama 3.3 70B", provider: "meta", color: "#6366f1", tier: "standard" },
];

const PROVIDERS = {
  openai: { name: "OpenAI", color: "#10a37f" },
  anthropic: { name: "Anthropic", color: "#d97706" },
  google: { name: "Google", color: "#3b82f6" },
  deepseek: { name: "DeepSeek", color: "#06b6d4" },
  xai: { name: "xAI", color: "#ef4444" },
  alibaba: { name: "Alibaba", color: "#8b5cf6" },
  moonshot: { name: "Moonshot", color: "#ec4899" },
  meta: { name: "Meta", color: "#6366f1" },
};

const SUGGESTIONS = [
  { title: "Explain", desc: "Break down quantum computing simply" },
  { title: "Write code", desc: "Python web scraper with error handling" },
  { title: "Analyze", desc: "Find patterns in this dataset" },
  { title: "Create", desc: "Write a sci-fi story about AI" },
];

let chats = JSON.parse(localStorage.getItem(SK) || "{}");
let activeChatId = localStorage.getItem(AK) || null;
let currentModel = localStorage.getItem(MK) || "gateway-gpt-5-5";
let isStreaming = false;
let abortCtrl = null;
let mergeMode = localStorage.getItem(MGK) === "1";
let searchMode = localStorage.getItem("ua_search") === "1";
let memory = JSON.parse(localStorage.getItem(MEMK) || "[]");

function save() {
  localStorage.setItem(SK, JSON.stringify(chats));
  localStorage.setItem(AK, activeChatId || "");
  localStorage.setItem(MK, currentModel);
  localStorage.setItem(MGK, mergeMode ? "1" : "0");
  localStorage.setItem("ua_search", searchMode ? "1" : "0");
  localStorage.setItem(MEMK, JSON.stringify(memory));
}

function uuid() { return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function info(id) { return MODELS.find(m => m.id === (id || currentModel)) || { name: "AI", provider: "unknown", color: "#a78bfa", tier: "standard" }; }
function pInfo(key) { return PROVIDERS[key] || { name: "Unknown", color: "#a78bfa" }; }

function timeAgo(ts) {
  const d = Date.now() - ts;
  if (d < 60000) return "now";
  if (d < 3600000) return Math.floor(d / 60000) + "m";
  if (d < 86400000) return Math.floor(d / 3600000) + "h";
  return Math.floor(d / 86400000) + "d";
}

function rgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function esc(t) { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; }

function toast(msg, cls = "") {
  const c = document.getElementById("toast-container"), el = document.createElement("div");
  el.className = "toast " + cls; el.textContent = msg; c.appendChild(el);
  setTimeout(() => { el.style.animation = "tOut .25s forwards"; setTimeout(() => el.remove(), 250); }, 1800);
}

function copyTxt(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) { btn.classList.add("ok"); setTimeout(() => btn.classList.remove("ok"), 1200); }
    toast("Copied!", "ok");
  });
}

function formatCode(text) {
  if (!text) return "";
  return esc(text)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><div class="code-bar"><span>${lang || "code"}</span><button class="code-copy" onclick="copyTxt(this.closest('pre').querySelector('code').innerText,this)">Copy</button></div><code>${code.trim()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function updateBadge() {
  const b = document.getElementById("header-model-badge");
  if (searchMode) {
    b.textContent = "Search";
    b.style.background = rgba("#3b82f6", 0.1);
    b.style.color = "#3b82f6";
    b.style.border = `1px solid ${rgba("#3b82f6", 0.2)}`;
  } else if (mergeMode) {
    b.textContent = "Merge AI";
    b.style.background = rgba("#f59e0b", 0.1);
    b.style.color = "#f59e0b";
    b.style.border = `1px solid ${rgba("#f59e0b", 0.2)}`;
  } else {
    const i = info();
    b.textContent = i.name;
    b.style.background = rgba(i.color, 0.1);
    b.style.color = i.color;
    b.style.border = `1px solid ${rgba(i.color, 0.2)}`;
  }
  const dot = document.getElementById("input-model-dot");
  dot.style.background = searchMode ? "#3b82f6" : mergeMode ? "#f59e0b" : info().color;
  const placeholder = searchMode ? "Search the web..." : mergeMode ? "Message Merge AI..." : `Message ${info().name}...`;
  document.getElementById("user-input").placeholder = placeholder;
}

function renderModels() {
  const list = document.getElementById("model-list");
  list.innerHTML = "";
  const groups = {};
  MODELS.forEach(m => { if (!groups[m.provider]) groups[m.provider] = []; groups[m.provider].push(m); });

  Object.entries(groups).forEach(([pk, models]) => {
    const p = pInfo(pk);
    models.forEach(m => {
      const el = document.createElement("div");
      el.className = "model-item" + (m.id === currentModel && !mergeMode && !searchMode ? " active" : "");
      el.dataset.name = m.name.toLowerCase();
      el.dataset.provider = m.provider;
      el.innerHTML = `<span class="model-item-dot" style="background:${p.color}"></span><span class="model-item-name">${m.name}</span><span class="model-item-tier tier-${m.tier}">${m.tier}</span>`;
      el.onclick = () => selectModel(m.id);
      list.appendChild(el);
    });
  });
}

function filterModels(q) {
  const s = q.toLowerCase().trim();
  document.querySelectorAll(".model-item").forEach(el => {
    const show = !s || el.dataset.name.includes(s) || el.dataset.provider.includes(s);
    el.classList.toggle("hidden", !show);
  });
}

function selectModel(id) {
  mergeMode = false; searchMode = false;
  currentModel = id;
  save();
  renderModels();
  updateBadge();
  updateMergeUI(); updateSearchUI();
}

function toggleMerge() {
  mergeMode = !mergeMode;
  if (mergeMode) searchMode = false;
  save(); updateMergeUI(); updateSearchUI(); renderModels(); updateBadge();
  if (mergeMode) toast("Merge AI activated");
}

function updateMergeUI() {
  const sec = document.getElementById("merge-section");
  const toggle = document.getElementById("merge-toggle");
  const desc = sec.querySelector(".merge-desc");
  sec.classList.toggle("active", mergeMode);
  toggle.classList.toggle("on", mergeMode);
  toggle.textContent = mergeMode ? "ON" : "OFF";
  desc.classList.toggle("visible", mergeMode);
  if (mergeMode) {
    document.querySelectorAll(".model-item").forEach(el => el.classList.remove("active"));
  } else {
    renderModels();
  }
}

function toggleSearch() {
  searchMode = !searchMode;
  if (searchMode) mergeMode = false;
  save(); updateSearchUI(); updateMergeUI(); renderModels(); updateBadge();
  if (searchMode) toast("Web search enabled");
}

function updateSearchUI() {
  const sec = document.getElementById("search-section");
  if (!sec) return;
  const toggle = document.getElementById("search-toggle");
  const desc = sec.querySelector(".search-desc");
  sec.classList.toggle("active", searchMode);
  toggle.classList.toggle("on", searchMode);
  toggle.querySelector(".search-label").textContent = searchMode ? "ON" : "OFF";
  desc.classList.toggle("visible", searchMode);
  if (searchMode) {
    document.querySelectorAll(".model-item").forEach(el => el.classList.remove("active"));
  } else {
    renderModels();
  }
}



function renderChats() {
  const list = document.getElementById("chat-list");
  list.innerHTML = "";
  Object.values(chats).sort((a, b) => b.updated - a.updated).forEach(chat => {
    const el = document.createElement("div");
    el.className = "chat-item" + (chat.id === activeChatId ? " active" : "");
    const prev = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content.slice(0, 35) : "New chat";
    el.innerHTML = `<span class="chat-preview">${esc(prev)}</span><span class="chat-time">${timeAgo(chat.updated)}</span><button class="chat-delete">&times;</button>`;
    el.querySelector(".chat-preview").onclick = () => switchChat(chat.id);
    el.querySelector(".chat-delete").onclick = e => { e.stopPropagation(); deleteChat(chat.id); };
    list.appendChild(el);
  });
}

function deleteChat(id) {
  delete chats[id];
  if (activeChatId === id) activeChatId = null;
  save(); renderChats(); renderMessages(); toast("Deleted");
}

function switchChat(id) {
  activeChatId = id; save(); renderChats(); renderMessages(); closeMobile();
}

function newChat() {
  const id = uuid();
  chats[id] = { id, title: "New Chat", messages: [], updated: Date.now() };
  activeChatId = id; save(); renderChats(); renderMessages(); closeMobile();
  document.getElementById("user-input").focus();
}

function renderMessages() {
  const c = document.getElementById("messages");
  const chat = activeChatId ? chats[activeChatId] : null;

  if (!chat) {
    const pGrid = Object.entries(PROVIDERS).map(([k, p]) => {
      const cnt = MODELS.filter(m => m.provider === k).length;
      return `<div class="provider-card" style="--pc:${p.color}" onclick="selectModel('${MODELS.find(m => m.provider === k).id}')"><div class="provider-dot" style="background:${p.color}"></div><div class="provider-name">${p.name}</div><div class="provider-count">${cnt} model${cnt > 1 ? "s" : ""}</div></div>`;
    }).join("");

    const sGrid = SUGGESTIONS.map(s =>
      `<div class="suggest" onclick="useSug('${esc(s.desc)}')"><div class="suggest-title">${s.title}</div><div class="suggest-desc">${s.desc}</div></div>`
    ).join("");

    c.innerHTML = `
      <div class="welcome">
        <div class="welcome-icon"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
        <h2>Unlimited AI</h2>
        <p>34 models from 8 providers. Free, no account, unlimited.</p>
        <div class="provider-grid">${pGrid}</div>
        <div class="merge-card" onclick="toggleMerge()">
          <div class="merge-card-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg> Unlimited Merge AI</div>
          <div class="merge-card-desc">Combines GPT-5.5 + Claude Opus 4.7 + Gemini 2.5 Pro, then synthesizes via o3</div>
        </div>
        <div class="suggestion-grid">${sGrid}</div>
        <div class="hint">Pick a provider, model, or enable Merge AI</div>
      </div>`;
    document.getElementById("chat-title").textContent = "Unlimited AI";
    return;
  }

  document.getElementById("chat-title").textContent = chat.title || "New Chat";
  c.innerHTML = "";
  chat.messages.forEach(msg => addMsg(msg.role, msg.content, msg.model, msg.timestamp, msg.sources, msg.reasoning, false));
  c.scrollTop = c.scrollHeight;
}

function addMsg(role, content, model, timestamp, sources, reasoning, animate = true) {
  const c = document.getElementById("messages");
  const w = c.querySelector(".welcome");
  if (w) w.remove();
  const div = document.createElement("div");
  const i = info(model);
  const p = pInfo(i.provider);
  const isMerge = model === "__merge__";
  const isSearch = model === "__search__";
  div.className = "message " + role + (isMerge ? " merge-mode" : "") + (isSearch ? " search-mode" : "");
  if (!isMerge && !isSearch && role === "assistant") div.style.setProperty("--mc", p.color);
  if (!animate) div.style.animation = "none";
  let av, name;
  if (role === "user") {
    av = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    name = "You";
  } else if (isSearch) {
    av = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';
    name = "Web Search";
  } else if (isMerge) {
    av = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>';
    name = "Merge AI";
  } else {
    av = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';
    name = i.name;
  }
  const time = timestamp ? timeAgo(timestamp) : "";
  let reasoningHtml = "";
  if (reasoning) {
    const cleanR = reasoning.replace(/^(<thinking>|<reasoning>|\*\*reasoning:?\*\*|\*\*thinking:?\*\*|reasoning:|thinking:)\s*/i, "").replace(/(<\/thinking>|<\/reasoning>)\s*$/i, "");
    reasoningHtml = '<details class="reasoning-block"><summary class="reasoning-summary"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> Reasoning</summary><div class="reasoning-content">' + formatCode(cleanR) + '</div></details>';
  }
  const actions = role === "assistant" && content ? '<div class="msg-actions"><button class="msg-act" onclick="copyTxt(this.closest(\'.msg-body\').querySelector(\'.msg-content\').innerText,this)" title="Copy"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button></div>' : "";
  div.innerHTML = '<div class="msg-avatar">' + av + '</div><div class="msg-body"><div class="msg-role">' + name + (time ? '<span class="msg-time">' + time + '</span>' : "") + '</div>' + reasoningHtml + '<div class="msg-content">' + formatCode(content) + '</div>' + actions + '</div>';
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
  return div.querySelector(".msg-content");
}

function addTyping() {
  const c = document.getElementById("messages");
  const div = document.createElement("div");
  const isM = mergeMode;
  const isS = searchMode;
  div.className = "message assistant" + (isM ? " merge-mode" : "") + (isS ? " search-mode" : "");
  div.id = "typing-msg";
  if (isS) div.style.setProperty("--mc", "#3b82f6");
  else if (isM) div.style.setProperty("--mc", "#f59e0b");
  else div.style.setProperty("--mc", pInfo(info().provider).color);
  let av, name;
  if (isS) {
    av = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';
    name = "Web Search";
  } else if (isM) {
    av = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>';
    name = "Merge AI";
  } else {
    av = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';
    name = info().name;
  }
  div.innerHTML = '<div class="msg-avatar">' + av + '</div><div class="msg-body"><div class="msg-role">' + name + '</div><div class="msg-content"><div class="typing"><span></span><span></span><span></span></div></div></div>';
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

function removeTyping() { const el = document.getElementById("typing-msg"); if (el) el.remove(); }

function stopStream() {
  if (abortCtrl) { abortCtrl.abort(); abortCtrl = null; }
  removeTyping();
  document.querySelector(".msg-content.streaming")?.classList.remove("streaming");
  isStreaming = false;
  document.getElementById("send-btn").disabled = false;
  document.getElementById("stop-btn").classList.add("hidden");
  document.getElementById("input-status").classList.remove("visible");
  toast("Stopped", "err");
}

function useSug(text) {
  document.getElementById("user-input").value = text;
  sendMsg();
}

async function extractMemory(chat) {
  if (chat.messages.length < 2) return;
  const lastTwo = chat.messages.slice(-2);
  try {
    const resp = await fetch(API + "/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation: lastTwo, existingMemory: memory }),
    });
    const data = await resp.json();
    if (data.facts && data.facts.length > 0) {
      memory = [...new Set([...memory, ...data.facts])].slice(-50);
      save();
      updateMemoryUI();
    }
  } catch {}
}

function buildContextMessage(text) {
  if (memory.length === 0) return text;
  const memStr = memory.slice(-15).map(f => "- " + f).join("\n");
  return `[System: Remember these facts about the user for context:\n${memStr}\n\nUser message: ${text}]`;
}

async function sendMsg() {
  const inp = document.getElementById("user-input");
  const text = inp.value.trim();
  if (!text || isStreaming) return;

  if (!activeChatId) newChat();
  const chat = chats[activeChatId];
  if (!chat) return;

  const model = searchMode ? "__search__" : mergeMode ? "__merge__" : currentModel;
  const ts = Date.now();

  chat.messages.push({ role: "user", content: text, model, timestamp: ts });
  chat.updated = ts;
  if (chat.messages.length === 1) chat.title = text.slice(0, 40);
  save(); renderChats();

  inp.value = ""; inp.style.height = "auto";
  addMsg("user", text, model, ts, null, null);

  isStreaming = true;
  document.getElementById("send-btn").disabled = true;
  document.getElementById("stop-btn").classList.remove("hidden");
  addTyping();

  abortCtrl = new AbortController();

  let content = ''; let reasoning = ''; try {
      const endpoint = searchMode ? "/api/search" : mergeMode ? "/api/merge" : "/api/chat"; const contextText = buildContextMessage(text); const body = searchMode ? { query: text } : mergeMode ? { message: contextText } : { message: contextText, model: currentModel };

    const resp = await fetch(API + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: abortCtrl.signal,
    });

    removeTyping();

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      addMsg("assistant", "Error: " + (err.error || "Unknown"), model, Date.now(), null, null);
      isStreaming = false; document.getElementById("send-btn").disabled = false;
      document.getElementById("stop-btn").classList.add("hidden");
      return;
    }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let sources = [];
      const aiTs = Date.now();

      if (mergeMode || searchMode) {
      const statusEl = document.getElementById("input-status");
      statusEl.classList.add("visible");
      const modeModel = searchMode ? "__search__" : "__merge__";
      const contentEl = addMsg("assistant", "", modeModel, aiTs, [], null);
      contentEl.classList.add("streaming");
      let searchSources = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (!d) continue;
          try {
            const p = JSON.parse(d);
            if (p.status) statusEl.textContent = p.status;
            if (p.results) { searchSources = p.results; statusEl.textContent = "Reading sources..."; }
            if (p.delta) { content += p.delta; contentEl.innerHTML = formatCode(content); }
            if (p.reasoning) {
              reasoning = p.reasoning;
              if (p.answer) { content = p.answer; contentEl.innerHTML = formatCode(content); }
              const msgBody = contentEl.closest(".msg-body");
              if (msgBody && !msgBody.querySelector(".reasoning-block")) {
                const roleEl = msgBody.querySelector(".msg-role");
                const details = document.createElement("details");
                details.className = "reasoning-block";
                details.innerHTML = '<summary class="reasoning-summary"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> Reasoning</summary><div class="reasoning-content">' + formatCode(reasoning) + '</div></details>';
                roleEl.after(details);
              }
            }
            if (p.sources && p.sources.length > 0) {
              const msgBody = contentEl.closest(".msg-body");
              if (msgBody) {
                let srcHtml = '<div class="search-sources"><div class="search-sources-title"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Sources</div>';
                for (const s of p.sources) {
                  srcHtml += '<a class="search-source-link" href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a>';
                }
                srcHtml += '</div>';
                const roleEl = msgBody.querySelector(".msg-role");
                if (roleEl) roleEl.insertAdjacentHTML("afterend", srcHtml);
              }
            }
            if (p.error) { content = "Error: " + p.error; contentEl.innerHTML = formatCode(content); }
            if (p.done) contentEl.classList.remove("streaming");
          } catch {}
        }
        document.getElementById("messages").scrollTop = 999999;
      }
      contentEl.classList.remove("streaming");
      statusEl.classList.remove("visible");
      if (content) {
        chat.messages.push({ role: "assistant", content, model: modeModel, timestamp: aiTs, reasoning: reasoning || undefined });
        chat.updated = Date.now(); save();
      }
    } else {
      const contentEl = addMsg("assistant", "", model, aiTs, null, null);
      contentEl.classList.add("streaming");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (!d) continue;
          try {
            const p = JSON.parse(d);
            if (p.delta) { content += p.delta; contentEl.innerHTML = formatCode(content); }
            else if (p.reasoning) {
              reasoning = p.reasoning;
              if (p.answer) { content = p.answer; contentEl.innerHTML = formatCode(content); }
              const msgBody = contentEl.closest(".msg-body");
              if (msgBody && !msgBody.querySelector(".reasoning-block")) {
                const roleEl = msgBody.querySelector(".msg-role");
                const details = document.createElement("details");
                details.className = "reasoning-block";
                details.innerHTML = '<summary class="reasoning-summary"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> Reasoning</summary><div class="reasoning-content">' + formatCode(reasoning) + '</div></details>';
                roleEl.after(details);
              }
            }
            else if (p.error) { content += (content ? "\n\n" : "") + "Error: " + p.error; contentEl.innerHTML = formatCode(content); toast(p.error, "err"); }
            else if (p.done) { contentEl.classList.remove("streaming"); }
          } catch {}
        }
        document.getElementById("messages").scrollTop = 999999;
      }
      contentEl.classList.remove("streaming");
      if (content) {
        chat.messages.push({ role: "assistant", content, model, timestamp: aiTs, reasoning: reasoning || undefined });
        chat.updated = Date.now(); save();
      }
    }} catch (err) {
    removeTyping();
    if (err.name !== "AbortError") {
      addMsg("assistant", "Connection error: " + err.message, currentModel, Date.now(), null, null);
      toast("Connection error", "err");
    }
  }

  isStreaming = false; abortCtrl = null;
  document.getElementById("send-btn").disabled = false;
  document.getElementById("stop-btn").classList.add("hidden");
  document.getElementById("input-status").classList.remove("visible");

  if (content && activeChatId && chats[activeChatId]) {
    extractMemory(chats[activeChatId]);
  }
}

function closeMobile() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebar-overlay").classList.remove("active");
}

function updateMemoryUI() {
  const el = document.getElementById("memory-count");
  if (el) el.textContent = memory.length + " memor" + (memory.length === 1 ? "y" : "ies");
}

function clearMemory() {
  if (memory.length === 0) return;
  if (confirm("Clear all memories?")) {
    memory = [];
    save();
    updateMemoryUI();
    toast("Memory cleared");
  }
}

function initBg() {
  const cv = document.getElementById("bg-canvas"), ctx = cv.getContext("2d");
  let w, h, pts = [];
  function resize() { w = cv.width = innerWidth; h = cv.height = innerHeight; }
  resize(); addEventListener("resize", resize);
  const cols = [[167,139,250],[245,158,11],[59,130,246],[236,72,153],[6,182,212],[99,102,241]];
  for (let i = 0; i < 50; i++) {
    const c = cols[~~(Math.random() * cols.length)];
    pts.push({ x: Math.random()*w, y: Math.random()*h, vx: (Math.random()-.5)*.25, vy: (Math.random()-.5)*.25, r: Math.random()*1.2+.4, a: Math.random()*.35+.04, c });
  }
  (function draw() {
    ctx.clearRect(0, 0, w, h);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${p.a})`; ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx*dx+dy*dy);
      if (d < 100) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(${pts[i].c},${.025*(1-d/100)})`; ctx.lineWidth = .4; ctx.stroke(); }
    }
    requestAnimationFrame(draw);
  })();
}

function initOrbs() {
  [[167,139,250,".08",350,"top:-80px;right:-80px"],[245,158,11,".05",280,"bottom:-40px;left:8%,-7"],[59,130,246,".04",220,"top:28%;right:18%,-12"],[236,72,153,".03",180,"top:58%;left:28%,-4"]].forEach(([r,g,b,a,sz,pos]) => {
    const [p,dl] = pos.split(","); const el = document.createElement("div"); el.className = "glow-orb";
    el.style.cssText = `width:${sz}px;height:${sz}px;background:radial-gradient(circle,rgba(${r},${g},${b},${a}),transparent 70%);${p};${dl?`animation-delay:${dl}s;`:``}`;
    document.body.appendChild(el);
  });
}

function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem(TK, document.body.classList.contains("light") ? "1" : "0");
}

function init() {
  if (localStorage.getItem(TK) === "1") document.body.classList.add("light");

  renderModels(); updateBadge(); renderChats(); renderMessages();
  updateMergeUI(); updateSearchUI(); updateMemoryUI(); initBg(); initOrbs();

  document.getElementById("send-btn").onclick = sendMsg;
  document.getElementById("stop-btn").onclick = stopStream;
  document.getElementById("new-chat-btn").onclick = newChat;
  document.getElementById("theme-toggle").onclick = toggleTheme;

  document.getElementById("sidebar-toggle").onclick = () => {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("sidebar-overlay").classList.add("active");
  };
  document.getElementById("sidebar-close").onclick = closeMobile;
  document.getElementById("sidebar-overlay").onclick = closeMobile;

  document.getElementById("user-input").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  });
  document.getElementById("user-input").addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 180) + "px";
  });
  document.getElementById("model-search").addEventListener("input", function () { filterModels(this.value); });

  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "n") { e.preventDefault(); newChat(); }
  });
}

init();

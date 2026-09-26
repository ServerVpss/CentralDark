/* No-flash theme init: a saved choice wins, else the OS preference.
Runs before paint so light mode never flashes dark on load. */
(function () {
try {
var t = localStorage.getItem('theme');
if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
} catch (e) {}
})();
Hermes Agent: o guia de referência para profissionais (2026)
{
"@context": "https://schema.org",
"@graph": [
{
"@type": "WebSite",
"@id": "https://blakecrosley.com/#website",
"url": "https://blakecrosley.com/",
"name": "Blake Crosley",
"description": "Designer, developer, dad. Portfolio of Blake Crosley, CTO at Introl building AI infrastructure.",
"publisher": {
"@id": "https://blakecrosley.com/#person"
},
"potentialAction": {
"@type": "SearchAction",
"target": {
"@type": "EntryPoint",
"urlTemplate": "https://blakecrosley.com/search?q={search_term_string}"
},
"query-input": "required name=search_term_string"
},
"inLanguage": "pt-BR"
},
{
"@type": "Person",
"@id": "https://blakecrosley.com/#person",
"name": "Blake Crosley",
"url": "https://blakecrosley.com/",
"image": {
"@type": "ImageObject",
"url": "https://blakecrosley.com/static/images/blake-crosley.jpg",
"width": 800,
"height": 800
},
"sameAs": [
"https://github.com/blakecrosley",
"https://x.com/blakecrosley",
"https://www.linkedin.com/in/blakecrosley/",
"https://www.instagram.com/dream_of_electric/",
"https://941apps.com",
"https://dreamofelectric.com",
"https://introl.com/blog/local-llm-hardware-pricing-guide-2025",
"https://introl.com/blog/deepseek-v3-2-open-source-ai-cost-advantage",
"https://introl.com/blog/google-tpu-architecture-complete-guide-7-generations",
"https://introl.com/blog/h100-vs-h200-vs-b200-choosing-the-right-nvidia-gpus-for-your-ai-workload",
"https://introl.com/blog/nvidia-vera-rubin-gpu-600kw-racks-2027",
"https://introl.com/blog/smr-nuclear-power-ai-data-centers-2025",
"https://introl.com/blog/deepseek-mhc-architecture-breakthrough",
"https://introl.com/blog/gpu-memory-pooling-sharing-multi-tenant-kubernetes-2025",
"https://introl.com/blog/ray-clusters-distributed-ai-computing-infrastructure-guide-2025",
"https://resumegeni.com",
"https://resumegeni.com/about/blake-crosley",
"https://wayofyawara.com"
],
"jobTitle": "Chief Technology Officer",
"hasOccupation": [
{
"@type": "Occupation",
"name": "Chief Technology Officer",
"occupationLocation": {
"@type": "City",
"name": "Pasadena, California"
},
"skills": ["AI Infrastructure", "GPU Computing", "Technical Leadership", "Product Strategy"]
},
{
"@type": "Occupation",
"name": "Product Designer",
"skills": ["Design Systems", "User Research", "Prototyping", "iOS Development"]
},
{
"@type": "Occupation",
"name": "iOS Developer",
"skills": ["SwiftUI", "SwiftData", "iOS 26+", "HealthKit", "StoreKit"]
}
],
"worksFor": {
"@type": "Organization",
"name": "Introl",
"url": "https://introl.com",
"description": "GPU cluster deployments and AI infrastructure"
},
"affiliation": {
"@type": "Organization",
"name": "941 Apps",
"url": "https://941apps.com",
"description": "iOS apps and digital products"
},
"alumniOf": {
"@type": "Organization",
"name": "ZipRecruiter",
"url": "https://ziprecruiter.com",
"description": "NYSE-listed employment marketplace"
},
"knowsAbout": [
"Product Design",
"User Experience Design",
"iOS Development",
"SwiftUI",
"Branding",
"Design Leadership",
"Claude Code",
"AI-Assisted Development",
"Midjourney",
"AI Image Generation",
"Design Principles",
"FastAPI",
"Python",
"GPU Computing",
"AI Infrastructure",
"NVIDIA GPUs",
"Distributed Systems",
"LLM Hardware",
"Kubernetes",
"Ray Clusters",
"Applicant Tracking Systems",
"Resume Optimization",
"Hiring Technology",
"Recruiter Workflows",
"Job Search UX",
"ATS Parsing"
],
"address": {
"@type": "PostalAddress",
"addressLocality": "Pasadena",
"addressRegion": "CA",
"addressCountry": "US"
}
}
]
}
(function(){var f=function(){document.body.dataset.guide='hermes';};document.body?f():document.addEventListener('DOMContentLoaded',f);})();
{
"@context": "https://schema.org",
"@type": "TechArticle",
"@id": "https://blakecrosley.com/pt-BR/guides/hermes#article",
"headline": "Hermes Agent: o guia de referência para profissionais (2026)",
"description": "Um guia de referência para profissionais sobre o Hermes Agent, o agente de IA de código aberto e autoaperfeiçoável da Nous Research: autenticação de provedores e OAuth, arquivos de configuração, sistema de skills e execução como gateway de mensagens multiplataforma.",
"author": {
"@id": "https://blakecrosley.com/#person"
},
"publisher": {
"@id": "https://blakecrosley.com/#person"
},
"datePublished": "2026-08-07",
"dateModified": "2026-07-22",
"mainEntityOfPage": {
"@type": "WebPage",
"@id": "https://blakecrosley.com/pt-BR/guides/hermes"
},
"keywords": ["Hermes Agent", "Nous Research", "AI agents", "multi-provider LLM", "OpenClaw", "self-improving agent", "agent SDK", "MCP", "skill evolution", "CLI agent"],
"articleSection": "Guides",
"inLanguage": "pt-BR",
"isAccessibleForFree": true,
"proficiencyLevel": "Beginner to Advanced"
}
{
"@context": "https://schema.org",
"@type": "FAQPage",
"@id": "https://blakecrosley.com/pt-BR/guides/hermes#faq",
"mainEntity": [
{
"@type": "Question",
"name": "How do I sign into a different AI provider in Hermes Agent?",
"acceptedAnswer": {
"@type": "Answer",
"text": "Hermes has three auth paths. Path 1: API key in ~/.hermes/.env for providers like OpenRouter, z.ai, Kimi, MiniMax, DeepSeek, Hugging Face, and Google. Path 2: OAuth via hermes model or hermes auth for Nous Portal, OpenAI Codex, GitHub Copilot, and Anthropic — credentials are stored in ~/.hermes/auth.json. Path 3: custom endpoint in config.yaml for any OpenAI-compatible server like Ollama, vLLM, SGLang, llama.cpp, or LM Studio. Run hermes model interactively to walk through all options."
}
},
{
"@type": "Question",
"name": "What is Hermes Agent and how is it different from Claude Code?",
"acceptedAnswer": {
"@type": "Answer",
"text": "Hermes Agent is an open-source self-improving AI agent from Nous Research. Unlike Claude Code which is locked to Anthropic models, Hermes works with any OpenAI-compatible provider — Nous Portal, OpenRouter, Anthropic, GitHub Copilot, z.ai, Kimi, MiniMax, DeepSeek, Hugging Face, Google, or your own self-hosted endpoint. Hermes also ships a messaging gateway for Telegram, Discord, Slack, WhatsApp, Signal, and more that Claude Code does not have."
}
},
{
"@type": "Question",
"name": "How do I switch models mid-conversation without losing history?",
"acceptedAnswer": {
"@type": "Answer",
"text": "Use /model provider:model inside an active session. Hermes persists the conversation, memory, and skills across the switch. Examples: /model zai:glm-5, /model openrouter:anthropic/claude-sonnet-4, /model custom:local:qwen-2.5 for a named custom provider. /model custom with no model name auto-detects the model from a local endpoint's /v1/models API."
}
},
{
"@type": "Question",
"name": "Can I run Hermes Agent with a local LLM like Ollama or vLLM?",
"acceptedAnswer": {
"@type": "Answer",
"text": "Yes. Hermes works with any OpenAI-compatible API endpoint — Ollama, vLLM, SGLang, llama.cpp, LM Studio, LocalAI, Jan, or your own server. Run hermes model, select Custom endpoint, enter the base URL (e.g., http://localhost:11434/v1 for Ollama) and model name. Hermes handles context length detection automatically, but watch out for low defaults on Ollama (4k) and LM Studio (2048) — raise to at least 16k-32k for agent use."
}
},
{
"@type": "Question",
"name": "What is SOUL.md and how does it relate to AGENTS.md?",
"acceptedAnswer": {
"@type": "Answer",
"text": "SOUL.md is the agent's primary identity — tone, voice, communication style, personality-level behavior. It lives at ~/.hermes/SOUL.md and occupies slot #1 in every system prompt. AGENTS.md is project-specific — architecture, conventions, commands, paths — and lives in your project directory. The rule: if it should follow you everywhere, it belongs in SOUL.md. If it belongs to a project, it belongs in AGENTS.md."
}
}
]
}
{
"@context": "https://schema.org",
"@type": "BreadcrumbList",
"itemListElement": [
{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://blakecrosley.com/"},
{"@type": "ListItem", "position": 2, "name": "Guides", "item": "https://blakecrosley.com/guides/"},
{"@type": "ListItem", "position": 3, "name": "Hermes Agent: o guia de referência para profissionais (2026)"}
]
}
Pular para o conteúdo
Blake Crosley
<button type="button"
class="language-switcher-trigger language-mobile-btn"
@click="langOpen = !langOpen; navOpen = false"
:aria-expanded="langOpen">
Português
<svg class="language-switcher-icon" :class="{ 'rotated': langOpen }"
xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
fill="none" stroke="currentColor" stroke-width="2">
<button
class="nav__toggle"
@click="navOpen = !navOpen; langOpen = false"
x-bind:aria-expanded="navOpen"
x-bind:class="navOpen ? 'nav__toggle is-open' : 'nav__toggle'"
aria-label="Toggle navigation"
>
Sobre
Trabalho
Textos
Guias
Fun
Contato
<button type="button" class="theme-toggle" aria-label="Toggle light and dark mode" title="Toggle light/dark"
onclick="(function(){var d=document.documentElement;if(d.getAttribute('data-theme')==='light'){d.removeAttribute('data-theme');try{localStorage.setItem('theme','dark')}catch(e){}}else{d.setAttribute('data-theme','light');try{localStorage.setItem('theme','light')}catch(e){}}})()">
<div class="language-switcher"
x-data="{ open: false }"
@click.away="open = false"
@keydown.escape.window="open = false">
<button type="button"
class="language-switcher-trigger"
@click="open = !open"
:aria-expanded="open"
aria-haspopup="listbox"
aria-label="Selecionar idioma">
Português
<svg class="language-switcher-icon"
:class="{ 'rotated': open }"
xmlns="http://www.w3.org/2000/svg"
width="16" height="16"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round">
<ul class="language-switcher-menu"
role="listbox"
:class="{ 'is-open': open }"
:aria-hidden="!open"
x-cloak><li role="option"
class="language-option"
:aria-selected="false">
<a href="/guides/hermes"
hreflang="en"
@click.prevent="document.cookie = 'locale=en; path=/; max-age=31536000; SameSite=Lax; Secure'; window.location.href = $el.href"
class="language-option-link">
English
<li role="option"
class="language-option"
:aria-selected="false">
<a href="/zh-Hans/guides/hermes"
hreflang="zh-Hans"
@click.prevent="document.cookie = 'locale=zh-Hans; path=/; max-age=31536000; SameSite=Lax; Secure'; window.location.href = $el.href"
class="language-option-link">
简体中文
<li role="option"
class="language-option"
:aria-selected="false">
<a href="/zh-Hant/guides/hermes"
hreflang="zh-Hant"
@click.prevent="document.cookie = 'locale=zh-Hant; path=/; max-age=31536000; SameSite=Lax; Secure'; window.location.href = $el.href"
class="language-option-link">
繁體中文
<li role="option"
class="language-option"
:aria-selected="false">
<a href="/fr/guides/hermes"
hreflang="fr"

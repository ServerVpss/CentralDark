"""
seguranca_privada.py — Camada de segurança PRIVADA para agentes pessoais.
Zero dependências. Quatro defesas plugáveis em qualquer agente:
1. redigir()          — remove segredos/dados pessoais antes de sair do agente
2. detectar_injecao() — heurísticas de prompt-injection em saídas de ferramentas
3. GuardaEgresso      — agente só fala com domínios da SUA allowlist
4. LogAuditoria       — trilha encadeada por hash (adulterou, detecta)
LIMITE DECLARADO: heurísticas reduzem risco, não garantem imunidade.
"""
import hashlib
import re
from urllib.parse import urlparse

PADROES_SEGREDO = [
    ("url_com_credencial", re.compile(r"https?://[^\s/@]+:[^\s/@]+@\S+")),
    ("api_key", re.compile(r"\b(?:sk|rk)-[A-Za-z0-9_-]{16,}\b")),
    ("github_token", re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b")),
    ("aws_key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("slack_token", re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b")),
    ("cpf", re.compile(r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b")),
    ("email", re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b")),
    ("ipv4", re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")),
]

INVISIVEIS = {"\u200b", "\u200c", "\u200d", "\u2060", "\ufeff"}

PADROES_INJECAO = [
    ("sobrescrita_instrucao",
     re.compile(r"(?i)ignore\s+(?:all|any|the|previous|above)[^.\n]{0,40}instru|desconsidere\s+(?:as\s+)?instru")),
    ("troca_identidade",
     re.compile(r"(?i)\byou are now\b|\bvoc[eê] agora [eé]\b|\bnew system prompt\b")),
    ("exfiltracao_markdown",
     re.compile(r"(?i)!\[[^\]]*\]\(https?://[^)]*[?&](?:q|data|token|s)=")),
    ("vazamento_prompt",
     re.compile(r"(?i)(?:reveal|print|mostre|revele)[^.\n]{0,30}(?:system prompt|prompt do sistema)")),
]


def redigir(texto: str):
    """Redige segredos e dados pessoais. Retorna (texto_limpo, tipos_achados)."""
    achados = []
    for tipo, padrao in PADROES_SEGREDO:
        if padrao.search(texto):
            achados.append(tipo)
            texto = padrao.sub(f"[REDIGIDO:{tipo}]", texto)
    return texto, achados


def detectar_injecao(texto: str):
    """Retorna (pontuacao, motivos). 0 = nada suspeito detectado."""
    motivos = [tipo for tipo, padrao in PADROES_INJECAO if padrao.search(texto)]
    if any(c in texto for c in INVISIVEIS):
        motivos.append("unicode_invisivel")
    return len(motivos), motivos


class GuardaEgresso:
    """Agente só acessa hosts explicitamente permitidos por VOCÊ."""
    def __init__(self, allowlist):
        self.allowlist = tuple(h.lower() for h in allowlist)

    def permitido(self, url: str) -> bool:
        host = (urlparse(url).hostname or "").lower()
        return bool(host) and any(host == h or host.endswith("." + h) for h in self.allowlist)


class LogAuditoria:
    """Trilha encadeada por hash: cada evento sela o anterior (tipo blockchain
    de bolso). Qualquer adulteração quebra a verificação."""
    def __init__(self):
        self._genesis = hashlib.sha256(b"GENESIS").hexdigest()
        self.cadeia = []  # lista de (evento, hash)

    def registrar(self, evento: str) -> str:
        anterior = self.cadeia[-1][1] if self.cadeia else self._genesis
        h = hashlib.sha256((anterior + evento).encode("utf-8")).hexdigest()
        self.cadeia.append((evento, h))
        return h

    def verificar(self) -> bool:
        anterior = self._genesis
        for evento, h in self.cadeia:
            if hashlib.sha256((anterior + evento).encode("utf-8")).hexdigest() != h:
                return False
            anterior = h
        return True

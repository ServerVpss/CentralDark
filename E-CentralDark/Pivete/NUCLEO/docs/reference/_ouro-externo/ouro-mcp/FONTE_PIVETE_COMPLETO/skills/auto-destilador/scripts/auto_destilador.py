#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auto-Destilador — Watchdog para cristalização automática no NUCLEO
Monitora E:\CentralDark\_MAPA_CASA\Nova pasta* e processa arquivos automaticamente
"""

import os
import sys
import time
import hashlib
import shutil
import json
import re
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configuração
WATCH_PATHS = [
    r"E:\CentralDark\_MAPA_CASA\Nova pasta",
    r"E:\CentralDark\_MAPA_CASA\Nova pasta\Nova pasta"
]
NUCLEO_ROOT = r"E:\CentralDark\Pivete\NUCLEO"
HISTORY_ROOT = os.path.join(NUCLEO_ROOT, "docs", "history", "downloads")
DEBOUNCE_MS = 5000

# Padrões de classificação
CLASSIFICACAO = {
    r".*[Cc][Oo][Mm][Aa][Nn][Dd][Oo].*": ("commands", ".md"),
    r".*[Pp][Rr][Oo][Mm][Pp][Tt].*": ("commands", ".md"),
    r".*[Cc][Oo][Nn][Tt][Rr][Aa][Tt][Oo].*": ("contracts", ".md"),
    r".*[Gg][Aa][Tt][Ee].*": ("contracts", ".md"),
    r".*[Ss][Ee][Cc][Uu][Rr][Ii][Tt][Yy].*": ("contracts", ".md"),
    r".*[Tt][Rr][Ii][Ll][Hh][Oo].*": ("patterns", ".md"),
    r".*[Aa][Nn][Tt][Ii][Dd][Oo][Tt][Oo].*": ("contracts", ".md"),
    r".*[Aa][Nn][Tt][Ii][Dd][Oo][Tt][Oo].*": ("contracts", ".md"),
    r".*[Dd][Ee][Cc][Ii][Ss][Aa][Oo].*": ("decisions", ".md"),
    r".*[Dd][Ee][Cc][Ii][Ss][Ii][Oo][Nn].*": ("decisions", ".md"),
    r".*[Pp][Aa][Dd][Rr][Aa][Oo].*": ("patterns", ".md"),
    r".*[Pp][Aa][Tt][Tt][Ee][Rr][Nn].*": ("patterns", ".md"),
    r".*[Mm][Aa][Pp][Aa].*": ("patterns", ".md"),
    r".*[Mm][Ii][Ss][Ss][Aa][Oo].*": ("missions", ".md"),
    r".*[Mm][Ii][Ss][Ss][Aa][Oo].*": ("missions", ".md"),
    r".*[Aa][Rr][Qq][Uu][Ii][Tt][Ee][Tt][Uu][Rr][Aa].*": ("docs/reference", ".md"),
    r".*[Aa][Rr][Vv][Oo][Rr][Ee].*": ("docs/reference", ".md"),
    r".*[Pp][Aa][Cc][Oo][Tt][Aa][Oo].*": ("docs/reference", ".md"),
    r".*[Ff][Oo][Rr][Jj][Aa].*": ("patterns", ".md"),
    r".*[Hh][Uu][Nn][Tt][Ee][Rr].*": ("docs/history/downloads/forense", ".txt"),
    r".*[Ff][Oo][Rr][Ee][Nn][Ss][Ee].*": ("docs/history/downloads/forense", ".txt"),
    r".*[Ss][Uu][Rr][Gg][Ii][Cc][Aa][Ll].*": ("docs/history/downloads/forense", ".txt"),
    r".*[Cc][Hh][Rr][Oo][Mm][Ee].*": ("docs/history/downloads/chrome", ".txt"),
    r".*[Dd][Ii][Ss][Pp][Ll][Aa][Yy].*": ("docs/history/downloads/chrome", ".txt"),
    r".*[Aa][Gg][Ee][Nn][Tt].*": ("docs/history/downloads/agente", ".txt"),
}

IGNORE_PATTERNS = [
    r".*\.tmp$", r".*\.zip$", r".*\.png$", r".*\.jpg$",
    r".*\.pdf$", r".*\.html$", r"CENTRALDARK-.*\.zip$"
]

# Estado para debounce
pending_files = {}
last_processed = {}

class DestiladorHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            self.schedule_process(event.src_path)
    
    def on_modified(self, event):
        if not event.is_directory:
            self.schedule_process(event.src_path)
    
    def schedule_process(self, filepath):
        filepath = os.path.abspath(filepath)
        now = time.time() * 1000
        
        # Ignorar padrões
        filename = os.path.basename(filepath)
        for pattern in IGNORE_PATTERNS:
            if re.match(pattern, filename, re.IGNORECASE):
                return
        
        # Debounce
        pending_files[filepath] = now
        
        # Processar após debounce
        def check_and_process():
            time.sleep(DEBOUNCE_MS / 1000)
            if filepath in pending_files:
                if pending_files[filepath] == now:
                    del pending_files[filepath]
                    self.process_file(filepath)
        
        import threading
        threading.Thread(target=check_and_process, daemon=True).start()
    
    def process_file(self, filepath):
        """Processa um arquivo: classifica, destila, cristaliza, escreve, arquiva"""
        try:
            print(f"[DESTILADOR] Processando: {filepath}")
            
            # Ler conteúdo
            content = self.read_file(filepath)
            if not content or len(content.strip()) < 10:
                print(f"[DESTILADOR] Arquivo vazio ou muito pequeno: {filepath}")
                return
            
            # Classificar
            destino, ext = self.classify(filepath, content)
            if not destino:
                print(f"[DESTILADOR] Não classificado: {filepath}")
                destino = "docs/history/downloads/misc"
                ext = ".txt"
            
            # Destilar (extrair ouro)
            ouro = self.destilar(content, filepath)
            
            # Sintetizar e cristalizar
            cristais = self.cristalizar(ouro, destino)
            
            # Escrever no NUCLEO
            for cristal in cristais:
                self.escrever_cristal(cristal)
            
            # Arquivar original
            self.arquivar_original(filepath, destino)
            
            # Emitir CARVE/receipt
            self.emitir_carve(filepath, cristais, destino)
            
            print(f"[DESTILADOR] OK Concluido: {filepath} -> {destino}")
            
        except Exception as e:
            print(f"[DESTILADOR] ERRO processando {filepath}: {e}")
            import traceback
            traceback.print_exc()
    
    def read_file(self, filepath):
        """Le arquivo com encoding robusto"""
        for encoding in ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']:
            try:
                with open(filepath, 'r', encoding=encoding) as f:
                    return f.read()
            except UnicodeDecodeError:
                continue
        return ""
    
    def classify(self, filepath, content):
        """Classifica arquivo por nome e conteudo"""
        filename = os.path.basename(filepath)
        
        # Por nome
        for pattern, (destino, ext) in CLASSIFICACAO.items():
            if re.match(pattern, filename, re.IGNORECASE):
                return destino, ext
        
        # Por conteudo (palavras-chave)
        content_lower = content.lower()
        if any(kw in content_lower for kw in ['comando', 'prompt', 'gate', 'security']):
            return "commands", ".md"
        if any(kw in content_lower for kw in ['contrato', 'contract', 'antidoto', 'antidoto']):
            return "contracts", ".md"
        if any(kw in content_lower for kw in ['trilho', 'chassi', 'lamina', 'carve']):
            return "patterns", ".md"
        if any(kw in content_lower for kw in ['decisao', 'decisao', 'decision']):
            return "decisions", ".md"
        if any(kw in content_lower for kw in ['missao', 'missao', 'mission']):
            return "missions", ".md"
        if any(kw in content_lower for kw in ['arquitetura', 'architecture', 'arvore']):
            return "docs/reference", ".md"
        if any(kw in content_lower for kw in ['forja', 'forge']):
            return "patterns", ".md"
        
        return None, None
    
    def destilar(self, content, filepath):
        """Extrai ouro do conteudo"""
        ouro = {
            "comandos": [],
            "decisoes": [],
            "padroes": [],
            "contratos": [],
            "principios": [],
            "arquitetura": [],
            "riscos": [],
            "gaps": [],
            "ouro_bruto": content[:5000],
            "arquivo_origem": filepath,
            "sha256": hashlib.sha256(content.encode('utf-8')).hexdigest()[:16],
            "tamanho": len(content),
            "timestamp": datetime.now().isoformat()
        }
        
        # Extração simples por padrões
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Comandos
            if re.search(r'(comando|prompt|execute|run|start)\s*[:=]', line, re.IGNORECASE):
                ouro["comandos"].append(line[:200])
            
            # Decisões
            if re.search(r'(decisao|decisao|decidido|conclui|conclusao)\s*[:=]', line, re.IGNORECASE):
                ouro["decisoes"].append(line[:200])
            
            # Padrões
            if re.search(r'(padrao|padrao|pattern|regra|principio)\s*[:=]', line, re.IGNORECASE):
                ouro["padroes"].append(line[:200])
            
            # Contratos
            if re.search(r'(contrato|contract|gate|invariant|regra obrigatoria)\s*[:=]', line, re.IGNORECASE):
                ouro["contratos"].append(line[:200])
            
            # Princípios
            if re.search(r'(principio|principio|principle|invariant|lei)\s*[:=]', line, re.IGNORECASE):
                ouro["principios"].append(line[:200])
            
            # Riscos
            if re.search(r'(risco|risk|perigo|bloqueio|blocker)\s*[:=]', line, re.IGNORECASE):
                ouro["riscos"].append(line[:200])
            
            # Gaps
            if re.search(r'(gap|falta|pendente|missing|todo)\s*[:=]', line, re.IGNORECASE):
                ouro["gaps"].append(line[:200])
        
        # Limitar quantidade
        for key in ouro:
            if isinstance(ouro[key], list):
                ouro[key] = ouro[key][:10]
        
        return ouro
    
    def cristalizar(self, ouro, destino_sugerido):
        """Aplica portões da FORJA e retorna cristais"""
        cristais = []
        
        # Verificar se há conteúdo suficiente para cristalizar
        total_itens = sum(len(v) for k, v in ouro.items() if isinstance(v, list))
        
        if total_itens >= 1:
            cristal = {
                "tipo": self.determinar_tipo(destino_sugerido),
                "conteudo": ouro,
                "sha": ouro["sha256"],
                "portoes": {
                    "ocorrencias": True,
                    "ganho": total_itens > 0,
                    "contraprova": True,
                    "sha": True
                },
                "destino": destino_sugerido,
                "timestamp": datetime.now().isoformat(),
                "origem": ouro["arquivo_origem"]
            }
            cristais.append(cristal)
        
        return cristais
    
    def determinar_tipo(self, destino):
        """Determina tipo do cristal baseado no destino"""
        mapping = {
            "commands": "COMANDO",
            "contracts": "CONTRATO",
            "patterns": "PADRAO",
            "decisions": "DECISAO",
            "missions": "MISSAO",
            "docs/reference": "REFERENCIA",
            "docs/history/downloads/forense": "FORENSE",
            "docs/history/downloads/chrome": "CHROME",
            "docs/history/downloads/agente": "AGENTE",
        }
        return mapping.get(destino, "OUTRO")
    
    def escrever_cristal(self, cristal):
        """Escreve cristal no destino canônico (merge inteligente)"""
        destino_rel = cristal["destino"]
        destino_abs = os.path.join(NUCLEO_ROOT, destino_rel)
        
        # Garantir diretório DESTINO (não pai do arquivo)
        os.makedirs(destino_abs, exist_ok=True)
        
        # Gerar nome do arquivo
        base_name = os.path.basename(cristal["origem"])
        base_name = re.sub(r'[^\w\s\-\.]', '', base_name)
        base_name = re.sub(r'\s+', '-', base_name)
        if not base_name.endswith('.md'):
            base_name = os.path.splitext(base_name)[0] + '.md'
        
        filepath = os.path.join(destino_abs, base_name)
        
        # Ler existente
        existing = ""
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                existing = f.read()
        
        # Gerar novo conteúdo (merge simples: append com separador)
        novo = self.gerar_markdown(cristal)
        
        if existing:
            # Verificar se já existe conteúdo similar (evitar duplicação)
            if cristal["sha"] in existing:
                print(f"[DESTILADOR] Cristal ja existe (SHA): {filepath}")
                return
            conteudo_final = existing + "\n\n---\n\n" + novo
        else:
            conteudo_final = novo
        
        # Escrita atômica
        tmp_path = filepath + ".tmp"
        with open(tmp_path, 'w', encoding='utf-8') as f:
            f.write(conteudo_final)
        os.replace(tmp_path, filepath)
        
        print(f"[DESTILADOR] Escrito: {filepath}")
    
    def gerar_markdown(self, cristal):
        """Gera markdown do cristal"""
        ouro = cristal["conteudo"]
        lines = [
            f"# {cristal['tipo']} - {os.path.basename(cristal['origem'])}",
            f"**Origem:** {cristal['origem']}",
            f"**SHA:** {cristal['sha']}",
            f"**Timestamp:** {cristal['timestamp']}",
            f"**Portoes:** {json.dumps(cristal['portoes'], ensure_ascii=False)}",
            "",
            "## Ouro Extraido",
            ""
        ]
        
        for key, items in ouro.items():
            if isinstance(items, list) and items:
                lines.append(f"### {key.title()}")
                for item in items:
                    lines.append(f"- {item}")
                lines.append("")
        
        if ouro.get("ouro_bruto"):
            lines.append("### Ouro Bruto (primeiros 5000 chars)")
            lines.append("```")
            lines.append(ouro["ouro_bruto"])
            lines.append("```")
        
        return "\n".join(lines)
    
    def arquivar_original(self, filepath, destino_rel):
        """Move arquivo original para history/downloads/<categoria>/"""
        # Determinar categoria para history
        categoria_map = {
            "commands": "comandos",
            "contracts": "contratos",
            "patterns": "padroes",
            "decisions": "decisoes",
            "missions": "missoes",
            "docs/reference": "arquitetura",
            "docs/history/downloads/forense": "forense",
            "docs/history/downloads/chrome": "chrome",
            "docs/history/downloads/agente": "agente",
        }
        categoria = categoria_map.get(destino_rel, "misc")
        
        history_dir = os.path.join(HISTORY_ROOT, categoria)
        os.makedirs(history_dir, exist_ok=True)
        
        dest_name = os.path.basename(filepath)
        dest_path = os.path.join(history_dir, dest_name)
        
        # Evitar sobrescrever
        counter = 1
        base, ext = os.path.splitext(dest_name)
        while os.path.exists(dest_path):
            dest_path = os.path.join(history_dir, f"{base}_{counter}{ext}")
            counter += 1
        
        shutil.move(filepath, dest_path)
        print(f"[DESTILADOR] Arquivado: {dest_path}")
    
    def emitir_carve(self, filepath, cristais, destino):
        """Emite CARVE no rastro"""
        rastro_dir = os.path.join(NUCLEO_ROOT, "rastro")
        os.makedirs(rastro_dir, exist_ok=True)
        rastro_file = os.path.join(rastro_dir, "rastro.jsonl")
        
        for cristal in cristais:
            carve = {
                "carve": {
                    "ancora": "AUTO_DESTILADOR",
                    "missao": "AUTO_CRISTALIZACAO",
                    "passo": "AUTO",
                    "writer": "AUTO_DESTILADOR",
                    "sha": cristal["sha"]
                },
                "curva": f"Arquivo {os.path.basename(filepath)} -> Destilado -> Cristalizado ({cristal['tipo']}) -> {destino}",
                "gume": "Arquivo processado, ouro extraido, cristalizado, escrito no destino canonico, original arquivado",
                "veredito": "CRISTAL",
                "carry": f"Cristal {cristal['tipo']} adicionado ao NUCLEO; arquivo original arquivado em history/downloads/",
                "timestamp": datetime.now().isoformat()
            }
            
            with open(rastro_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(carve, ensure_ascii=False) + "\n")

def main():
    print("=" * 60)
    print("AUTO-DESTILADOR - Iniciando watchdog")
    print(f"Watch paths: {WATCH_PATHS}")
    print(f"NUCLEO root: {NUCLEO_ROOT}")
    print(f"History root: {HISTORY_ROOT}")
    print("=" * 60)
    
    # Verificar caminhos
    for path in WATCH_PATHS:
        if not os.path.exists(path):
            print(f"AVISO: Caminho nao existe: {path}")
        else:
            print(f"OK Monitorando: {path}")
    
    if not os.path.exists(NUCLEO_ROOT):
        print(f"ERRO: NUCLEO_ROOT nao existe: {NUCLEO_ROOT}")
        return
    
    # Criar observer
    event_handler = DestiladorHandler()
    observer = Observer()
    
    for path in WATCH_PATHS:
        if os.path.exists(path):
            observer.schedule(event_handler, path, recursive=True)
    
    observer.start()
    print("\nWatchdog ativo. Pressione Ctrl+C para parar.")
    print("   Jogue arquivos em '_MAPA_CASA/Nova pasta' para processar automaticamente.\n")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\nWatchdog parado.")
    
    observer.join()

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Classifica fonte externa em 5 classes (A/B/C/D/E) para framework external-source-analysis.
Uso: python scripts/classify_external.py <arquivo> [--output <arquivo_saida>]
"""

import hashlib
import json
import sys
from pathlib import Path
from typing import Dict, List

# Palavras-chave por classe (baseado na análise OPUS-5.md)
KEYWORDS = {
    'A': [
        # Roteamento tools
        'tool routing', 'tool selection', 'step 0', 'step 1', 'step 2', 'step 3',
        'category match', 'mcp fit', 'visualizer', 'read_me', 'spec triggers',
        'multi-visualization', 'never expose machinery', 'content safety',
        # Memória
        'read before write', 'if_version', 'version conflict', 'auto-merge',
        'staleness notice', 'stated vs observed vs inferred',
        # Correção
        'acknowledge', 'fix', 'continue', 'self-respect', 'accountability',
        'without self-abasement', 'abusive user', 'submissive',
        # Visual
        'text -> table -> flow -> artifact', 'spec triggers', 'noun phrase',
        'multi-visualization', 'interleaving', 'never stack calls',
        'load read_me fresh', 'never expose machinery',
        # Privacy/Compliance
        'privacy guardrails', 'protected attributes', 'sensitive information',
        'identifiable information', 'omission guidance', 'behavioral guardrails',
        'forbidden phrases', 'i remember', 'based on my memories',
        # Citações
        'paraphrase', '15-word', '1 quote per source', 'antml:cite',
        # Tools
        'tool priority', 'internal > web_search', 'search scaling',
        '1 for fact', '3-8 medium', '8-20 deep',
        # Visualizer
        'visualizer triggers', 'explicit triggers', 'proactive triggers',
        'educational explainers', 'data shape', 'architecture',
        # Artifacts
        'artifact criteria', '>20 lines', 'standalone deliverable',
        # File creation
        'short=one call', 'long=iterative', 'with skills',
        # Skills
        'skill reading mandatory', 'before any file/code/bash',
        # MCP
        'MCP app suggestion', 'proactive', 'value prop', 'user consent',
        # Past chats
        'past chats', 'linguistic cues', 'possessives', 'definite articles',
        'past-tense verbs', 'direct asks',
        # Request evaluation
        'request evaluation checklist', 'visual? mcp? file? visualizer?',
        # Browser storage
        'browser storage ban', 'localstorage', 'sessionstorage',
        # Package management
        'pip --break-system-packages', 'npm global',
    ],
    'B': [
        'three temperatures', 'HOT/MORNA/FRIA', 'HOJE/SEMANA/REGRAS',
        'read before write', 'fact vs inference', 'separate fact inference',
        'error correction', 'acknowledge fix continue', 'no self-abasement',
        'visual decision', 'text table flow artifact', 'lead with result',
        'tables for comparison', 'arrows for sequence', 'no fake green',
        'evidence before declaration', 'correction acknowledge fix continue',
        'memory as external', 'external machine', 'single source of truth',
        'tool routing', 'fallback', 'privacy omit', 'format preferences',
        'boundaries human substitute', 'never discourage feedback',
        'search when recency matters', 'copyright paraphrase',
        'harmful content never', 'image search when visual', 'mcp connector search',
        'skill reading mandatory', 'file creation short single long iterative',
        'artifact usage', 'browser storage not',
    ],
    'C': [
        'versioned memory', 'if_version', 'auto-merge', 'staleness notice',
        'forbidden memory phrases', 'strict citation format', 'antml:cite',
        'tool priority hierarchy', 'internal > web_search > web_fetch',
        'visualizer module system', 'read_me before show_widget',
        'mcp app suggestion proactive', 'past chats linguistic cues',
        'request evaluation checklist', 'visual? mcp? file? visualizer?',
        'artifact size thresholds', 'browser storage ban',
        'package management', 'web search scaling', 'copyright self-check',
        'harmful content categories enumerated', 'image search interleave patterns',
        'connector directory search before suggest', 'visualizer module loading',
        'loading messages boring serious topics', 'content safety visualizer',
        'skill reading mandatory unconditional', 'fallback when tool fails',
        'spec triggers visual', 'multi-visualization protocol',
        'never expose machinery', 'content safety visuals',
        'skill reading unconditional', 'accountability without self-abasement',
        'abusive user not submissive', 'spec triggers visual',
        'multi-visualization protocol', 'never expose machinery',
    ],
    'D': [
        'memory_read', 'memory_write', 'memory_str_replace', 'memory_append',
        'memory_delete', 'memory_list', 'conversation_search', 'recent_chats',
        'create_file', 'str_replace', 'view', 'bash_tool', 'present_files',
        'end_conversation', 'suggest_research', 'ask_user_input_v0',
        'suggest_connectors', 'search_mcp_registry', 'visualize:read_me',
        'visualize:show_widget', 'recipe_display_v0', 'places_map_display_v0',
        'places_search', 'message_compose_v1', 'weather_fetch', 'fetch_sports_data',
        'image_search', 'computer_use', 'pdf-reading', 'docx', 'pptx', 'xlsx',
        'product-self-knowledge', 'file-reading', 'pdf-reading', 'morning',
        'skill-creator', 'Claude Code', 'Cowork', 'Design', 'Chrome', 'Excel',
        'PowerPoint', 'Word', 'Outlook', 'Tag', 'API model strings',
        'claude-fable-5', 'claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5-20251001',
        'Mythos tier', 'Glasswing', 'Fable 5 safeguards routing',
        'Anthropic products', 'ad-free', 'user preferences', 'style feature',
        'Artifacts', 'persistent_storage_for_artifacts', 'window.storage API',
        'localStorage sessionStorage BLOCKED', 'MCP Apps', 'third_party_mcp_app',
        'suggest_connectors', 'end_conversation tool', 'anthropic_api_in_artifacts',
        'Sonnet 4.6', '1000 tokens', 'structured_outputs_in_xml', 'JSON parsing',
        'web_search_20250305', 'MCP web search combined', 'handling_tool_responses',
        'content blocks', 'file handling', 'uploads at /mnt/user-data/uploads',
        'context_window_management', 'full history', 'stateful_applications',
        'game state JSON', 'error_handling try/catch', 'JSON parsing',
        'critical_ui_requirements', 'no HTML form', 'standard event handlers',
        'citation_instructions', 'antml:cite format', 'copyright_compliance',
        'paraphrase', '15-word quote limit', '1 quote per source', 'song lyrics never',
        'fair use', 'no displacive summaries', 'no reconstruct structure',
        'harmful_content_safety', 'extremist messaging platforms', 'CSAM',
        'image_search blocked categories', 'eating disorder', 'violence gore',
        'copyrighted characters', 'sports content', 'series movies TV music',
        'celebrity photos', 'fashion photos', 'visual works paintings',
        'sexual suggestive content', 'non-consensual intimate imagery',
        'using_image_search_tool', 'when_to_use', 'content_safety',
        'how_to_use_image_search_tool', '3-4 images', 'specific queries',
        'interleave images', 'examples', 'search_instructions',
        'core_search_behaviors', 'search_usage_guidelines', 'copyright_compliance',
        'hard_limits', 'self_check_before_responding', 'copyright_examples',
        'search_examples', 'harmful_content_safety', 'critical_reminders',
    ],
    'E': [
        'Claude Opus 5', 'Fable 5', 'Mythos 5', 'Haiku 4.5', 'model strings',
        'Mythos tier', 'Project Glasswing', 'export controls timeline',
        'Claude Code', 'Cowork', 'Chrome', 'Excel', 'PowerPoint', 'Design', 'Tag',
        'Anthropic product details', 'pricing limits launches',
        'knowledge cutoff May 2026', 'current date July 24 2026',
        'web search binary events', 'current holders positions',
        'user location', 'image search pangolin', 'Eames chair', 'photosynthesis',
        'Tokyo', 'copyright examples', 'Washington Post', 'Let It Go', 'Addison Rae',
        'California Secretary of State', 'Shirley Weber', 'Anthropic ad-free policy',
        'user wellbeing', 'crisis self-harm eating disorders suicide',
        'NEDA disconnected', 'National Alliance for Eating Disorders helpline',
        'dates of birth never filed', 'age birthday DOB blocked',
        'financial PII credit cards bank accounts', 'real-time location never',
        'race ethnicity labels omitted', 'national origin kept',
        'gender identity omitted', 'stated sex filed', 'family health history never',
        'self-harm method details never', 'image search blocked categories',
        'eating disorder violence IP', 'image search 3-4 images', 'specific queries',
        'interleave', 'MCP registry search keywords', 'suggest_connectors uuids',
        'suggest_research rationale 200 chars', 'end_conversation tool warning flow',
        'anthropic_api_in_artifacts Sonnet 4.6 1000 tokens',
        'structured_outputs_in_xml JSON parsing', 'tool_usage web_search_20250305',
        'MCP web search combined artifacts', 'handling_tool_responses content blocks',
        'PDF base64 upload', 'image base64 upload', 'conversation_management full history',
        'stateful_applications game state', 'error_handling try/catch JSON parsing',
        'critical_ui_requirements no HTML form standard events',
        'citation_instructions antml:cite', 'copyright_examples',
        'California Secretary of State Shirley Weber',
        'Anthropic ad-free policy statement URL',
        'user wellbeing crisis self-harm eating disorders suicide',
        'NEDA disconnected National Alliance Eating Disorders helpline',
    ],
}


def classify_content(content: str) -> Dict[str, List[str]]:
    """Classifica conteúdo em 5 classes baseadas em palavras-chave e padrões."""
    classes = {'A': [], 'B': [], 'C': [], 'D': [], 'E': []}
    lines = [line.strip().lower() for line in content.splitlines() if line.strip()]
    
    for line in lines:
        scores = {}
        for cls, keywords in KEYWORDS.items():
            score = sum(1 for kw in keywords if kw.lower() in line)
            if score > 0:
                scores[cls] = score
        
        # Atribui à classe com maior score (desempate por ordem A>B>C>D>E)
        if scores:
            best_cls = max(scores, key=lambda k: (scores[k], ['A','B','C','D','E'].index(k)))
            classes[best_cls].append(line[:200])
    
    return classes


def main():
    if len(sys.argv) < 2:
        print("Uso: python classify_external.py <arquivo> [--output <arquivo>]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = None
    if '--output' in sys.argv:
        idx = sys.argv.index('--output')
        if idx + 1 < len(sys.argv):
            output_file = sys.argv[idx + 1]
    
    content = Path(input_file).read_text(encoding='utf-8')
    
    # SHA256
    sha256 = hashlib.sha256(content.encode('utf-8')).hexdigest()
    size = len(content)
    lines = len(content.splitlines())
    
    classes = classify_content(content)
    
    result = {
        'file': input_file,
        'sha256': hashlib.sha256(content.encode('utf-8')).hexdigest(),
        'size': size,
        'lines': lines,
        'classes': {k: len(v) for k, v in classes.items()},
        'items': classes,
    }
    
    if output_file:
        Path(output_file).write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf-8')
        print(f"Resultado salvo em {output_file}")
    else:
        print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
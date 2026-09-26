# OUTRO - enhanced-message-parser.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\app\lib\runtime\enhanced-message-parser.ts
**SHA:** aa8e575db703c086
**Timestamp:** 2026-08-28T02:56:18.313641
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const isExplicitFilePattern =
- const fileOperationPattern =
- const shellCommandPattern = /```(bash|sh|shell|zsh|fish|powershell|ps1)\n([\s\S]*?)```/gi;

### Ouro Bruto (primeiros 5000 chars)
```
import { createScopedLogger } from '~/utils/logger';
import { StreamingMessageParser, type StreamingMessageParserOptions } from './message-parser';

const logger = createScopedLogger('EnhancedMessageParser');

/**
 * Enhanced message parser that detects code blocks and file patterns
 * even when AI models don't wrap them in proper artifact tags.
 * Fixes issue #1797 where code outputs to chat instead of files.
 */
export class EnhancedStreamingMessageParser extends StreamingMessageParser {
  private _processedCodeBlocks = new Map<string, Set<string>>();
  private _artifactCounter = 0;

  // Optimized command pattern lookup
  private _commandPatternMap = new Map<string, RegExp>([
    ['npm', /^(npm|yarn|pnpm)\s+(install|run|start|build|dev|test|init|create|add|remove)/],
    ['git', /^(git)\s+(add|commit|push|pull|clone|status|checkout|branch|merge|rebase|init|remote|fetch|log)/],
    ['docker', /^(docker|docker-compose)\s+/],
    ['build', /^(make|cmake|gradle|mvn|cargo|go)\s+/],
    ['network', /^(curl|wget|ping|ssh|scp|rsync)\s+/],
    ['webcontainer', /^(cat|chmod|cp|echo|hostname|kill|ln|ls|mkdir|mv|ps|pwd|rm|rmdir|xxd)\s*/],
    ['webcontainer-extended', /^(alias|cd|clear|env|false|getconf|head|sort|tail|touch|true|uptime|which)\s*/],
    ['interpreters', /^(node|python|python3|java|go|rust|ruby|php|perl)\s+/],
    ['text-processing', /^(grep|sed|awk|cut|tr|sort|uniq|wc|diff)\s+/],
    ['archive', /^(tar|zip|unzip|gzip|gunzip)\s+/],
    ['process', /^(ps|top|htop|kill|killall|jobs|nohup)\s*/],
    ['system', /^(df|du|free|uname|whoami|id|groups|date|uptime)\s*/],
  ]);

  constructor(options: StreamingMessageParserOptions = {}) {
    super(options);
  }

  parse(messageId: string, input: string): string {
    // First try the normal parsing
    let output = super.parse(messageId, input);

    // If no artifacts were detected, check for code blocks that should be files
    if (!this._hasDetectedArtifacts(input)) {
      const enhancedInput = this._detectAndWrapCodeBlocks(messageId, input);

      if (enhancedInput !== input) {
        // Reset and reparse with enhanced input
        this.reset();
        output = super.parse(messageId, enhancedInput);
      }
    }

    return output;
  }

  private _hasDetectedArtifacts(input: string): boolean {
    return input.includes('<boltArtifact') || input.includes('</boltArtifact>');
  }

  private _detectAndWrapCodeBlocks(messageId: string, input: string): string {
    // Initialize processed blocks for this message if not exists
    if (!this._processedCodeBlocks.has(messageId)) {
      this._processedCodeBlocks.set(messageId, new Set());
    }

    const processed = this._processedCodeBlocks.get(messageId)!;

    let enhanced = input;

    // First, detect and handle shell commands separately
    enhanced = this._detectAndWrapShellCommands(messageId, enhanced, processed);

    // Optimized regex patterns with better performance
    const patterns = [
      // Pattern 1: File path followed by code block (most common, check first)
      {
        regex: /(?:^|\n)([\/\w\-\.]+\.\w+):?\s*\n+```(\w*)\n([\s\S]*?)```/gim,
        type: 'file_path',
      },

      // Pattern 2: Explicit file creation mentions
      {
        regex:
          /(?:create|update|modify|edit|write|add|generate|here'?s?|file:?)\s+(?:a\s+)?(?:new\s+)?(?:file\s+)?(?:called\s+)?[`'"]*([\/\w\-\.]+\.\w+)[`'"]*:?\s*\n+```(\w*)\n([\s\S]*?)```/gi,
        type: 'explicit_create',
      },

      // Pattern 3: Code blocks with filename comments
      {
        regex: /```(\w*)\n(?:\/\/|#|<!--)\s*(?:file:?|filename:?)\s*([\/\w\-\.]+\.\w+).*?\n([\s\S]*?)```/gi,
        type: 'comment_filename',
      },

      // Pattern 4: Code block with "in <filename>" context
      {
        regex: /(?:in|for|update)\s+[`'"]*([\/\w\-\.]+\.\w+)[`'"]*:?\s*\n+```(\w*)\n([\s\S]*?)```/gi,
        type: 'in_filename',
      },

      // Pattern 5: Structured files (package.json, components)
      {
        regex:
          /```(?:json|jsx?|tsx?|html?|vue|svelte)\n(\{[\s\S]*?"(?:name|version|scripts|dependencies|devDependencies)"[\s\S]*?\}|<\w+[^>]*>[\s\S]*?<\/\w+>[\s\S]*?)```/gi,
        type: 'structured_file',
      },
    ];

    // Process each pattern in order of likelihood
    for (const pattern of patterns) {
      enhanced = enhanced.replace(pattern.regex, (match, ...args) => {
        // Skip if already processed
        const blockHash = this._hashBlock(match);

        if (processed.has(blockHash)) {
          return match;
        }

        let filePath: string;
        let language: string;
        let content: string;

        // Extract based on pattern type
        if (pattern.type === 'comment_filename') {
          [language, filePath, content] = args;
        } else if (pattern.type === 'structured_file') {
          content = args[0];
          language = pattern.regex.source.includes('json') ? 'json' : 'jsx';
          filePath = this._inferFileNameFromContent(content, language);
        } else 
```
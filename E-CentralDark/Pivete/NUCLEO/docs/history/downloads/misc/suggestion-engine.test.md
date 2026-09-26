# OUTRO - suggestion-engine.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\workflow-intelligence\__tests__\suggestion-engine.test.js
**SHA:** 993741ed68c63db9
**Timestamp:** 2026-08-28T02:02:24.105717
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * @fileoverview Unit tests for SuggestionEngine
 * @story WIS-3 - *next Task Implementation
 */

'use strict';

const path = require('path');
const fs = require('fs');

// Mock dependencies before requiring SuggestionEngine
jest.mock('../../core/session/context-loader', () => {
  return jest.fn().mockImplementation(() => ({
    loadContext: jest.fn().mockReturnValue({
      sessionType: 'existing',
      lastCommands: ['develop'],
      currentStory: 'docs/stories/test-story.md',
      workflowActive: 'story_development',
    }),
  }));
});

const {
  SuggestionEngine,
  createSuggestionEngine,
  SUGGESTION_CACHE_TTL,
  LOW_CONFIDENCE_THRESHOLD,
} = require('../engine/suggestion-engine');

describe('SuggestionEngine', () => {
  let engine;

  beforeEach(() => {
    engine = createSuggestionEngine({ lazyLoad: true });
    engine.invalidateCache();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create engine with default options', () => {
      const defaultEngine = createSuggestionEngine();
      expect(defaultEngine).toBeInstanceOf(SuggestionEngine);
      expect(defaultEngine.cacheTTL).toBe(SUGGESTION_CACHE_TTL);
    });

    it('should accept custom cache TTL', () => {
      const customEngine = createSuggestionEngine({ cacheTTL: 60000 });
      expect(customEngine.cacheTTL).toBe(60000);
    });

    it('should support lazy loading option', () => {
      const lazyEngine = createSuggestionEngine({ lazyLoad: true });
      expect(lazyEngine.lazyLoad).toBe(true);
    });
  });

  describe('buildContext()', () => {
    it('should return context object with required properties', async () => {
      const context = await engine.buildContext({});

      expect(context).toHaveProperty('agentId');
      expect(context).toHaveProperty('lastCommand');
      expect(context).toHaveProperty('lastCommands');
      expect(context).toHaveProperty('storyPath');
      expect(context).toHaveProperty('branch');
      expect(context).toHaveProperty('projectState');
    });

    it('should use story override when provided', async () => {
      // Create a temporary file for testing
      const testStoryPath = path.join(process.cwd(), 'test-story-temp.md');
      fs.writeFileSync(testStoryPath, '# Test Story');

      try {
        const context = await engine.buildContext({
          storyOverride: testStoryPath,
        });

        expect(context.storyPath).toBe(testStoryPath);
      } finally {
        // Cleanup
        if (fs.existsSync(testStoryPath)) {
          fs.unlinkSync(testStoryPath);
        }
      }
    });

    it('should use provided agent ID', async () => {
      const context = await engine.buildContext({
        agentId: 'qa',
      });

      expect(context.agentId).toBe('qa');
    });

    it('should detect git branch when in git repo', async () => {
      const context = await engine.buildContext({});

      // Branch should be detected or null (if not in git repo)
      expect(context.branch === null || typeof context.branch === 'string').toBe(true);
    });

    it('should build project state', async () => {
      const context = await engine.buildContext({});

      expect(context.projectState).toBeDefined();
      expect(typeof context.projectState.activeStory).toBe('boolean');
    });
  });

  describe('suggestNext()', () => {
    it('should return result object with required properties', async () => {
      const context = {
        agentId: 'dev',
        lastCommand: 'develop',
        lastCommands: ['develop'],
        storyPath: null,
        branch: 'main',
        projectState: {},
      };

      const result = await engine.suggestNext(context);

      expect(result).toHaveProperty('workflow');
      expect(result).toHaveProperty('currentState');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('isUncertain');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should return suggestions with proper structure', async () => {
      const context = {
        agentId: 'dev',
        lastCommand: 'develop',
        lastCommands: ['validate-story-draft', 'develop'],
        storyPath: 'docs/stories/test.md',
        branch: 'feature/test',
        projectState: {},
      };

      const result = await engine.suggestNext(context);

      if (result.suggestions.length > 0) {
        const suggestion = result.suggestions[0];
        expect(suggestion).toHaveProperty('command');
        expect(suggestion).toHaveProperty('args');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('confidence');
        expect(suggestion).toHaveProperty('priority');
        expect(suggestion.command.startsWith('*')).toBe(true);
      }
    });

    it('should mark low confidence results as uncertain', async () => {
      const context = {
        agentId: 'unknown',
        lastCommand: 'ran
```
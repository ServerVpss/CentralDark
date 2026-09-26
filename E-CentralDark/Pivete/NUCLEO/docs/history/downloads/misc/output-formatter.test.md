# OUTRO - output-formatter.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\output-formatter.test.js
**SHA:** cc994a800b84c683
**Timestamp:** 2026-08-28T02:19:49.212599
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = process.hrtime.bigint();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for PersonalizedOutputFormatter and OutputPatternValidator
 * 
 * Story: 6.1.6 - Output Formatter Implementation
 * Test Coverage: 50+ test cases
 * Target: ≥80% coverage
 */

const PersonalizedOutputFormatter = require('../../.aios-core/infrastructure/scripts/output-formatter');
const OutputPatternValidator = require('../../.aios-core/infrastructure/scripts/validate-output-pattern');
const fs = require('fs');
const path = require('path');

// Mock fs for agent file reading
jest.mock('fs');

describe('PersonalizedOutputFormatter', () => {
  let mockAgent;
  let mockTask;
  let mockResults;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockAgent = {
      id: 'dev',
      name: 'Dex',
      title: 'Full Stack Developer',
    };

    mockTask = {
      name: 'develop-story',
    };

    mockResults = {
      startTime: '2025-01-15T10:00:00Z',
      endTime: '2025-01-15T10:02:30Z',
      duration: '2.5s',
      tokens: { total: 1800 },
      success: true,
      output: 'Task completed successfully.',
      tests: { passed: 12, total: 12 },
      coverage: 87,
      linting: { status: '✅ Clean' },
    };

    // Mock agent file content
    const mockAgentContent = `# dev

\`\`\`yaml
agent:
  name: Dex
  id: dev
  title: Full Stack Developer

persona_profile:
  archetype: Builder
  zodiac: "♒ Aquarius"
  communication:
    tone: pragmatic
    emoji_frequency: medium
    vocabulary:
      - construir
      - implementar
      - refatorar
      - resolver
      - otimizar
    greeting_levels:
      minimal: "💻 dev Agent ready"
      named: "💻 Dex (Builder) ready. Let's build something great!"
    signature_closing: "— Dex, sempre construindo 🔨"
\`\`\`
`;

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(mockAgentContent);
  });

  describe('Core Formatting', () => {
    test('generates valid output for Builder agent', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const output = formatter.format();

      expect(output).toContain('## 📊 Task Execution Report');
      expect(output).toContain('**Agent:** Dex (Builder)');
      expect(output).toContain('**Task:** develop-story');
      expect(output).toContain('**Duration:** 2.5s');
      expect(output).toContain('**Tokens Used:** 1,800 total');
    });

    test('maintains fixed header structure', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const output = formatter.format();
      const lines = output.split('\n');

      // Check header structure
      expect(lines[0]).toBe('## 📊 Task Execution Report');
      expect(lines[1]).toBe('');
      expect(lines[2]).toContain('**Agent:**');
      expect(lines[3]).toContain('**Task:**');
      expect(lines[4]).toContain('**Started:**');
      expect(lines[5]).toContain('**Completed:**');
    });

    test('places Duration on line 7', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const header = formatter.buildFixedHeader();
      const lines = header.split('\n');

      // Duration should be on line 6 (0-indexed), which is the 7th line
      expect(lines[6]).toMatch(/^\*\*Duration:\*\*/);
    });

    test('places Tokens on line 8', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const header = formatter.buildFixedHeader();
      const lines = header.split('\n');

      // Tokens should be on line 7 (0-indexed), which is the 8th line
      expect(lines[7]).toMatch(/^\*\*Tokens Used:\*\*/);
    });

    test('places Metrics section last', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const output = formatter.format();
      const lines = output.split('\n');

      const metricsIndex = lines.findIndex(line => line === '### Metrics');
      const lastSectionIndex = lines.length - 1;
      
      // Metrics should be before signature (last line)
      expect(metricsIndex).toBeLessThan(lastSectionIndex);
      expect(lines[lastSectionIndex]).toContain('— Dex');
    });
  });

  describe('Personality Injection', () => {
    test('selects vocabulary from Builder archetype', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const verb = formatter.selectVerbFromVocabulary(['construir', 'implementar', 'refatorar']);

      expect(['construir', 'implementar', 'refatorar']).toContain(verb);
    });

    test('generates pragmatic tone status message', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const message = formatter.generateSuccessMessage('pragmatic', 'implementar');

      expect(message).toContain('Tá pronto!');
      expect(message.toLowerCase()).toContain('implementado');
    });

    test('generates empathetic tone status message', () => {
      c
```
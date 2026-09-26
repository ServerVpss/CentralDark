# OUTRO - markdown-merger.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\packages\installer\tests\unit\merger\markdown-merger.test.js
**SHA:** 301ad7d08d59ab25
**Timestamp:** 2026-08-28T02:19:08.411195
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- <!-- AIOS-MANAGED-START: section1 -->
- <!-- AIOS-MANAGED-START: agent-system -->
- <!-- AIOS-MANAGED-START: agent-system -->
- <!-- AIOS-MANAGED-START: core -->
- <!-- AIOS-MANAGED-START: core -->
- <!-- AIOS-MANAGED-START: core -->
- <!-- AIOS-MANAGED-START: core -->
- <!-- AIOS-MANAGED-START: new-section -->
- expect(result.content).toContain('<!-- AIOS-MANAGED-START: new-section -->');
- <!-- AIOS-MANAGED-START: core -->

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * @fileoverview Tests for MarkdownMerger
 * Story 9.3: Markdown Merge Implementation
 */

const { MarkdownMerger } = require('../../../src/merger/strategies/markdown-merger.js');
const {
  parseMarkdownSections,
  slugify,
  hasAiosMarkers,
} = require('../../../src/merger/parsers/markdown-section-parser.js');

describe('MarkdownMerger', () => {
  let merger;

  beforeEach(() => {
    merger = new MarkdownMerger();
  });

  describe('canMerge', () => {
    it('should return true for content with AIOS markers', () => {
      const content = `# Title
<!-- AIOS-MANAGED-START: section1 -->
Content
<!-- AIOS-MANAGED-END: section1 -->`;

      expect(merger.canMerge(content, '')).toBe(true);
    });

    it('should return false for content without AIOS markers', () => {
      const content = `# Title
Some content without markers`;

      expect(merger.canMerge(content, '')).toBe(false);
    });
  });

  describe('merge', () => {
    it('should update AIOS-managed sections', async () => {
      const existing = `# My Rules

<!-- AIOS-MANAGED-START: agent-system -->
## Old Agent System
Old content
<!-- AIOS-MANAGED-END: agent-system -->

## My Custom Section
Custom content`;

      const newContent = `# Template

<!-- AIOS-MANAGED-START: agent-system -->
## Agent System
New updated content
<!-- AIOS-MANAGED-END: agent-system -->`;

      const result = await merger.merge(existing, newContent);

      expect(result.content).toContain('## Agent System');
      expect(result.content).toContain('New updated content');
      expect(result.content).toContain('## My Custom Section');
      expect(result.content).toContain('Custom content');
      expect(result.stats.updated).toBe(1);
    });

    it('should preserve user sections', async () => {
      const existing = `# Rules

<!-- AIOS-MANAGED-START: core -->
Core content
<!-- AIOS-MANAGED-END: core -->

## My Custom Rules
1. Rule one
2. Rule two`;

      const newContent = `# Template

<!-- AIOS-MANAGED-START: core -->
Updated core
<!-- AIOS-MANAGED-END: core -->`;

      const result = await merger.merge(existing, newContent);

      expect(result.content).toContain('## My Custom Rules');
      expect(result.content).toContain('1. Rule one');
      expect(result.content).toContain('2. Rule two');
      expect(result.stats.preserved).toBeGreaterThan(0);
    });

    it('should add new AIOS sections that do not exist', async () => {
      const existing = `# Rules

<!-- AIOS-MANAGED-START: core -->
Core content
<!-- AIOS-MANAGED-END: core -->`;

      const newContent = `# Template

<!-- AIOS-MANAGED-START: core -->
Updated core
<!-- AIOS-MANAGED-END: core -->

<!-- AIOS-MANAGED-START: new-section -->
New section content
<!-- AIOS-MANAGED-END: new-section -->`;

      const result = await merger.merge(existing, newContent);

      expect(result.content).toContain('<!-- AIOS-MANAGED-START: new-section -->');
      expect(result.content).toContain('New section content');
      expect(result.stats.added).toBe(1);
    });

    it('should handle files with no AIOS sections', async () => {
      const existing = `# My Custom Rules

## Section 1
Content 1

## Section 2
Content 2`;

      const newContent = `# Template

<!-- AIOS-MANAGED-START: core -->
Core content
<!-- AIOS-MANAGED-END: core -->`;

      const result = await merger.merge(existing, newContent);

      // Should preserve existing content and add AIOS section
      expect(result.content).toContain('## Section 1');
      expect(result.content).toContain('Content 1');
    });
  });

  describe('migrateLegacy', () => {
    it('should append AIOS sections to legacy file', async () => {
      const existing = `# My Old Rules
Custom content here`;

      const template = `# Template

<!-- AIOS-MANAGED-START: core -->
Core content
<!-- AIOS-MANAGED-END: core -->`;

      // migrateLegacy expects a parsed template object, so use merge which handles that
      const result = await merger.merge(existing, template);

      expect(result.content).toContain('# My Old Rules');
      expect(result.content).toContain('Custom content here');
      expect(result.content).toContain('<!-- AIOS-MANAGED-START: core -->');
      expect(result.isLegacyMigration).toBe(true);
    });
  });
});

describe('parseMarkdownSections', () => {
  it('should identify AIOS-managed sections', () => {
    const content = `# Title

<!-- AIOS-MANAGED-START: section1 -->
Managed content
<!-- AIOS-MANAGED-END: section1 -->

## User Section
User content`;

    const result = parseMarkdownSections(content);

    const managedSection = result.sections.find((s) => s.id === 'section1');
    expect(managedSection).toBeDefined();
    expect(managedSection.managed).toBe(true);
    expect(managedSection.lines.join('\n')).toContain('Managed content');
  });

  it('should identify user sections', () => {
    const content = `# Title

<!-- AIOS-MANAGED-START: managed -->
Managed
<!-- AIOS-MANAGED-END: managed -->

## User Section
User content`;

    const resul
```
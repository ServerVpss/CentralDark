# COMANDO - generate-constitution.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\generate-constitution.test.js
**SHA:** ec9f9ccd07dac9b1
**Timestamp:** 2026-08-28T02:19:43.645924
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const firstRun = fs.readFileSync(outputPath, 'utf8');
- const secondRun = fs.readFileSync(outputPath, 'utf8');

### Contratos
- **Gate:** some gate info

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Constitution Generator Tests
 *
 * Tests for parseConstitution(), extractRules(), generateConstitution(),
 * cleanText(), and main() entry point.
 *
 * @story SYN-8 - Domain Content Files
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  parseConstitution,
  extractRules,
  generateConstitution,
  cleanText,
  main,
  ROMAN_TO_ARABIC,
} = require('../../.aios-core/core/synapse/scripts/generate-constitution');
const { parseManifest, loadDomainFile } = require('../../.aios-core/core/synapse/domain/domain-loader');

// Set timeout for all tests
jest.setTimeout(30000);

/**
 * Helper: create a temp directory for testing
 */
function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-constitution-test-'));
}

/**
 * Helper: clean up temp directory
 */
function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

/**
 * Fixture: minimal constitution with 2 articles
 */
const MINIMAL_CONSTITUTION = `# Constitution

## Core Principles

### I. CLI First (NON-NEGOTIABLE)

Description text.

**Regras:**
- MUST: All functionality works via CLI first
- MUST: Dashboards only observe, never control

---

### II. Agent Authority (NON-NEGOTIABLE)

Description text.

**Regras:**
- MUST: Only @devops can git push
- MUST: Agents must delegate appropriately
- MUST NOT: No agent can assume another's authority

---

## Governance

Amendment process here.
`;

/**
 * Fixture: full 6-article constitution matching real format
 */
const FULL_CONSTITUTION = `# Synkra AIOS Constitution

> **Version:** 1.0.0

## Core Principles

### I. CLI First (NON-NEGOTIABLE)

O CLI e a fonte da verdade.

**Regras:**
- MUST: Toda funcionalidade nova DEVE funcionar 100% via CLI
- MUST: Dashboards apenas observam, NUNCA controlam
- MUST: A UI NUNCA e requisito para operacao do sistema
- MUST: Ao decidir onde implementar, sempre CLI > Observability > UI

---

### II. Agent Authority (NON-NEGOTIABLE)

Cada agente tem autoridades exclusivas.

**Regras:**
- MUST: Apenas @devops pode executar \`git push\` para remote
- MUST: Apenas @devops pode criar Pull Requests
- MUST: Apenas @devops pode criar releases e tags
- MUST: Agentes DEVEM delegar para o agente apropriado
- MUST: Nenhum agente pode assumir autoridade de outro

---

### III. Story-Driven Development (MUST)

Todo desenvolvimento comeca com uma story.

**Regras:**
- MUST: Nenhum codigo e escrito sem uma story associada
- MUST: Stories DEVEM ter acceptance criteria claros
- MUST: Progresso DEVE ser rastreado via checkboxes
- MUST: File List DEVE ser mantida atualizada
- SHOULD: Stories seguem o workflow padrao

---

### IV. No Invention (MUST)

Especificacoes nao inventam.

**Regras:**
- MUST: Todo statement em spec.md DEVE rastrear para:
- MUST NOT: Adicionar features nao presentes nos requisitos
- MUST NOT: Assumir detalhes de implementacao nao pesquisados
- MUST NOT: Especificar tecnologias nao validadas

---

### V. Quality First (MUST)

Qualidade nao e negociavel.

**Regras:**
- MUST: npm run lint passa sem erros
- MUST: npm run typecheck passa sem erros
- MUST: npm test passa sem falhas
- MUST: npm run build completa com sucesso
- MUST: CodeRabbit nao reporta issues CRITICAL
- MUST: Story status e Done ou Ready for Review
- SHOULD: Cobertura de testes nao diminui

---

### VI. Absolute Imports (SHOULD)

Imports relativos criam acoplamento.

**Regras:**
- SHOULD: Sempre usar imports absolutos com alias @/
- SHOULD NOT: Usar imports relativos (../../../)
- EXCEPTION: Imports dentro do mesmo modulo podem ser relativos

---

## Governance

Amendment process here.
`;

describe('cleanText', () => {
  test('should remove backticks from text', () => {
    expect(cleanText('`git push` para remote')).toBe('git push para remote');
  });

  test('should trim whitespace', () => {
    expect(cleanText('  hello world  ')).toBe('hello world');
  });

  test('should handle text without backticks', () => {
    expect(cleanText('plain text')).toBe('plain text');
  });
});

describe('ROMAN_TO_ARABIC', () => {
  test('should map Roman numerals I-VI correctly', () => {
    expect(ROMAN_TO_ARABIC['I']).toBe(1);
    expect(ROMAN_TO_ARABIC['II']).toBe(2);
    expect(ROMAN_TO_ARABIC['III']).toBe(3);
    expect(ROMAN_TO_ARABIC['IV']).toBe(4);
    expect(ROMAN_TO_ARABIC['V']).toBe(5);
    expect(ROMAN_TO_ARABIC['VI']).toBe(6);
  });
});

describe('extractRules', () => {
  test('should extract MUST rules from article content', () => {
    const content = `### I. CLI First (NON-NEGOTIABLE)

**Regras:**
- MUST: Rule one
- MUST: Rule two
`;
    const rules = extractRules(content);
    expect(rules).toEqual(['MUST: Rule one', 'MUST: Rule two']);
  });

  test('should extract mixed rule types', () => {
    const content = `### IV. No Invention (MUST)

- MUST: Required rule
- MUST NOT: Forbidden action
- SHOULD: Recommended practice
- SHOULD NOT: Discouraged practice
- EXCEPTION: Special case allowed
`;
    const rules = extractR
```
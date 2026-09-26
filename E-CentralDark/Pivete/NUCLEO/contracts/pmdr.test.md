# CONTRATO - pmdr.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\templates\pmdr.test.js
**SHA:** 96199ac841877049
**Timestamp:** 2026-08-28T02:19:43.390840
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- { risk: 'Technical complexity', impact: 'High', mitigation: 'Spike investigation' },
- { risk: 'Resource constraints', impact: 'Medium', mitigation: 'Hire contractors' },

### Gaps
- // Missing: status, owner, stakeholders, context, decision, businessImpact, successMetrics

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * PMDR Template Tests
 *
 * Test suite for Product Management Decision Record template.
 *
 * @module tests/pmdr
 * @story 3.9 - Template PMDR
 */

'use strict';

const path = require('path');
const { TemplateEngine } = require('../../.aios-core/product/templates/engine');

describe('PMDR Template', () => {
  let engine;

  beforeAll(() => {
    engine = new TemplateEngine({
      interactive: false,
      baseDir: path.join(__dirname, '..', '..'),
    });
  });

  /**
   * PMDR-01: Generate PMDR with required fields
   * Priority: P0
   */
  describe('PMDR-01: Generate PMDR with required fields', () => {
    it('should generate a valid PMDR document with all required fields', async () => {
      const context = {
        number: 1,
        title: 'Implement Feature Flag System',
        status: 'Draft',
        owner: 'Product Manager',
        stakeholders: ['Engineering Lead', 'QA Lead', 'Designer'],
        context: 'We need a way to safely roll out new features to production without full deployment risk.',
        decision: 'We will implement a feature flag system using LaunchDarkly to enable gradual rollouts and A/B testing.',
        businessImpact: 'This will reduce deployment risk by 80% and enable faster iteration on features.',
        successMetrics: [
          { metric: 'Deployment failures', current: '15%', target: '3%', timeline: 'Q2 2025' },
          { metric: 'Feature iteration time', current: '2 weeks', target: '3 days', timeline: 'Q3 2025' },
        ],
      };

      const result = await engine.generate('pmdr', context, { validate: true, save: false });

      expect(result.content).toBeDefined();
      expect(result.content).toContain('# PMDR 001: Implement Feature Flag System');
      expect(result.content).toContain('**Status:** Draft');
      expect(result.content).toContain('**Owner:** Product Manager');
      expect(result.content).toContain('## Stakeholders');
      expect(result.content).toContain('- Engineering Lead');
      expect(result.content).toContain('## Context');
      expect(result.content).toContain('## Decision');
      expect(result.content).toContain('## Business Impact');
      expect(result.content).toContain('## Success Metrics');
      expect(result.templateType).toBe('pmdr');
    });

    it('should fail validation without required fields', async () => {
      const incompleteContext = {
        number: 1,
        title: 'Test',
        // Missing: status, owner, stakeholders, context, decision, businessImpact, successMetrics
      };

      await expect(
        engine.generate('pmdr', incompleteContext, { validate: true, save: false }),
      ).rejects.toThrow(/required.*has no default|missing required/i);
    });
  });

  /**
   * PMDR-02: Success metrics table renders
   * Priority: P0
   */
  describe('PMDR-02: Success metrics table renders', () => {
    it('should render success metrics as a table', async () => {
      const context = {
        number: 2,
        title: 'Test Metrics Rendering',
        status: 'Draft',
        owner: 'PM',
        stakeholders: ['Team'],
        context: 'Testing success metrics rendering in PMDR template.',
        decision: 'Verify metrics table renders correctly with all columns.',
        businessImpact: 'Ensures proper documentation of success criteria.',
        successMetrics: [
          { metric: 'Conversion Rate', current: '2%', target: '5%', timeline: 'Q1' },
          { metric: 'User Engagement', current: '10min', target: '20min', timeline: 'Q2' },
          { metric: 'Revenue Growth', target: '25%' }, // No current value
        ],
      };

      const result = await engine.generate('pmdr', context, { validate: true, save: false });

      // Check table headers
      expect(result.content).toContain('| Metric | Current | Target | Timeline |');
      expect(result.content).toContain('|--------|---------|--------|----------|');

      // Check table rows
      expect(result.content).toContain('| Conversion Rate | 2% | 5% | Q1 |');
      expect(result.content).toContain('| User Engagement | 10min | 20min | Q2 |');
      expect(result.content).toContain('Revenue Growth');
      expect(result.content).toContain('25%');
    });
  });

  /**
   * PMDR-03: Approval workflow renders
   * Priority: P1
   */
  describe('PMDR-03: Approval workflow renders', () => {
    it('should render approval tracking table when approvals exist', async () => {
      const context = {
        number: 3,
        title: 'Test Approval Workflow',
        status: 'Under Review',
        owner: 'PM',
        stakeholders: ['CTO', 'CEO', 'Engineering Lead'],
        context: 'Testing approval workflow rendering.',
        decision: 'Test decision for approval workflow.',
        businessImpact: 'Ensures proper approval tracking.',
        successMetrics: [{ metric: 'Test', target: '100%' }],
        approvals: [
          { stakeholder: 'CTO', decision: 'Approved', date: '2025-01-15', notes: 'LGTM' },
          { stakeholder: 'CE
```
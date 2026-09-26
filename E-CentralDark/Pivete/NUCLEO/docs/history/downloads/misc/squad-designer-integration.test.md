# OUTRO - squad-designer-integration.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\integration\squad\squad-designer-integration.test.js
**SHA:** 740a08da386a101f
**Timestamp:** 2026-08-28T02:19:40.073814
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Integration Tests for Squad Designer Flow
 *
 * End-to-end tests covering the complete workflow:
 * 1. *design-squad: Documentation → Analysis → Recommendations → Blueprint
 * 2. *create-squad --from-design: Blueprint → Squad Structure
 * 3. *validate-squad: Squad Structure → Validation Report
 *
 * @see Story SQS-9: Squad Designer
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const yaml = require('js-yaml');
const {
  SquadDesigner,
  SquadGenerator,
  SquadValidator,
} = require('../../../.aios-core/development/scripts/squad');

describe('Squad Designer Integration', () => {
  let tempDir;
  let docsDir;
  let designsDir;
  let squadsDir;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'squad-designer-integration-'));
    docsDir = path.join(tempDir, 'docs');
    designsDir = path.join(tempDir, 'designs');
    squadsDir = path.join(tempDir, 'squads');

    await fs.mkdir(docsDir, { recursive: true });
    await fs.mkdir(designsDir, { recursive: true });
    await fs.mkdir(squadsDir, { recursive: true });
  });

  afterAll(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Complete Design-to-Squad Flow', () => {
    it('should create valid squad from documentation through design', async () => {
      // Step 1: Create comprehensive documentation
      const prdPath = path.join(docsDir, 'order-management-prd.md');
      await fs.writeFile(
        prdPath,
        `# Order Management System PRD

## Overview
The Order Management System (OMS) handles the complete lifecycle of customer orders from creation to fulfillment.

## Domain
Order Management / E-commerce

## Key Entities
- **Order**: Central entity containing order details, status, and items
- **Customer**: The person or entity placing the order
- **Product**: Items that can be ordered
- **Payment**: Payment information and transaction records
- **Shipment**: Delivery tracking and shipping details

## Core Workflows

### 1. Order Creation (create-order)
- Validate customer information
- Check product availability
- Calculate pricing and taxes
- Initialize order with pending status

### 2. Order Update (update-order)
- Modify order items
- Update quantities
- Recalculate totals

### 3. Order Cancellation (cancel-order)
- Validate cancellation eligibility
- Process refund if applicable
- Update inventory

### 4. Payment Processing (process-payment)
- Validate payment method
- Process transaction via Stripe API
- Update order status

### 5. Shipment Tracking (track-shipment)
- Create shipment via FedEx API
- Update tracking information
- Notify customer

## External Integrations
- **Stripe API**: Payment processing
- **FedEx API**: Shipping and tracking
- **Inventory Service**: Stock management

## User Roles
- **Customer**: Places and tracks orders
- **Administrator**: System configuration
- **Support Staff**: Handle customer issues
- **Warehouse Manager**: Manages fulfillment

## Technical Requirements
- Node.js 18+ runtime
- PostgreSQL database
- Redis caching
- REST API endpoints
`,
      );

      // Step 2: Initialize Designer and Generator
      const designer = new SquadDesigner({ designsPath: designsDir });
      const generator = new SquadGenerator({ squadsPath: squadsDir });
      const validator = new SquadValidator();

      // Step 3: Collect documentation
      const docs = await designer.collectDocumentation({ docs: [prdPath] });
      expect(docs.mergedContent).toContain('Order Management');
      expect(docs.sources.some((s) => s.path === prdPath)).toBe(true);

      // Step 4: Analyze domain
      const analysis = designer.analyzeDomain(docs);

      expect(analysis.domain).toBeDefined();
      expect(analysis.entities.length).toBeGreaterThan(0);
      expect(analysis.workflows.length).toBeGreaterThan(0);
      expect(analysis.integrations.length).toBeGreaterThan(0);
      expect(analysis.stakeholders.length).toBeGreaterThan(0);

      // Verify specific entities were detected
      const entityNames = analysis.entities.join(' ').toLowerCase();
      expect(entityNames).toMatch(/order|customer|product|payment/i);

      // Verify workflows were detected
      const workflowNames = analysis.workflows.join(' ').toLowerCase();
      expect(workflowNames).toMatch(/create|update|cancel/i);

      // Step 5: Generate recommendations
      const agents = designer.generateAgentRecommendations(analysis);
      const tasks = designer.generateTaskRecommendations(analysis, agents);

      expect(agents.length).toBeGreaterThan(0);
      expect(tasks.length).toBeGreaterThan(0);

      // Verify agent structure
      agents.forEach((agent) => {
        expect(agent.id).toMatch(/^[a-z][a-z0-9-]*[a-z0-9]$/);
        expect(agent.role).toBeDefined();
        expect(agent.confidence).toBeGreaterThanOrEqual(0);
        expect(agent.confidence).toBeLessThanOrEqual(1
```
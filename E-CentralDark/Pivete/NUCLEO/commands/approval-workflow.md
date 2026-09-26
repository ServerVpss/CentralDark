# COMANDO - approval-workflow.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\approval-workflow.js
**SHA:** 10278d73d1904efc
**Timestamp:** 2026-08-28T02:02:03.555677
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- auto_approve_low_risk: options.auto_approve_low_risk !== false,
- if (impactReport.riskAssessment.overallRisk === 'critical') {
- low_risk: impactReport.riskAssessment.overallRisk === 'low',
- no_security_risk: impactReport.riskAssessment.riskDimensions?.security_risk?.score < 5

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

/**
 * Approval workflow for AIOS-FULLSTACK framework
 * Manages approval process for high-impact modifications
 */
class ApprovalWorkflow {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.approvalThresholds = {
      low: { auto_approve: true, requires_review: false },
      medium: { auto_approve: false, requires_review: true },
      high: { auto_approve: false, requires_review: true, requires_approval: true },
      critical: { auto_approve: false, requires_review: true, requires_approval: true, requires_multiple_approvers: true }
    };
    this.approvalHistory = [];
    this.pendingApprovals = new Map();
    this.approvalRules = new Map();
    this.initializeApprovalRules();
  }

  /**
   * Initialize default approval rules
   */
  initializeApprovalRules() {
    // Component type rules
    this.approvalRules.set('agent_modification', {
      risk_threshold: 'medium',
      required_approvers: 1,
      timeout_hours: 24,
      auto_approve_conditions: ['low_risk', 'has_tests', 'non_breaking']
    });

    this.approvalRules.set('workflow_modification', {
      risk_threshold: 'medium', 
      required_approvers: 1,
      timeout_hours: 48,
      auto_approve_conditions: ['low_risk', 'has_tests']
    });

    this.approvalRules.set('core_util_modification', {
      risk_threshold: 'low',
      required_approvers: 2,
      timeout_hours: 72,
      auto_approve_conditions: ['minimal_risk', 'comprehensive_tests']
    });

    // Modification type rules
    this.approvalRules.set('component_removal', {
      risk_threshold: 'low',
      required_approvers: 2,
      timeout_hours: 168, // 1 week
      auto_approve_conditions: [] // Never auto-approve removals
    });

    this.approvalRules.set('breaking_change', {
      risk_threshold: 'low',
      required_approvers: 2,
      timeout_hours: 96,
      auto_approve_conditions: []
    });
  }

  /**
   * Process approval request for impact report
   */
  async processApprovalRequest(impactReport, options = {}) {
    const requestId = `approval-${Date.now()}`;
    
    try {
      console.log(chalk.blue(`🔍 Processing approval request for: ${impactReport.targetComponent.path}`));
      
      const _config = {
        skip_approval: options.skip_approval || false,
        auto_approve_low_risk: options.auto_approve_low_risk !== false,
        timeout_hours: options.timeout_hours || 24,
        required_approvers: options.required_approvers,
        ...options
      };

      // Determine approval requirements
      const approvalRequirements = await this.determineApprovalRequirements(impactReport, config);
      
      // Check if modification can be auto-approved
      const autoApprovalResult = await this.checkAutoApproval(impactReport, approvalRequirements);
      
      if (autoApprovalResult.can_auto_approve) {
        const approvalResult = await this.executeAutoApproval(impactReport, autoApprovalResult, requestId);
        return approvalResult;
      }

      // Manual approval required
      const approvalResult = await this.executeManualApproval(
        impactReport, 
        approvalRequirements, 
        config, 
        requestId
      );

      return approvalResult;

    } catch (_error) {
      console.error(chalk.red(`Approval process failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Determine approval requirements based on impact analysis
   */
  async determineApprovalRequirements(impactReport, config) {
    const requirements = {
      approval_needed: false,
      risk_level: impactReport.riskAssessment.overallRisk,
      risk_score: impactReport.riskAssessment.riskScore,
      required_approvers: 1,
      timeout_hours: 24,
      review_criteria: [],
      blocking_issues: []
    };

    const riskLevel = impactReport.riskAssessment.overallRisk;
    const thresholds = this.approvalThresholds[riskLevel];

    // Basic approval requirements from risk level
    if (thresholds) {
      requirements.approval_needed = !thresholds.auto_approve;
      requirements.requires_review = thresholds.requires_review;
      requirements.requires_approval = thresholds.requires_approval;
      requirements.requires_multiple_approvers = thresholds.requires_multiple_approvers;
    }

    // Component-specific rules
    const componentRule = this.getComponentApprovalRule(impactReport.targetComponent);
    if (componentRule) {
      requirements.required_approvers = Math.max(requirements.required_approvers, componentRule.required_approvers);
      requirements.timeout_hours = Math.max(requirements.timeout_hours, componentRule.timeout_hours);
    }

    // Modification-specific rules
    const modificationRule = this.getModificationApprovalRule(impactReport.modificationType);
    if (modificationRule) {
      requirements.required_approvers = Math.max(requirement
```

---

# COMANDO - approval-workflow.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\approval-workflow.js
**SHA:** b3785b070056e8f4
**Timestamp:** 2026-08-28T02:02:12.360857
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- auto_approve_low_risk: options.auto_approve_low_risk !== false,
- if (impactReport.riskAssessment.overallRisk === 'critical') {
- low_risk: impactReport.riskAssessment.overallRisk === 'low',
- no_security_risk: impactReport.riskAssessment.riskDimensions?.security_risk?.score < 5,

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

/**
 * Approval workflow for Synkra AIOS framework
 * Manages approval process for high-impact modifications
 */
class ApprovalWorkflow {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.approvalThresholds = {
      low: { auto_approve: true, requires_review: false },
      medium: { auto_approve: false, requires_review: true },
      high: { auto_approve: false, requires_review: true, requires_approval: true },
      critical: { auto_approve: false, requires_review: true, requires_approval: true, requires_multiple_approvers: true },
    };
    this.approvalHistory = [];
    this.pendingApprovals = new Map();
    this.approvalRules = new Map();
    this.initializeApprovalRules();
  }

  /**
   * Initialize default approval rules
   */
  initializeApprovalRules() {
    // Component type rules
    this.approvalRules.set('agent_modification', {
      risk_threshold: 'medium',
      required_approvers: 1,
      timeout_hours: 24,
      auto_approve_conditions: ['low_risk', 'has_tests', 'non_breaking'],
    });

    this.approvalRules.set('workflow_modification', {
      risk_threshold: 'medium', 
      required_approvers: 1,
      timeout_hours: 48,
      auto_approve_conditions: ['low_risk', 'has_tests'],
    });

    this.approvalRules.set('core_util_modification', {
      risk_threshold: 'low',
      required_approvers: 2,
      timeout_hours: 72,
      auto_approve_conditions: ['minimal_risk', 'comprehensive_tests'],
    });

    // Modification type rules
    this.approvalRules.set('component_removal', {
      risk_threshold: 'low',
      required_approvers: 2,
      timeout_hours: 168, // 1 week
      auto_approve_conditions: [], // Never auto-approve removals
    });

    this.approvalRules.set('breaking_change', {
      risk_threshold: 'low',
      required_approvers: 2,
      timeout_hours: 96,
      auto_approve_conditions: [],
    });
  }

  /**
   * Process approval request for impact report
   */
  async processApprovalRequest(impactReport, options = {}) {
    const requestId = `approval-${Date.now()}`;
    
    try {
      console.log(chalk.blue(`🔍 Processing approval request for: ${impactReport.targetComponent.path}`));
      
      const config = {
        skip_approval: options.skip_approval || false,
        auto_approve_low_risk: options.auto_approve_low_risk !== false,
        timeout_hours: options.timeout_hours || 24,
        required_approvers: options.required_approvers,
        ...options,
      };

      // Determine approval requirements
      const approvalRequirements = await this.determineApprovalRequirements(impactReport, config);
      
      // Check if modification can be auto-approved
      const autoApprovalResult = await this.checkAutoApproval(impactReport, approvalRequirements);
      
      if (autoApprovalResult.can_auto_approve) {
        const approvalResult = await this.executeAutoApproval(impactReport, autoApprovalResult, requestId);
        return approvalResult;
      }

      // Manual approval required
      const approvalResult = await this.executeManualApproval(
        impactReport, 
        approvalRequirements, 
        config, 
        requestId,
      );

      return approvalResult;

    } catch (error) {
      console.error(chalk.red(`Approval process failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Determine approval requirements based on impact analysis
   */
  async determineApprovalRequirements(impactReport, config) {
    const requirements = {
      approval_needed: false,
      risk_level: impactReport.riskAssessment.overallRisk,
      risk_score: impactReport.riskAssessment.riskScore,
      required_approvers: 1,
      timeout_hours: 24,
      review_criteria: [],
      blocking_issues: [],
    };

    const riskLevel = impactReport.riskAssessment.overallRisk;
    const thresholds = this.approvalThresholds[riskLevel];

    // Basic approval requirements from risk level
    if (thresholds) {
      requirements.approval_needed = !thresholds.auto_approve;
      requirements.requires_review = thresholds.requires_review;
      requirements.requires_approval = thresholds.requires_approval;
      requirements.requires_multiple_approvers = thresholds.requires_multiple_approvers;
    }

    // Component-specific rules
    const componentRule = this.getComponentApprovalRule(impactReport.targetComponent);
    if (componentRule) {
      requirements.required_approvers = Math.max(requirements.required_approvers, componentRule.required_approvers);
      requirements.timeout_hours = Math.max(requirements.timeout_hours, componentRule.timeout_hours);
    }

    // Modification-specific rules
    const modificationRule = this.getModificationApprovalRule(impactReport.modificationType);
    if (modificationRule) {
      requirements.required_approvers = Math.max(requiremen
```
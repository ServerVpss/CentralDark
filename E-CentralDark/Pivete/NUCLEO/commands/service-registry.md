# COMANDO - service-registry.json
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\registry\service-registry.json
**SHA:** 00f18727622526fa
**Timestamp:** 2026-08-28T02:02:00.793923
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- "description": "Atomic Layer Classifier\r Story: 6.1.7.1 - Task Content Completion\r Purpose: Resolve {TODO: Atom|Molecule|Organism} placeholders in all 114 task files",

### Ouro Bruto (primeiros 5000 chars)
```
{
  "version": "1.0.0",
  "generated": "2025-11-29T22:20:21.295Z",
  "totalWorkers": 203,
  "categories": {
    "checklist": {
      "count": 6,
      "subcategories": [
        "quality"
      ],
      "description": "Quality validation checklists"
    },
    "data": {
      "count": 3,
      "subcategories": [
        "configuration",
        "knowledge"
      ],
      "description": "Knowledge base and configuration data"
    },
    "script": {
      "count": 54,
      "subcategories": [
        "analysis",
        "configuration",
        "generation",
        "management",
        "testing",
        "utility",
        "validation"
      ],
      "description": "JavaScript utility scripts"
    },
    "task": {
      "count": 115,
      "subcategories": [
        "analysis",
        "creation",
        "general",
        "modification",
        "validation"
      ],
      "description": "Executable task workflows for agents"
    },
    "template": {
      "count": 19,
      "subcategories": [
        "document",
        "ide-rules",
        "personalized"
      ],
      "description": "Document and code templates"
    },
    "workflow": {
      "count": 6,
      "subcategories": [
        "brownfield",
        "greenfield"
      ],
      "description": "Multi-step workflow definitions"
    }
  },
  "workers": [
    {
      "id": "architect-checklist",
      "name": "Architect Checklist",
      "description": "This checklist serves as a comprehensive framework for the Architect to validate the technical design and architecture before development execution. The Architect should systematically work through ea",
      "category": "checklist",
      "subcategory": "quality",
      "inputs": [],
      "outputs": [],
      "tags": [
        "checklist",
        "quality",
        "architect",
        "validation"
      ],
      "path": ".aios-core/product/checklists/architect-checklist.md",
      "taskFormat": "CHECKLIST",
      "executorTypes": [
        "Agent"
      ],
      "performance": {
        "avgDuration": "2m",
        "cacheable": false,
        "parallelizable": false
      },
      "agents": [
        "architect"
      ],
      "metadata": {
        "source": "product",
        "addedVersion": "1.0.0"
      }
    },
    {
      "id": "change-checklist",
      "name": "Change Checklist",
      "description": "Purpose: To systematically guide the selected Agent and user through the analysis and planning required when a significant change (pivot, tech issue, missing requirement, failed story) is identified d",
      "category": "checklist",
      "subcategory": "quality",
      "inputs": [],
      "outputs": [],
      "tags": [
        "checklist",
        "quality",
        "change",
        "validation"
      ],
      "path": ".aios-core/product/checklists/change-checklist.md",
      "taskFormat": "CHECKLIST",
      "executorTypes": [
        "Agent"
      ],
      "performance": {
        "avgDuration": "2m",
        "cacheable": false,
        "parallelizable": false
      },
      "agents": [],
      "metadata": {
        "source": "product",
        "addedVersion": "1.0.0"
      }
    },
    {
      "id": "pm-checklist",
      "name": "Pm Checklist",
      "description": "This checklist serves as a comprehensive framework to ensure the Product Requirements Document (PRD) and Epic definitions are complete, well-structured, and appropriately scoped for MVP development. T",
      "category": "checklist",
      "subcategory": "quality",
      "inputs": [],
      "outputs": [],
      "tags": [
        "checklist",
        "quality",
        "validation"
      ],
      "path": ".aios-core/product/checklists/pm-checklist.md",
      "taskFormat": "CHECKLIST",
      "executorTypes": [
        "Agent"
      ],
      "performance": {
        "avgDuration": "2m",
        "cacheable": false,
        "parallelizable": false
      },
      "agents": [
        "pm"
      ],
      "metadata": {
        "source": "product",
        "addedVersion": "1.0.0"
      }
    },
    {
      "id": "po-master-checklist",
      "name": "Po Master Checklist",
      "description": "This checklist serves as a comprehensive framework for the Product Owner to validate project plans before development execution. It adapts intelligently based on project type (greenfield vs brownfield",
      "category": "checklist",
      "subcategory": "quality",
      "inputs": [],
      "outputs": [],
      "tags": [
        "checklist",
        "quality",
        "master",
        "validation",
        "product"
      ],
      "path": ".aios-core/product/checklists/po-master-checklist.md",
      "taskFormat": "CHECKLIST",
      "executorTypes": [
        "Agent"
      ],
      "performance": {
        "avgDuration": "2m",
        "cacheable": false,
        "parallelizable": false
      },
      "agents": [
        "po"
      ],
      "metadata": {
        "source": "product",
        "addedVersion": "1.0.0"
      }
    },
    {
      "id": "
```
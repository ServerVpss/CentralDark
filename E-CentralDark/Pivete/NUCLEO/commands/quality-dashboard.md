# COMANDO - quality-dashboard.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\quality-dashboard.md
**SHA:** 21bd0ad417165cfd
**Timestamp:** 2026-08-28T02:02:36.387021
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Ensure the metrics collector has run:

### Ouro Bruto (primeiros 5000 chars)
```
# Quality Gates Dashboard Guide

> **EN** | [PT](../pt/guides/quality-dashboard.md) | [ES](../es/guides/quality-dashboard.md)

---

> Visual dashboard for monitoring quality metrics across all 3 layers.

**Version:** 1.0
**Last Updated:** 2025-12-05

---

## Overview

The Quality Gates Dashboard provides real-time visualization of quality metrics collected from all three quality gate layers. It helps tech leads and developers monitor code quality trends, identify issues, and track the effectiveness of the quality gates system.

### Key Features

| Feature               | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| **3-Layer Metrics**   | View pass rates for Pre-Commit, PR Review, and Human Review |
| **Trend Charts**      | Track auto-catch rate over the last 30 days                 |
| **Real-time Updates** | Auto-refresh every 60 seconds                               |
| **Responsive Design** | Works on desktop, tablet, and mobile                        |
| **Accessibility**     | WCAG 2.1 AA compliant                                       |
| **Dark Mode**         | Automatic based on system preference                        |

---

## Accessing the Dashboard

### Development Mode

```bash
# Navigate to dashboard directory
cd tools/quality-dashboard

# Sync metrics and start development server
npm run dev:sync

# Or sync separately
npm run sync-metrics
npm run dev
```

The dashboard will open at `http://localhost:3000`.

### Production Build

```bash
# Build for production
cd tools/quality-dashboard
npm run build

# Preview production build
npm run preview

# Serve from dist/ directory
npx serve dist
```

### Direct File Access

Open the pre-built dashboard:

```
tools/quality-dashboard/dist/index.html
```

---

## Understanding the Dashboard

### Header Section

```
┌─────────────────────────────────────────────────────────┐
│  📊 Quality Gates Dashboard                             │
│  Last Update: Dec 5, 2025 14:30:00                     │
│  [🔄 Refresh] [Auto-refresh: 60s ▼]                    │
└─────────────────────────────────────────────────────────┘
```

| Element            | Description                               |
| ------------------ | ----------------------------------------- |
| **Last Update**    | Timestamp of most recent data fetch       |
| **Refresh Button** | Manual refresh without page reload        |
| **Auto-refresh**   | Configurable interval (30s, 60s, 5m, off) |

### Layer Cards

Each quality gate layer has its own metrics card:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Pre-Commit                        ● Healthy  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Pass Rate: 94.5%    Avg Time: 32s    Total Runs: 156  │
│  ████████████████░░                                     │
│                                                         │
│  [Click to expand]                                      │
└─────────────────────────────────────────────────────────┘
```

#### Layer 1: Pre-Commit

| Metric         | Description                                             |
| -------------- | ------------------------------------------------------- |
| **Pass Rate**  | % of commits passing all checks (lint, test, typecheck) |
| **Avg Time**   | Average time to complete all Layer 1 checks             |
| **Total Runs** | Number of pre-commit runs in the time period            |

#### Layer 2: PR Review

| Metric                  | Description                              |
| ----------------------- | ---------------------------------------- |
| **Pass Rate**           | % of PRs passing automated review        |
| **CodeRabbit Findings** | Issues found by CodeRabbit (by severity) |
| **Quinn Findings**      | Issues found by @qa agent                |
| **Auto-Catch Rate**     | % of issues caught before human review   |

**Expanded View (click to expand):**

```
┌─────────────────────────────────────────────────────────┐
│  Layer 2: PR Review                         ● Warning  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Pass Rate: 87.2%    Avg Time: 4m 32s   Total: 45 PRs │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ CodeRabbit Breakdown                            │   │
│  │ CRITICAL: 3  │  HIGH: 12  │  MEDIUM: 28        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Quinn (@qa) Findings                            │   │
│  │ Blockers: 2  │  Warnings: 8  │  Info: 15       │   │
│  └─────────────────────────────────────────────────┘   │
│                                             
```
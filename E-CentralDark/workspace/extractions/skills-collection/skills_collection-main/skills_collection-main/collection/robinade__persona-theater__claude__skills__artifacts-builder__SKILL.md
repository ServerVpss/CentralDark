---
name: artifacts-builder
description: Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.
license: Complete terms in LICENSE.txt
---

# Artifacts Builder

Toolkit for creating sophisticated, multi-component HTML artifacts optimized for Claude.ai using contemporary frontend technologies including React 18, TypeScript, Vite, Tailwind CSS 3.4.1, and the shadcn/ui component library.

## When to Use This Skill

Use this skill when users request complex artifacts requiring:
- State management capabilities
- Routing functionality
- shadcn/ui component library components
- Multi-component React architectures

**Do NOT use for:**
- Simple single-file HTML artifacts
- Basic JSX components without complex dependencies
- Quick prototypes that don't require the full React + TypeScript stack

## Technology Stack

The initialization process automatically provides:
- **React 18** with TypeScript
- **Vite** for development (version-compatible with Node.js version)
- **Parcel** for production bundling
- **Tailwind CSS 3.4.1** with custom theming
- **shadcn/ui** with 40+ pre-installed components
- **Radix UI** primitives and dependencies
- Path aliases using `@/` notation
- Dark mode support via CSS variables
- Node 18+ compatibility

## Core Workflow

Follow these five steps to create and share artifacts:

### Step 1: Initialize Project

Run the initialization script to create a new React project with all dependencies configured:

```bash
bash scripts/init-artifact.sh <project-name>
```

**What this does:**
- Validates Node.js 18+ installation
- Creates Vite React TypeScript project
- Installs and configures Tailwind CSS with shadcn theming
- Sets up path aliases (@/* for src/)
- Extracts 40+ pre-installed shadcn/ui components
- Configures dark mode support
- Creates components.json configuration

**Requirements:**
- Node.js 18 or higher
- The `shadcn-components.tar.gz` file must be present in the `scripts/` directory
  - **Important:** Download this file from https://github.com/anthropics/skills/tree/main/artifacts-builder/scripts
  - Place it in `.claude/skills/artifacts-builder/scripts/` before running init-artifact.sh

### Step 2: Develop the Artifact

After initialization, modify the generated files to build your artifact:
- Edit `src/App.tsx` for your main application logic
- Create components in `src/components/`
- Use pre-installed shadcn/ui components via `@/components/ui/`
- Style with Tailwind CSS classes and CSS variables

**Available Components (40+ total):**
- Layout: accordion, aspect-ratio, card, collapsible, resizable, scroll-area, separator, sheet, tabs
- Forms: button, checkbox, form, input, label, radio-group, select, slider, switch, textarea
- Navigation: breadcrumb, command, context-menu, dropdown-menu, menubar, navigation-menu
- Feedback: alert, badge, progress, skeleton, sonner, toast
- Overlays: dialog, drawer, hover-card, popover, tooltip
- Data: calendar, carousel, table
- Other: avatar, toggle, toggle-group

**Import pattern:**
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
```

### Step 3: Bundle into Single HTML

When development is complete, create a self-contained HTML artifact:

```bash
bash scripts/bundle-artifact.sh
```

**What this does:**
- Installs Parcel and bundling dependencies
- Creates `.parcelrc` configuration with TypeScript path alias support
- Cleans previous builds
- Builds optimized production bundle (no source maps)
- Inlines all JavaScript, CSS, and assets into single HTML file
- Outputs `bundle.html` with file size information

**Output:**
A single `bundle.html` file containing the complete React application with all dependencies embedded inline, suitable for sharing in Claude conversations.

### Step 4: Share the Artifact

Use the generated `bundle.html` file as an artifact in Claude conversations or share it directly with users. The file is:
- Self-contained (no external dependencies)
- Portable (works in any modern browser)
- Optimized (production build with minification)

### Step 5: Test/Visualize (Optional)

Test the artifact by opening `bundle.html` in a browser. Only recommended if issues arise during development or if verification is needed before sharing.

## Design Guidance

Avoid creating "AI slop" aesthetics. Specifically avoid:
- Excessive centered layouts
- Purple gradients as default theme
- Uniform rounded corners everywhere
- Inter font as the only typeface

Instead, create intentional, varied designs that match the artifact's purpose and context.

## Available Scripts

### `scripts/init-artifact.sh`
Initializes a new React + Vite + shadcn/ui project with full configuration.

**Usage:** `bash scripts/init-artifact.sh <project-name>`

**Features:**
- Node version detection and Vite version compatibility
- Cross-platform support (macOS/Linux)
- Automatic pnpm installation if unavailable
- Complete Tailwind CSS setup with shadcn theme
- Path alias configuration in TypeScript
- 40+ shadcn/ui components extraction

### `scripts/bundle-artifact.sh`
Bundles the React application into a single HTML file.

**Usage:** `bash scripts/bundle-artifact.sh` (run from project root)

**Requirements:**
- Must be run from project directory containing `package.json`
- Requires `index.html` in project root

**Output:** `bundle.html` in project root

## Resources

- **shadcn/ui Documentation:** https://ui.shadcn.com/docs/components
- **Component Examples:** Browse shadcn/ui docs for usage patterns and props
- **Tailwind CSS:** https://tailwindcss.com/docs
- **React Documentation:** https://react.dev

## Installation Notes

**First-time Setup:**
1. Download `shadcn-components.tar.gz` from Anthropic's skills repository
2. Place it in `.claude/skills/artifacts-builder/scripts/`
3. Verify scripts have executable permissions: `chmod +x scripts/*.sh`

**System Requirements:**
- Node.js 18+ (Node 20+ recommended for latest Vite)
- macOS or Linux (cross-platform sed support)
- pnpm (installed automatically if missing)

## Troubleshooting

**"shadcn-components.tar.gz not found"**
- Download from https://github.com/anthropics/skills/tree/main/artifacts-builder/scripts
- Place in `.claude/skills/artifacts-builder/scripts/`

**"Node.js 18 or higher is required"**
- Update Node.js: https://nodejs.org/

**Bundle size too large**
- Review included dependencies
- Consider code splitting for very large applications
- Remove unused shadcn/ui components if needed

**Path alias not resolving**
- Verify `tsconfig.json` and `tsconfig.app.json` have `baseUrl` and `paths` configured
- Check `.parcelrc` includes `parcel-resolver-tspaths`

## Examples

**Basic Usage:**
```bash
# Initialize project
bash scripts/init-artifact.sh my-dashboard

# Develop application
cd my-dashboard
pnpm dev

# Bundle when ready
bash scripts/bundle-artifact.sh
```

**Using Components:**
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

## License

This skill is licensed under the Apache License 2.0. See LICENSE.txt for complete terms.

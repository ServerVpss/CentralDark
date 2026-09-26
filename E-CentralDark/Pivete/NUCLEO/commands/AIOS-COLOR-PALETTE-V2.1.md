# COMANDO - AIOS-COLOR-PALETTE-V2.1.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\docs\standards\AIOS-COLOR-PALETTE-V2.1.md
**SHA:** 11f894b8d3f68ae3
**Timestamp:** 2026-08-28T02:02:10.583925
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: chalk.hex('#EC4899'),      // Magenta

### Ouro Bruto (primeiros 5000 chars)
```
# AIOS Color Palette v2.1

**Version:** 2.1.0  
**Created:** 2025-01-20  
**Status:** Active  
**Scope:** All AIOS CLI tools, installer, and visual outputs

---

## 🎨 Brand Identity

### Logo Inspiration

The AIOS color palette is derived from the brand logo's vibrant gradient:
- **Top gradient:** Magenta → Pink → Orange → Yellow
- **Bottom gradient:** Purple → Blue → Cyan

### Primary Brand Reference

The primary purple color (#8B5CF6) references **ClickUp's brand purple**, establishing visual consistency with our project management ecosystem.

---

## 🌈 Core Color Palette

### Brand Colors

| Color | Hex | Chalk Variable | Usage |
|-------|-----|----------------|-------|
| **Primary Purple** | `#8B5CF6` | `chalk.hex('#8B5CF6')` | Main questions, headers, CTAs, branding |
| **Secondary Magenta** | `#EC4899` | `chalk.hex('#EC4899')` | Important highlights, special emphasis |
| **Tertiary Blue** | `#3B82F6` | `chalk.hex('#3B82F6')` | Secondary actions, links, info accents |

### Functional Colors

| Color | Hex | Chalk Variable | Usage |
|-------|-----|----------------|-------|
| **Success Green** | `#10B981` | `chalk.hex('#10B981')` | Checkmarks, completed steps, success messages |
| **Warning Orange** | `#F59E0B` | `chalk.hex('#F59E0B')` | Warnings, confirmations, caution states |
| **Error Red** | `#EF4444` | `chalk.hex('#EF4444')` | Errors, critical alerts, validation failures |
| **Info Cyan** | `#06B6D4` | `chalk.hex('#06B6D4')` | Info messages, tips, helper text |

### Neutral Colors

| Color | Hex | Chalk Variable | Usage |
|-------|-----|----------------|-------|
| **Muted Gray** | `#94A3B8` | `chalk.hex('#94A3B8')` | Subtle text, disabled states |
| **Dim Gray** | `#64748B` | `chalk.hex('#64748B')` | Secondary text, muted content |

### Gradient Palette

For special effects, animations, and branding moments:

| Position | Hex | Chalk Variable | Visual |
|----------|-----|----------------|--------|
| **Start** | `#EC4899` | `chalk.hex('#EC4899')` | Magenta (logo top) |
| **Middle** | `#8B5CF6` | `chalk.hex('#8B5CF6')` | Purple (brand) |
| **End** | `#3B82F6` | `chalk.hex('#3B82F6')` | Blue (logo bottom) |

---

## 📐 Color System Architecture

### JavaScript/Node.js Implementation

```javascript
const chalk = require('chalk');

// AIOS Color Palette v2.1
const colors = {
  // Core Brand Colors
  primary: chalk.hex('#8B5CF6'),      // ClickUp-inspired purple
  secondary: chalk.hex('#EC4899'),    // Magenta accent
  tertiary: chalk.hex('#3B82F6'),     // Blue accent
  
  // Functional Colors
  success: chalk.hex('#10B981'),      // Green
  warning: chalk.hex('#F59E0B'),      // Orange
  error: chalk.hex('#EF4444'),        // Red
  info: chalk.hex('#06B6D4'),         // Cyan
  
  // Neutral Colors
  muted: chalk.hex('#94A3B8'),        // Light gray
  dim: chalk.hex('#64748B'),          // Dark gray
  
  // Gradient System
  gradient: {
    start: chalk.hex('#EC4899'),      // Magenta
    middle: chalk.hex('#8B5CF6'),     // Purple
    end: chalk.hex('#3B82F6')         // Blue
  },
  
  // Semantic Shortcuts
  highlight: chalk.hex('#EC4899').bold,
  brandPrimary: chalk.hex('#8B5CF6').bold,
  brandSecondary: chalk.hex('#06B6D4')
};

module.exports = colors;
```

### CSS/Tailwind Implementation

```css
:root {
  /* Brand Colors */
  --aios-primary: #8B5CF6;
  --aios-secondary: #EC4899;
  --aios-tertiary: #3B82F6;
  
  /* Functional Colors */
  --aios-success: #10B981;
  --aios-warning: #F59E0B;
  --aios-error: #EF4444;
  --aios-info: #06B6D4;
  
  /* Neutral Colors */
  --aios-muted: #94A3B8;
  --aios-dim: #64748B;
  
  /* Gradient */
  --aios-gradient: linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #3B82F6 100%);
}
```

### Tailwind Config Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        aios: {
          primary: '#8B5CF6',
          secondary: '#EC4899',
          tertiary: '#3B82F6',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#06B6D4',
          muted: '#94A3B8',
          dim: '#64748B',
        }
      },
      backgroundImage: {
        'aios-gradient': 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #3B82F6 100%)',
      }
    }
  }
}
```

---

## 🎯 Usage Guidelines

### Visual Hierarchy

**Level 1: Brand Emphasis**
- Use `colors.brandPrimary` (purple bold) for AIOS branding
- Example: Welcome screens, major section headers

```javascript
console.log(colors.brandPrimary('🎉 AIOS v2.1 Installer'));
```

**Level 2: Primary Content**
- Use `colors.primary` (purple) for main questions and headers
- Example: Wizard questions, menu options

```javascript
message: colors.primary('Select your project type:')
```

**Level 3: Secondary Content**
- Use `colors.info` (cyan) for supporting information
- Example: Tips, helper text, additional context

```javascript
console.log(colors.info('💡 Tip: You can change this later'));
```

**Level 4: Feedback States**
- Use semantic colors fo
```
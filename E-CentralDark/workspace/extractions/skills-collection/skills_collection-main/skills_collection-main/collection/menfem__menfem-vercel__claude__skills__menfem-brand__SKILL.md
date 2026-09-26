---
name: menfem-brand
description: This skill should be used when applying brand colors, typography, visual formatting, or design standards to any document, presentation, artifact, or creative output. Use when brand consistency, color palette application, typographic styling, or visual design standards are needed. (project)
---

# MenFem Brand Skill

## Overview

Apply consistent dark-first brand colors, typography, and visual styling to all outputs. Think Monocle, Hodinkee - sophisticated, editorial, cinematic.

**Brand Personality:** Provocative Challenger - bold, contrarian, question everything. Substantive provocation, not clickbait.

## When to Use This Skill

Use this skill when:
- Building UI components with brand styling
- Creating documents that need brand formatting (reports, presentations, PDFs)
- Applying color schemes to visualizations or graphics
- Formatting text with brand typography
- Generating image or video prompts
- Creating social media content (Instagram, YouTube, Twitter/X)
- Designing newsletters with email-safe dark styling
- Creating thumbnails (Anti-YouTube style)
- Ensuring visual consistency across artifacts

## Source of Truth

**All brand specifications live in `docs/brand/`.** Read the appropriate file for your task:

| Task | Read This File |
|------|----------------|
| Colors, typography, components | `docs/brand/quick-reference.md` |
| Social media (Instagram, YouTube, Twitter) | `docs/brand/social-media.md` |
| Newsletter dark digest format | `docs/brand/newsletter.md` |
| Video, thumbnails, motion graphics | `docs/brand/video-motion.md` |
| Charts and data visualization | `docs/brand/charts-data-visualization.md` |
| PDFs and reports | `docs/brand/pdfs-reports.md` |
| Audience, voice, positioning | `docs/brand/content-strategy.md` |
| Image generation prompts | `docs/brand/prompts/image-generation.md` |
| Video generation prompts | `docs/brand/prompts/video-generation.md` |
| Film/camera terminology | `docs/brand/prompts/film-directing.md` |
| 3D models, materials, lighting | `docs/brand/3d-assets.md` |

**Start with `docs/brand/README.md`** for a hub linking to all brand documentation.

## Quick Reference (Read Full Docs for Details)

### Dark-First Color Palette

| Color | Hex | Tailwind | Primary Use |
|-------|-----|----------|-------------|
| Noir | `#0A0A0A` | `brand-noir` | Page backgrounds |
| Charcoal | `#1A1A1A` | `brand-charcoal` | Cards, sections |
| Smoke | `#2A2A2A` | `brand-smoke` | Borders, dividers |
| Bone | `#F5F3ED` | `brand-bone` | Primary text |
| Copper | `#C17A5E` | `brand-copper` | CTAs, accents, links (SOLE WARM ACCENT) |
| Rust | `#8C5945` | `brand-rust` | Hover states only |

### Text Opacity Scale

```
100%   text-white / text-bone         Primary headings
70%    text-white/70                  Body text
50%    text-white/50                  Placeholders
10%    border-white/10                Card borders
```

### Universal Principles

- **Dark backgrounds** (noir, charcoal, smoke) for all content areas
- **Copper as SOLE warm accent** (no terracotta, sand, sage)
- **Sharp corners** (0px radius) on all components except form inputs
- **Smooth transitions** (300-500ms duration)
- **Solid CTAs** (`bg-brand-copper hover:bg-brand-rust`)
- **UPPERCASE** for section headers and buttons
- **4.5:1 contrast** minimum for accessibility

### Anti-YouTube Thumbnail Style

**DO:** Dark cinematic backgrounds, bold UPPERCASE text, high-contrast photography, copper accent on ONE element, mysterious mood

**DON'T:** Exaggerated faces, arrows/circles, bright yellow/red/neon, cluttered compositions, emoji overlays

## Behavioral Instructions

### When Building UI Components

1. Read `docs/brand/quick-reference.md` for the full component pattern library
2. Use dark card pattern: `bg-brand-charcoal border border-white/10`
3. Apply hover effects: `hover:border-brand-copper/50 hover:shadow-xl hover:shadow-brand-copper/10`
4. Verify accessibility (contrast ratios, focus states)

### When Creating Social Media Content

1. Read `docs/brand/social-media.md` for platform-specific templates
2. Use noir backgrounds, copper accents only
3. Follow Anti-YouTube style for thumbnails
4. Include AI prompt guidance for image generation

### When Creating Newsletters

1. Read `docs/brand/newsletter.md` for dark digest format
2. Use charcoal background (#1A1A1A), copper accents
3. Structure as curated digest (3-5 items)
4. Apply email-safe styling patterns

### When Generating Image/Video Prompts

1. Read the relevant prompt doc (`docs/brand/prompts/image-generation.md` or `video-generation.md`)
2. Include style keywords: "dark masculine luxury, editorial photography, noir background, copper accent"
3. Reference Anti-YouTube principles for thumbnails
4. Add to "Proven Examples" section in the doc if generation succeeds

### When Creating Documents (PDFs, Reports)

1. Read `docs/brand/pdfs-reports.md` for layout specs
2. Use dark backgrounds (charcoal) with white/bone text
3. Copper accents for headers and highlights only
4. Check brand checklist before finalizing

### Priority When Ambiguous

If docs don't cover a specific case:
1. Default to dark background (noir or charcoal)
2. Use copper as sole warm accent
3. Maintain sharp corners
4. Add smooth transitions
5. Ask user if still unclear

## Brand Checklist

Before finalizing any branded output:

- [ ] Dark background (noir, charcoal, or smoke)
- [ ] Copper is the ONLY warm accent
- [ ] Text is white or bone (never brown on dark)
- [ ] Sharp corners (0px radius) except form inputs
- [ ] UPPERCASE for headings and buttons
- [ ] Smooth transitions (300-500ms)
- [ ] Solid copper CTAs (not gradient)
- [ ] 4.5:1 contrast ratio for text
- [ ] Editorial, sophisticated feel (not clickbait)

## Related Skills

- **content-refiner** — For writing methodology, voice, and story structure (what things *say*)
- **newsletter-style** — For React Email templates with email-safe brand styling

This skill handles **what things look like**. For **what things say**, use `content-refiner`.

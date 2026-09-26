---
name: design-improvement
description: |
  Automated design optimization workflow for young-personal-site.
  Auto-activates on "設計", "design", "UI", "很醜", "不好看", "改進視覺" keywords.
  Provides design improvements following project design principles (color, layout, typography, spacing).
allowed-tools: [Read, Edit, Write, Bash, Grep, Glob]
---

# Design Improvement Skill

## Purpose
Streamline website design optimization with systematic improvements following established design principles.

**Prevents**:
- ❌ Inconsistent design changes
- ❌ Breaking responsive layouts
- ❌ Violating brand guidelines
- ❌ Poor accessibility

**Ensures**:
- ✅ Follows project color palette (slate-blue, coral-orange, warm-cream)
- ✅ Maintains responsive design (mobile-first)
- ✅ Consistent spacing and typography
- ✅ Professional appearance across all pages

---

## Auto-Activation

Triggers on:
- ✅ "設計", "design", "UI", "UX"
- ✅ "很醜", "不好看", "改進視覺"
- ✅ "排版", "layout", "顏色", "color"
- ✅ "間距", "spacing", "字體", "font"

---

## Design Principles (from CLAUDE.md)

### Color Palette
```css
Primary: slate-blue (#475569, #64748b)
Accent: coral-orange (#fb923c, #f97316)
Background: warm-cream (#fef3c7, #fef9c3)
Gradients: Smooth transitions for visual interest
```

### Typography Hierarchy
```
- Clear heading hierarchy (h1 > h2 > h3)
- Readable font sizes (16px+ for body)
- Consistent line-height and spacing
- Center-aligned hero sections
```

### Layout Standards
```
- Mobile-first responsive design
- Tailwind spacing utilities (p-4, m-6, gap-8, etc.)
- Smooth Framer Motion animations
- Professional, clean appearance
```

---

## Workflow: Design Improvement

### Step 1: Analyze Current Design

**Identify issues**:
```markdown
Current Issues Checklist:
- [ ] Color consistency problems?
- [ ] Layout/alignment issues?
- [ ] Typography hierarchy unclear?
- [ ] Spacing inconsistent?
- [ ] Responsive breakpoints broken?
- [ ] Animations too aggressive/missing?
```

**Example**:
```bash
# Read the page component
Read app/[locale]/page.tsx

# Check for design patterns
Grep "className" --output_mode content -A 2
```

### Step 2: Propose Improvements (CARIO Format)

```markdown
## Design Improvement Proposal

📋 **Context**
- Page: [Home / Projects / About / Speaking]
- Current state: [Brief description]
- Design issue: [What looks bad]

❓ **Problems Identified**
1. [Color inconsistency]
2. [Poor spacing]
3. [Weak hierarchy]

🎯 **Improvement Options**

**Option A**: [Minor tweaks]
- Changes: [List]
- Impact: Low
- Time: 15 min

**Option B**: [Moderate redesign]
- Changes: [List]
- Impact: Medium
- Time: 30-45 min

**Option C**: [Major overhaul]
- Changes: [List]
- Impact: High
- Time: 1-2 hours

💡 **Recommendation**
- Recommended: [Option B]
- Reasoning: [Balances improvement vs time]
- Specific changes:
  1. Update color from X to Y
  2. Increase spacing from p-4 to p-6
  3. Add gradient background

⚡ **Impact**
- Files affected: [List]
- Testing needed: [Responsive + visual]
- Deployment: [Auto via Vercel]
```

### Step 3: Get User Confirmation

**Ask user**:
```
I've identified [N] design improvements for the [Page] page.

Recommended changes:
1. [Change 1]
2. [Change 2]
3. [Change 3]

Should I proceed with these improvements?
```

### Step 4: Implement Changes

**Implementation checklist**:
```markdown
- [ ] Update component styles (Tailwind classes)
- [ ] Ensure responsive design (sm:, md:, lg: breakpoints)
- [ ] Add/update animations (Framer Motion)
- [ ] Maintain color palette consistency
- [ ] Follow typography hierarchy
```

**Example**:
```tsx
// Before
<div className="p-4 bg-white">
  <h1 className="text-2xl">Title</h1>
</div>

// After (with design improvements)
<div className="p-6 md:p-8 bg-gradient-to-br from-warm-cream to-white">
  <h1 className="text-3xl md:text-4xl font-bold text-slate-700
                 text-center mb-6">
    Title
  </h1>
</div>
```

### Step 5: Test Responsive Design

**Test on multiple breakpoints**:
```bash
# Start dev server
npm run dev

# Test in browser at:
# - Mobile: 375px
# - Tablet: 768px
# - Desktop: 1280px
```

**Visual checklist**:
- [ ] Mobile (< 640px): Readable, no overflow
- [ ] Tablet (640-1024px): Proper spacing
- [ ] Desktop (> 1024px): Optimal layout
- [ ] Dark mode (if applicable): Contrast OK
- [ ] Animations: Smooth, not jarring

### Step 6: Commit and Deploy

```bash
# Format code (if needed)
npm run lint

# Build to verify
npm run build

# Commit
git add .
git commit -m "style: improve [page] design with better spacing and colors"

# Push (auto-deploys to Vercel)
git push
```

---

## Common Design Improvements

### Improvement 1: Better Hero Section

**Before**:
```tsx
<section className="py-12">
  <h1 className="text-3xl">Welcome</h1>
  <p className="text-base">Description</p>
</section>
```

**After**:
```tsx
<section className="py-16 md:py-24 bg-gradient-to-br from-warm-cream via-white to-blue-50">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-center"
  >
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold
                   bg-gradient-to-r from-slate-600 to-slate-800
                   bg-clip-text text-transparent mb-6">
      Welcome
    </h1>
    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
      Description
    </p>
  </motion.div>
</section>
```

### Improvement 2: Card Grid Layout

**Before**:
```tsx
<div className="grid grid-cols-3 gap-4">
  {projects.map(p => <Card key={p.id} {...p} />)}
</div>
```

**After**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
                gap-6 md:gap-8 lg:gap-10 p-4 md:p-6">
  {projects.map(p => (
    <motion.div
      key={p.id}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <Card {...p} />
    </motion.div>
  ))}
</div>
```

### Improvement 3: Typography Hierarchy

**Before**:
```tsx
<h1>Title</h1>
<h2>Subtitle</h2>
<p>Body text</p>
```

**After**:
```tsx
<h1 className="text-4xl md:text-5xl font-bold text-slate-800
               mb-4 leading-tight">
  Title
</h1>
<h2 className="text-2xl md:text-3xl font-semibold text-slate-700
               mb-6 leading-snug">
  Subtitle
</h2>
<p className="text-base md:text-lg text-slate-600 leading-relaxed
              max-w-prose">
  Body text
</p>
```

---

## Design Quality Checklist

Before committing design changes:

### Visual Quality
- [ ] Colors match palette (slate-blue, coral-orange, warm-cream)
- [ ] Spacing is consistent (4px increments: p-4, p-6, p-8)
- [ ] Typography hierarchy clear (h1 > h2 > h3 > p)
- [ ] Contrast ratio accessible (WCAG AA: 4.5:1 for text)

### Responsive Design
- [ ] Mobile layout works (< 640px)
- [ ] Tablet layout optimized (640-1024px)
- [ ] Desktop layout polished (> 1024px)
- [ ] No horizontal scroll on any device
- [ ] Touch targets ≥ 44px on mobile

### Performance
- [ ] Animations smooth (60fps)
- [ ] No layout shift (CLS < 0.1)
- [ ] Images optimized (Next.js Image component)
- [ ] Font loading optimized (next/font)

### Consistency
- [ ] Matches existing pages' style
- [ ] Follows Tailwind conventions
- [ ] Uses Framer Motion patterns consistently
- [ ] Maintains bilingual support (zh-TW/en)

---

## Integration with Other Tools

### Works with content-update
```
User: "Add new project with nice design"
→ content-update: Add project content
→ design-improvement: Apply design standards to new card
```

### Works with deploy-check
```
design-improvement: Make changes
→ deploy-check: Verify responsive design
→ Deploy to Vercel
```

---

## Examples

### Example 1: Improve About Page

**User**: "關於頁面的設計不太好看，可以改進一下嗎？"

**Agent Response**:
```markdown
## Design Analysis: About Page

📋 **Current Issues**:
- Text alignment inconsistent
- Spacing too tight
- No visual hierarchy

💡 **Recommended Improvements**:
1. Center-align hero content
2. Increase vertical spacing (py-12 → py-16)
3. Add gradient background
4. Improve typography scale

Should I proceed with these changes?
```

**After confirmation** → Implement → Test → Commit

### Example 2: Projects Gallery Redesign

**User**: "專案列表看起來很擠，改成更舒適的排版"

**Agent Response**:
```markdown
## Design Proposal: Projects Gallery

🎯 **Changes**:
1. Grid: 3 cols → 1 col (mobile), 2 cols (tablet), 3 cols (desktop)
2. Gap: gap-4 → gap-6 (mobile), gap-8 (desktop)
3. Card: Add hover animation (scale 1.03)
4. Padding: p-4 → p-6

⚡ **Impact**: Better readability, more breathing room

Proceed?
```

---

## Anti-Patterns to Avoid

### ❌ Breaking Responsive Design
```tsx
// Bad: Fixed width breaks mobile
<div className="w-[1200px]">Content</div>

// Good: Responsive width
<div className="w-full max-w-7xl mx-auto px-4">Content</div>
```

### ❌ Inconsistent Colors
```tsx
// Bad: Random colors
<div className="bg-red-500 text-purple-700">Content</div>

// Good: Follow palette
<div className="bg-warm-cream text-slate-700">Content</div>
```

### ❌ Poor Typography
```tsx
// Bad: Unreadable sizes
<p className="text-xs">Important content</p>

// Good: Readable scale
<p className="text-base md:text-lg">Important content</p>
```

---

## Quick Reference: Tailwind Utilities

### Spacing Scale
```
p-4  = 16px (1rem)
p-6  = 24px (1.5rem)
p-8  = 32px (2rem)
p-12 = 48px (3rem)
p-16 = 64px (4rem)
```

### Typography Scale
```
text-sm   = 14px (0.875rem)
text-base = 16px (1rem)
text-lg   = 18px (1.125rem)
text-xl   = 20px (1.25rem)
text-2xl  = 24px (1.5rem)
text-3xl  = 30px (1.875rem)
text-4xl  = 36px (2.25rem)
```

### Responsive Breakpoints
```
sm:  ≥ 640px  (mobile landscape)
md:  ≥ 768px  (tablet)
lg:  ≥ 1024px (desktop)
xl:  ≥ 1280px (large desktop)
2xl: ≥ 1536px (extra large)
```

---

## Success Metrics

### Before This Skill
- ⏱️ Design changes: Ad-hoc, inconsistent
- 😕 Visual quality: Mixed
- 📱 Responsive: Broken on some devices

### After This Skill
- ✅ Design changes: Systematic, consistent
- 😊 Visual quality: Professional
- 📱 Responsive: Works everywhere

---

## Related Skills

- **content-update**: Content changes + design polish
- **deploy-check**: Pre-deployment design verification

---

**Skill Version**: v1.0
**Last Updated**: 2025-12-25
**Project**: young-personal-site
**Philosophy**: "Design is not just what it looks like. Design is how it works." - Steve Jobs

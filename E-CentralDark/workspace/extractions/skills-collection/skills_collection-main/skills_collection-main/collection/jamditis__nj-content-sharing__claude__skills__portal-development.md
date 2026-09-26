---
name: portal-development
description: Guide React/Vite development for the NJ Content Sharing Network portal, including component architecture, styling patterns, and code organization. Activate when building features, fixing bugs, or refactoring the portal codebase.
---

# Portal Development

This skill provides development guidance for the NJ Content Sharing Network portal built with React and Vite.

## When to Activate

- Writing new React components
- Modifying App.jsx or other portal code
- Adding new sections to the portal
- Fixing styling issues
- Refactoring code organization

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **Lucide React** - Icon library
- **ESLint** - Code quality

## Project Structure

```
portal/
  src/
    main.jsx          # App entry point
    App.jsx           # Main component (552 lines - monolithic)
    index.css         # Global styles
    assets/           # Static assets
  public/             # Public static files
  index.html          # HTML entry
  vite.config.js      # Vite configuration
  package.json        # Dependencies
```

## Design System

### Colors

```css
--editorial-red: #CA3553;    /* Primary accent, CTAs */
--ink-black: #1a1a1a;        /* Text, dark sections */
--paper-white: #FAFAF8;      /* Background */
```

### Typography

- **Headings**: Playfair Display (serif) - imported from Google Fonts
- **Body**: Manrope (sans-serif) - imported from Google Fonts

### Spacing Pattern

Use Tailwind spacing scale consistently:
- Section padding: `py-24` (6rem vertical)
- Container max-width: `max-w-7xl` with `px-6`
- Component gaps: `gap-8` to `gap-12`

## Component Patterns

### Section Header

Reusable header for major sections:

```jsx
const SectionHeader = ({ badge, headline, description, centered = true }) => (
  <div className={centered ? 'text-center' : ''}>
    {badge && (
      <span className="inline-block px-4 py-2 bg-red-50 text-[#CA3553]
                       text-sm font-semibold rounded-full mb-4">
        {badge}
      </span>
    )}
    <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
      {headline}
    </h2>
    {description && (
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        {description}
      </p>
    )}
  </div>
);
```

### Fade-In Animation

Intersection Observer-based reveal:

```jsx
const FadeInSection = ({ children, delay = 0, className = '' }) => {
  const ref = useRef();
  const isVisible = useOnScreen(ref);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};
```

### Widget Card

Card for displaying DML widget information:

```jsx
const WidgetCard = ({ title, badge, description, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100
                  overflow-hidden hover:border-[#CA3553] transition-all">
    <div className="h-1 bg-gray-100 group-hover:bg-[#CA3553] transition-colors" />
    <div className="p-8">
      {badge && (
        <span className="text-xs font-semibold text-[#CA3553] uppercase tracking-wide">
          {badge}
        </span>
      )}
      <h3 className="font-serif text-2xl font-bold mt-2 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="bg-gray-50 rounded-xl p-4 min-h-[200px]">
        {children || <WidgetPlaceholder />}
      </div>
    </div>
  </div>
);
```

## Development Commands

```bash
cd portal

# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Current Architecture Issues

### Monolithic App.jsx

The entire application lives in a single 552-line file. Consider splitting:

```
src/
  components/
    Header.jsx
    Hero.jsx
    WidgetsSection.jsx
    PluckyWireSection.jsx
    RoundupSection.jsx
    AttributionSection.jsx
    Footer.jsx
  hooks/
    useOnScreen.js
  data/
    widgets.js
    partners.js
  App.jsx (imports and composes)
```

**Benefits:**
- Easier to navigate and edit
- Better code organization
- Enables component-level testing
- Reduces merge conflicts

### Inline Styles

All styling uses Tailwind classes inline. Consider extracting common patterns:

```css
/* index.css */
@layer components {
  .section-container {
    @apply max-w-7xl mx-auto px-6 py-24;
  }

  .btn-primary {
    @apply bg-[#CA3553] text-white px-6 py-3 rounded-lg
           font-semibold hover:bg-[#b02d48] transition-colors;
  }
}
```

## Guidelines

1. **Match existing patterns** - Follow established component structure before introducing new approaches.

2. **Keep bundle small** - Avoid adding heavy dependencies. Current bundle is lean.

3. **Mobile-first** - Test responsive behavior. Use Tailwind breakpoints (`md:`, `lg:`).

4. **Accessibility** - Use semantic HTML, proper heading hierarchy, ARIA labels for interactive elements.

5. **No unused code** - Remove commented code, unused imports, dead branches.

## Adding a New Section

1. Create the section following existing patterns (SectionHeader, container, padding)
2. Add scroll anchor ID matching navigation
3. Add navigation link in header (desktop and mobile menus)
4. Test scroll behavior and mobile display
5. Run lint before committing

## Common Tailwind Classes Used

```
Layout:     max-w-7xl mx-auto px-6 py-24
Flex:       flex items-center justify-between gap-8
Grid:       grid md:grid-cols-2 lg:grid-cols-4 gap-8
Text:       text-[#1a1a1a] text-gray-600 font-serif font-semibold
Spacing:    mb-4 mt-2 py-2 px-4
Borders:    rounded-lg rounded-2xl border border-gray-100
Hover:      hover:bg-[#CA3553] hover:border-[#CA3553] transition-colors
```

## Related Skills

- deployment-workflow: For building and deploying changes
- widget-management: For implementing DML widgets

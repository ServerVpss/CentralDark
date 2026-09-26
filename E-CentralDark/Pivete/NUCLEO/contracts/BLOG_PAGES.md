# CONTRATO - BLOG_PAGES.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\astro\blog\BLOG_PAGES.md
**SHA:** fa531e05344d927f
**Timestamp:** 2026-08-26T18:42:42.049561
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- styling contract: .hero-image, .prose, .title, .date, .tags,

### Ouro Bruto (primeiros 5000 chars)
```
# Reference: Blog Pages

Blog listing, post detail, RSS feed, layout, SEO head component, and date formatting.

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/blog/index.astro` | Blog listing page |
| `src/pages/blog/[...slug].astro` | Blog post detail page (with RicosViewer) |
| `src/pages/rss.xml.js` | RSS feed |
| `src/layouts/BlogPost.astro` | Blog post layout wrapper |
| `src/components/BaseHead.astro` | SEO head component (OG/Twitter cards) |
| `src/components/FormattedDate.astro` | Date formatting helper |

---

## 1. SEO Head Component (`src/components/BaseHead.astro`)

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  image?: string;
}

const canonicalURL = new URL(Astro.url.pathname, Astro.site);

const { title, description, image = '/blog-placeholder-1.jpg' } = Astro.props;
---

<!-- Global Metadata -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta name="generator" content={Astro.generator} />

<!-- Canonical URL -->
<link rel="canonical" href={canonicalURL} />

<!-- Primary Meta Tags -->
<title>{title}</title>
<meta name="title" content={title} />
<meta name="description" content={description} />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content={Astro.url} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={new URL(image, Astro.url)} />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content={Astro.url} />
<meta property="twitter:title" content={title} />
<meta property="twitter:description" content={description} />
<meta property="twitter:image" content={new URL(image, Astro.url)} />
```

> If the project already has a `<head>` component or `Layout.astro` with SEO tags, adapt the existing component instead of creating a new one. The key additions are the OG/Twitter meta tags with `image` support.

---

## 2. Formatted Date Component (`src/components/FormattedDate.astro`)

```astro
---
interface Props {
  date: Date;
}

const { date } = Astro.props;
---

<time datetime={date.toISOString()}>
  {
    date.toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
</time>
```

---

## 3. Blog Post Layout (`src/layouts/BlogPost.astro`)

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import FormattedDate from '../components/FormattedDate.astro';

interface Props {
  title: string;
  description?: string;
  pubDate: Date;
  updatedDate?: Date;
  heroImage?: string;
  tags?: Array<{ label: string; slug: string }>;
}

const { title, description, pubDate, updatedDate, heroImage, tags = [] } = Astro.props;
---

<html lang="en">
  <head>
    <BaseHead title={title} description={description ?? ''} />
    <style is:global>
      /* All BlogPost layout styles are created by the design skill.
         See COMPONENT_PATTERNS.md → Blog Post Content for the complete
         styling contract: .hero-image, .prose, .title, .date, .tags,
         .ricos-content overrides, etc. */
    </style>
  </head>

  <body>
    <Header />
    <main>
      <article>
        <div class="hero-image">
          {heroImage && <img width={1020} height={510} src={heroImage} alt="" />}
        </div>
        <div class="prose">
          <div class="title">
            <div class="date">
              <FormattedDate date={pubDate} />
              {
                updatedDate && (
                  <div class="last-updated-on">
                    Last updated on <FormattedDate date={updatedDate} />
                  </div>
                )
              }
            </div>
            <h1>{title}</h1>
            {tags.length > 0 && (
              <div class="tags">
                {tags.map((tag) => (
                  <span class="tag">{tag.label}</span>
                ))}
              </div>
            )}
            <hr />
          </div>
          <slot />
        </div>
      </article>
    </main>
    <Footer />
  </body>
</html>
```

> Adapt `Header` and `Footer` imports to match the project's existing components. If the project uses a different layout pattern (e.g., `Layout.astro` wrapper), use that instead and incorporate the blog-specific elements (hero image, date, title, tags).

---

## 4. Blog Listing Page (`src/pages/blog/index.astro`)

```astro
---
import { queryBlogPosts } from "../../lib/blog";
import BaseHead from "../../components/BaseHead.astro";
import Footer from "../../components/Footer.astro";
import FormattedDate from "../../components/FormattedDate.astro";
import Header from "../../components/Header.astro";
import { SITE_DESCRIPTION, SITE_
```
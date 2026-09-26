# OUTRO - hero-banner.liquid
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-liquid\sections\hero-banner.liquid
**SHA:** f2b0e3d86fe6fe1d
**Timestamp:** 2026-08-26T18:43:24.645140
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 0.5rem;

### Ouro Bruto (primeiros 5000 chars)
```
<hero-banner
  class="hero-banner {{ section.settings.animation_type }}"
  style="--hero-height: {{ section.settings.height }}px; --hero-height-mobile: {{ section.settings.height_mobile }}px;"
  data-autoplay="{{ section.settings.autoplay }}"
  data-autoplay-speed="{{ section.settings.autoplay_speed | times: 1000 }}"
>
  <div class="hero-banner__track">
    {%- content_for 'blocks' -%}
  </div>

  {%- if section.blocks.size > 1 -%}
    {%- if section.settings.show_arrows -%}
      <button
        class="hero-banner__arrow hero-banner__arrow--prev"
        aria-label="{{ 'sections.hero_banner.previous_slide' | t }}"
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button
        class="hero-banner__arrow hero-banner__arrow--next"
        aria-label="{{ 'sections.hero_banner.next_slide' | t }}"
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    {%- endif -%}

    {%- if section.settings.show_dots -%}
      <div class="hero-banner__dots" role="tablist" aria-label="{{ 'sections.hero_banner.pagination' | t }}">
        {%- for block in section.blocks -%}
          <button
            class="hero-banner__dot{% if forloop.first %} hero-banner__dot--active{% endif %}"
            role="tab"
            aria-selected="{{ forloop.first }}"
            aria-label="{{ 'sections.hero_banner.slide_label' | t: number: forloop.index }}"
            data-dot="{{ forloop.index0 }}"
            type="button"
          ></button>
        {%- endfor -%}
      </div>
    {%- endif -%}
  {%- endif -%}
</hero-banner>

{% stylesheet %}
  hero-banner {
    display: block;
    position: relative;
    overflow: hidden;
    width: 100%;
    height: var(--hero-height, 600px);
  }

  .hero-banner__track {
    position: relative;
    width: 100%;
    height: 100%;
  }

  hero-banner.hero-banner--slide .hero-banner__track {
    display: flex;
    will-change: transform;
    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  hero-banner.hero-banner--slide .hero-banner__slide {
    min-width: 100%;
    flex-shrink: 0;
  }

  hero-banner.hero-banner--fade .hero-banner__slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.8s ease;
  }

  hero-banner.hero-banner--fade .hero-banner__slide:first-child,
  hero-banner.hero-banner--fade .hero-banner__slide.is-active {
    opacity: 1;
    pointer-events: auto;
  }

  .hero-banner__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    padding: 0;
    background: rgba(0, 0, 0, 0.25);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: background 0.2s ease, scale 0.2s ease;
  }

  .hero-banner__arrow:hover {
    background: rgba(0, 0, 0, 0.45);
    scale: 1.08;
  }

  .hero-banner__arrow--prev { left: 1.25rem; }
  .hero-banner__arrow--next { right: 1.25rem; }

  .hero-banner__dots {
    position: absolute;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    z-index: 10;
  }

  .hero-banner__dot {
    width: 8px;
    height: 8px;
    padding: 0;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.7);
    background: transparent;
    cursor: pointer;
    transition: background 0.25s ease, scale 0.25s ease;
  }

  .hero-banner__dot--active,
  .hero-banner__dot:hover {
    background: white;
    scale: 1.3;
  }

  @media (max-width: 749px) {
    hero-banner {
      height: var(--hero-height-mobile, 400px);
    }

    .hero-banner__arrow {
      width: 36px;
      height: 36px;
    }

    .hero-banner__arrow--prev { left: 0.75rem; }
    .hero-banner__arrow--next { right: 0.75rem; }
  }
{% endstylesheet %}

{% javascript %}
  class HeroBanner extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('.hero-banner__track');
      this.slides = Array.from(this.querySelectorAll('.hero-banner__slide'));
      this.dots = Array.from(this.querySelectorAll('[data-dot]'));
      this.prevBtn = this.querySelector('.hero-banner__arrow--prev');
      this.nextBtn = this.querySelector('.hero-banner__arrow--next');
      this.isFade = this.classList.contains('hero-banner--fade');
      this.total = this.slides.length;
      this.index = 0;
      this.timer = null;

      if (this.total <= 
```
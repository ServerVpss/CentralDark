# OUTRO - hero-slide.liquid
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-liquid\blocks\hero-slide.liquid
**SHA:** 46c32db90d44782e
**Timestamp:** 2026-08-26T18:43:20.914610
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- margin-inline-start: auto;

### Gaps
- gap: 0.75rem;

### Ouro Bruto (primeiros 5000 chars)
```
{% doc %}
  Renders an individual slide within a hero banner section.
  Includes a background image with overlay, heading, subheading, description, and up to two CTA buttons.

  @example
  {% content_for 'block', type: 'hero-slide', id: 'slide-1' %}
{% enddoc %}

<div
  class="hero-banner__slide hero-slide {{ block.settings.content_alignment }}"
  style="--overlay-opacity: {{ block.settings.overlay_opacity | divided_by: 100.0 }};"
  {{ block.shopify_attributes }}
>
  <div class="hero-slide__media">
    {%- if block.settings.image != blank -%}
      {%- if block.settings.mobile_image != blank -%}
        <picture>
          <source
            media="(max-width: 749px)"
            srcset="{{ block.settings.mobile_image | image_url: width: 800 }}"
          >
          {{ block.settings.image | image_url: width: 2000 | image_tag:
            loading: 'eager',
            class: 'hero-slide__image',
            sizes: '100vw'
          }}
        </picture>
      {%- else -%}
        {{ block.settings.image | image_url: width: 2000 | image_tag:
          loading: 'eager',
          class: 'hero-slide__image',
          sizes: '100vw'
        }}
      {%- endif -%}
    {%- else -%}
      {{ 'lifestyle-1' | placeholder_svg_tag: 'hero-slide__image hero-slide__placeholder' }}
    {%- endif -%}
    <div class="hero-slide__overlay"></div>
  </div>

  <div class="hero-slide__content {{ block.settings.text_color }}">
    {%- if block.settings.subheading != blank -%}
      <p class="hero-slide__subheading">{{ block.settings.subheading | escape }}</p>
    {%- endif -%}

    {%- if block.settings.heading != blank -%}
      <h2 class="hero-slide__heading">{{ block.settings.heading | escape }}</h2>
    {%- endif -%}

    {%- if block.settings.description != blank -%}
      <p class="hero-slide__description">{{ block.settings.description | escape }}</p>
    {%- endif -%}

    {%- if block.settings.button_label != blank or block.settings.button_label_2 != blank -%}
      <div class="hero-slide__buttons">
        {%- if block.settings.button_label != blank -%}
          <a
            href="{{ block.settings.button_link | default: '#' }}"
            class="hero-slide__btn {{ block.settings.button_style }}"
          >
            {{- block.settings.button_label | escape -}}
          </a>
        {%- endif -%}
        {%- if block.settings.button_label_2 != blank -%}
          <a
            href="{{ block.settings.button_link_2 | default: '#' }}"
            class="hero-slide__btn hero-slide__btn--outline"
          >
            {{- block.settings.button_label_2 | escape -}}
          </a>
        {%- endif -%}
      </div>
    {%- endif -%}
  </div>
</div>

{% stylesheet %}
  .hero-banner__slide {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .hero-slide__media {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .hero-slide__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  .hero-slide__placeholder {
    width: 100%;
    height: 100%;
  }

  .hero-slide__overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, var(--overlay-opacity, 0.3));
  }

  .hero-slide__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    padding: 3rem 4rem;
    max-width: 700px;
  }

  .hero-slide.hero-slide--center .hero-slide__content {
    align-items: center;
    text-align: center;
    margin-inline: auto;
    max-width: none;
  }

  .hero-slide.hero-slide--right .hero-slide__content {
    align-items: flex-end;
    text-align: right;
    margin-inline-start: auto;
  }

  .hero-slide__content.hero-slide-text--light { color: #ffffff; }
  .hero-slide__content.hero-slide-text--dark  { color: #1a1a1a; }

  .hero-slide__subheading {
    margin: 0 0 0.625rem;
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.85;
  }

  .hero-slide__heading {
    margin: 0 0 1rem;
    font-size: clamp(1.75rem, 5vw, 3.75rem);
    font-weight: 700;
    line-height: 1.1;
  }

  .hero-slide__description {
    margin: 0 0 1.75rem;
    font-size: clamp(0.9375rem, 1.5vw, 1.125rem);
    line-height: 1.65;
    opacity: 0.9;
    max-width: 520px;
  }

  .hero-slide.hero-slide--center .hero-slide__description {
    max-width: none;
  }

  .hero-slide__buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .hero-slide__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.8125rem 2rem;
    border-radius: 3px;
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-decoration: none;
    white-space: nowrap;
    transition: opacity 0.2s ease, translate 0.2s ease;
  }

  .hero-slide__btn:hover {
    opacity: 0.88;
    translate: 0 -2px;
  }

  .hero-slide__btn--primary-ligh
```
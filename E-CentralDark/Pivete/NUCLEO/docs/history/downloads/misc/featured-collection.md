# OUTRO - featured-collection.liquid
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-liquid\featured-collection.liquid
**SHA:** f4e392ff97af90eb
**Timestamp:** 2026-08-26T18:43:16.181524
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 1.5rem;
- gap: 0.4rem;
- gap: 0.5rem;
- gap: 0.4rem;

### Ouro Bruto (primeiros 5000 chars)
```
<section
  class="featured-collection"
  style="--columns: {{ section.settings.columns_desktop }}; --columns-mobile: {{ section.settings.columns_mobile }};"
>
  {%- if section.settings.title != blank or section.settings.description != blank -%}
    <div class="featured-collection__header">
      {%- if section.settings.title != blank -%}
        <h2 class="featured-collection__title">{{ section.settings.title | escape }}</h2>
      {%- endif -%}
      {%- if section.settings.description != blank -%}
        <p class="featured-collection__description">{{ section.settings.description | escape }}</p>
      {%- endif -%}
    </div>
  {%- endif -%}

  {%- assign featured = section.settings.collection -%}
  {%- if featured != blank -%}
    <ul class="featured-collection__grid" role="list">
      {%- for product in featured.products limit: section.settings.products_to_show -%}
        <li class="featured-collection__item">
          <div class="product-card">
            <a href="{{ product.url }}" class="product-card__image-link" aria-label="{{ product.title | escape }}">
              {%- if product.featured_image -%}
                {%- assign image_alt = product.featured_image.alt | escape -%}
                {{ product.featured_image | image_url: width: 600 | image_tag: loading: 'lazy', alt: image_alt, class: 'product-card__image' }}
              {%- else -%}
                {{ 'product-1' | placeholder_svg_tag: 'product-card__image product-card__placeholder' }}
              {%- endif -%}
              {%- if product.compare_at_price > product.price -%}
                <span class="product-card__badge" aria-label="{{ 'sections.featured_collection.sale_badge' | t }}">
                  {{- 'sections.featured_collection.sale' | t -}}
                </span>
              {%- endif -%}
            </a>

            <div class="product-card__info">
              {%- if section.settings.show_vendor -%}
                <p class="product-card__vendor">{{ product.vendor | escape }}</p>
              {%- endif -%}

              <h3 class="product-card__title">
                <a href="{{ product.url }}">{{ product.title | escape }}</a>
              </h3>

              {%- if section.settings.show_price -%}
                <div class="product-card__price" aria-label="{{ 'sections.featured_collection.price_label' | t }}">
                  {%- if product.compare_at_price > product.price -%}
                    <s class="product-card__price--compare">{{ product.compare_at_price | money }}</s>
                  {%- endif -%}
                  <span class="product-card__price--current{% if product.compare_at_price > product.price %} product-card__price--sale{% endif %}">
                    {{- product.price | money -}}
                  </span>
                </div>
              {%- endif -%}

              {%- if product.available -%}
                {%- form 'product', product, id: product.id | append: '-atc-form', class: 'product-card__form' -%}
                  <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">
                  <button
                    type="submit"
                    class="product-card__atc-btn"
                    data-loading="{{ 'sections.featured_collection.adding' | t }}"
                    data-added="{{ 'sections.featured_collection.added' | t }}"
                  >
                    {{- 'sections.featured_collection.add_to_cart' | t -}}
                  </button>
                {%- endform -%}
              {%- else -%}
                <button class="product-card__atc-btn product-card__atc-btn--sold-out" disabled aria-disabled="true">
                  {{- 'sections.featured_collection.sold_out' | t -}}
                </button>
              {%- endif -%}
            </div>
          </div>
        </li>
      {%- endfor -%}
    </ul>

    {%- if section.settings.show_view_all and featured.products_count > section.settings.products_to_show -%}
      <div class="featured-collection__footer">
        <a href="{{ featured.url }}" class="featured-collection__view-all">
          {{- 'sections.featured_collection.view_all' | t: collection: featured.title -}}
        </a>
      </div>
    {%- endif -%}
  {%- else -%}
    <div class="featured-collection__empty">
      <p>{{ 'sections.featured_collection.no_collection' | t }}</p>
    </div>
  {%- endif -%}

  {%- if section.blocks.size > 0 -%}
    <div class="featured-collection__app-blocks">
      {%- content_for 'blocks' -%}
    </div>
  {%- endif -%}
</section>

{% stylesheet %}
  .featured-collection {
    padding: 3rem 1.5rem;
    max-width: 1440px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .featured-collection__header {
    text-align: center;
    margin-bottom: 2.5rem;
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
  }

  .featured-collection__title {
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    font-weight: 700;
    line-height: 1.2;
    margi
```
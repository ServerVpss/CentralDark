import { useEffect } from "react";

import { LANGS, useI18n } from "@/lib/i18n";

const BASE = "https://centraldark-instinto-superior.lovable.app";
const OG_IMAGE = `${BASE}/og-centraldark.jpg`;

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string, hreflang?: string) {
  const sel = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(sel);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

// Mantém título, descrição, OpenGraph e alternates de idioma em sincronia
// com o idioma escolhido pelo visitante.
export function SeoI18n() {
  const { t, lang } = useI18n();

  useEffect(() => {
    const titulo = `${t("seo.title")} — ${t("hero.subtitle")}`;
    const desc = t("seo.desc");
    const url = lang === "pt-BR" ? `${BASE}/` : `${BASE}/?lang=${lang}`;

    document.title = titulo;
    document.documentElement.lang = lang;

    setMeta("name", "description", desc);
    setMeta("property", "og:title", titulo);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "CentralDark");
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", OG_IMAGE);
    setMeta("property", "og:image:alt", t("seo.imageAlt"));
    setMeta("property", "og:locale", lang.replace("-", "_"));
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", titulo);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", OG_IMAGE);

    setLink("canonical", url);
    LANGS.forEach((l) =>
      setLink(
        "alternate",
        l.code === "pt-BR" ? `${BASE}/` : `${BASE}/?lang=${l.code}`,
        l.code,
      ),
    );
    setLink("alternate", `${BASE}/`, "x-default");
  }, [lang, t]);

  return null;
}

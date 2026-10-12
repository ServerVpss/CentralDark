import { createFileRoute } from "@tanstack/react-router";
import { CockpitShell } from "@/components/central/CockpitShell";

export const Route = createFileRoute("/cockpit")({
  component: () => <CockpitShell />,
  head: () => ({
    meta: [
      { title: "Cockpit CentralDark — Entrada" },
      { name: "description", content: "Entrada pública do cockpit vivo da CentralDark." },
      { property: "og:title", content: "Cockpit CentralDark — Entrada" },
      {
        property: "og:description",
        content: "Estado vivo, acessos e Hermes em uma única superfície.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

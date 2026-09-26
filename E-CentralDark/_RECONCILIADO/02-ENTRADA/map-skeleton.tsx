import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Activity } from "lucide-react";

export function MapSkeleton() {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!ref.current || mapRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !ref.current) return;
      const map = L.map(ref.current, { zoomControl: true }).setView([-23.5505, -46.6333], 11);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      const points: Array<[number, number, string]> = [
        [-23.5505, -46.6333, "Sé · 142 contatos"],
        [-23.5629, -46.6544, "Pinheiros · 87 contatos"],
        [-23.5489, -46.6388, "República · 56 contatos"],
        [-23.5707, -46.6478, "Vila Madalena · 34 contatos"],
        [-23.5475, -46.6361, "Liberdade · 21 contatos"],
      ];
      for (const [lat, lng, label] of points) {
        L.circleMarker([lat, lng], {
          radius: 12, color: "#10b981", weight: 2, fillColor: "#10b981", fillOpacity: 0.4,
        }).addTo(map).bindPopup(label);
      }
    })();
    return () => {
      cancelled = true;
      const m = mapRef.current as { remove?: () => void } | null;
      if (m && typeof m.remove === "function") { m.remove(); mapRef.current = null; }
    };
  }, []);

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[1fr_320px]">
      <div className="relative">
        <div ref={ref} className="absolute inset-0 z-0" style={{ background: "var(--muted)" }} />
      </div>
      <aside className="border-l bg-card p-4 space-y-4 overflow-y-auto">
        <div>
          <h2 className="text-sm font-semibold">Mapa de clientes</h2>
          <p className="text-xs text-muted-foreground">Distribuição geográfica em tempo real</p>
        </div>
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs"><Users className="h-4 w-4 text-primary" /><span>340 contatos mapeados</span></div>
          <div className="flex items-center gap-2 text-xs"><MapPin className="h-4 w-4 text-primary" /><span>5 regiões ativas</span></div>
          <div className="flex items-center gap-2 text-xs"><Activity className="h-4 w-4 text-primary" /><span>23 atendimentos hoje</span></div>
        </Card>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Top regiões</p>
          <div className="space-y-1 text-xs">
            {[["Sé", 142],["Pinheiros", 87],["República", 56],["V. Madalena", 34],["Liberdade", 21]].map(([n,c]) => (
              <div key={n as string} className="flex items-center justify-between rounded-md border px-2 py-1.5">
                <span>{n}</span><Badge variant="secondary">{c}</Badge>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">Heatmap de atendimentos e geolocalização da equipe entram na próxima fase.</p>
      </aside>
    </div>
  );
}

import { useEffect, useMemo, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Users, Activity, Inbox } from "lucide-react";
import { getGeoMap, type GeoPoint } from "@/lib/geo.functions";

export function GeoMap({ scope }: { scope: "workspace" | "admin" }) {
  const fetchGeo = useServerFn(getGeoMap);
  const { data, isLoading } = useQuery({
    queryKey: ["geo-map", scope],
    queryFn: () => fetchGeo({ data: { scope } }),
    staleTime: 60_000,
  });

  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);
  const layerRef = useRef<unknown>(null);

  // init map once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!ref.current || mapRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !ref.current) return;
      const map = L.map(ref.current, { zoomControl: true, preferCanvas: true }).setView([-14.2, -51.9], 4);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
    })();
    return () => {
      cancelled = true;
      const m = mapRef.current as { remove?: () => void } | null;
      if (m && typeof m.remove === "function") { m.remove(); mapRef.current = null; }
    };
  }, []);

  // render points
  useEffect(() => {
    if (!mapRef.current || !data) return;
    (async () => {
      const L = await import("leaflet");
      const map = mapRef.current as ReturnType<typeof L.map>;
      const prev = layerRef.current as ReturnType<typeof L.layerGroup> | null;
      if (prev) prev.remove();
      const group = L.layerGroup().addTo(map);
      layerRef.current = group;

      const max = Math.max(1, ...data.points.map((p) => p.contacts));
      for (const p of data.points) {
        const intensity = p.contacts / max;
        const radius = 6 + intensity * 22;
        const color = p.tickets_open > 0 ? "#ef4444" : "#10b981";
        L.circleMarker([p.lat, p.lng], {
          radius,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.35 + intensity * 0.45,
        })
          .addTo(group)
          .bindPopup(
            `<strong>${p.city} · ${p.state}</strong><br/>` +
            `${p.contacts} contato(s)<br/>` +
            `${p.tickets_open} ticket(s) aberto(s) / ${p.tickets_total} total`
          );
      }

      if (data.points.length > 0) {
        const bounds = L.latLngBounds(data.points.map((p) => [p.lat, p.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
      }
    })();
  }, [data]);

  const top: GeoPoint[] = useMemo(() => (data?.points ?? []).slice(0, 8), [data]);

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[1fr_340px]">
      <div className="relative">
        <div ref={ref} className="absolute inset-0 z-0" style={{ background: "var(--muted)" }} />
      </div>
      <aside className="border-l bg-card p-4 space-y-4 overflow-y-auto">
        <div>
          <h2 className="text-sm font-semibold">
            {scope === "admin" ? "Mapa global de atendimentos" : "Mapa de clientes"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Distribuição por DDD · pontos vermelhos têm tickets abertos
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Users className="h-4 w-4 text-primary" />
                <span>{data?.totals.contacts ?? 0} contatos mapeados</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{data?.totals.regions ?? 0} regiões ativas</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Activity className="h-4 w-4 text-red-500" />
                <span>{data?.totals.tickets_open ?? 0} tickets em aberto</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Inbox className="h-4 w-4 text-muted-foreground" />
                <span>{data?.totals.tickets_total ?? 0} tickets no total</span>
              </div>
            </Card>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Top regiões</p>
              <div className="space-y-1 text-xs">
                {top.map((p) => (
                  <div key={p.ddd} className="flex items-center justify-between rounded-md border px-2 py-1.5">
                    <span className="truncate">
                      <span className="text-muted-foreground mr-1">({p.ddd})</span>
                      {p.city}/{p.state}
                    </span>
                    <div className="flex items-center gap-1">
                      {p.tickets_open > 0 && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">{p.tickets_open}</Badge>
                      )}
                      <Badge variant="secondary">{p.contacts}</Badge>
                    </div>
                  </div>
                ))}
                {top.length === 0 && (
                  <p className="text-muted-foreground py-3 text-center">Sem contatos com telefone válido ainda.</p>
                )}
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground">
              Geolocalização aproximada por DDD do Brasil. Sem dependência de APIs externas — leve e rápido.
            </p>
          </>
        )}
      </aside>
    </div>
  );
}

import { SeloEstado } from "@/components/central/EstadoCentralDark";
import { MAPA_OWNERS, type DonoVisual } from "@/data/painel-unico";

const ORDEM: DonoVisual[] = ["Admin", "Sistema", "Hermes", "Downloads", "Design"];

export function MapaOwners() {
  return (
    <div className="mt-8">
      <h4 className="font-semibold">Mapa de owners</h4>
      <p className="mt-1 text-xs text-muted-foreground">
        Capacidade → dono físico → dono visual. As pastas reais continuam onde estão; só a casca
        visual converge em três botões.
      </p>
      <div className="mt-4 overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-muted/40 font-mono text-[10px] tracking-[0.15em] uppercase">
            <tr>
              <th className="px-3 py-2">Capacidade</th>
              <th className="px-3 py-2">Dono físico</th>
              <th className="px-3 py-2">Dono visual</th>
              <th className="px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ORDEM.flatMap((dono) => MAPA_OWNERS.filter((i) => i.visual === dono)).map((i) => (
              <tr key={i.capacidade}>
                <td className="px-3 py-2">
                  {i.capacidade}
                  <span className="block text-xs text-muted-foreground">{i.nota}</span>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{i.fisico}</td>
                <td className="px-3 py-2">{i.visual}</td>
                <td className="px-3 py-2">
                  <SeloEstado estado={i.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Centróides aproximados das principais capitais brasileiras por DDD.
// Mantemos um mapa estático leve — sem chamadas externas, sem migration.
const DDD_MAP: Record<string, { city: string; state: string; lat: number; lng: number }> = {
  "11": { city: "São Paulo", state: "SP", lat: -23.5505, lng: -46.6333 },
  "12": { city: "S. J. dos Campos", state: "SP", lat: -23.2237, lng: -45.9009 },
  "13": { city: "Santos", state: "SP", lat: -23.9608, lng: -46.3331 },
  "14": { city: "Bauru", state: "SP", lat: -22.3147, lng: -49.0606 },
  "15": { city: "Sorocaba", state: "SP", lat: -23.5015, lng: -47.4526 },
  "16": { city: "Ribeirão Preto", state: "SP", lat: -21.1775, lng: -47.8103 },
  "17": { city: "S. J. do Rio Preto", state: "SP", lat: -20.8113, lng: -49.3758 },
  "18": { city: "Pres. Prudente", state: "SP", lat: -22.1276, lng: -51.3856 },
  "19": { city: "Campinas", state: "SP", lat: -22.9099, lng: -47.0626 },
  "21": { city: "Rio de Janeiro", state: "RJ", lat: -22.9068, lng: -43.1729 },
  "22": { city: "Campos", state: "RJ", lat: -21.7587, lng: -41.3299 },
  "24": { city: "Volta Redonda", state: "RJ", lat: -22.5232, lng: -44.1042 },
  "27": { city: "Vitória", state: "ES", lat: -20.3155, lng: -40.3128 },
  "28": { city: "Cachoeiro", state: "ES", lat: -20.8489, lng: -41.1129 },
  "31": { city: "Belo Horizonte", state: "MG", lat: -19.9167, lng: -43.9345 },
  "32": { city: "Juiz de Fora", state: "MG", lat: -21.7642, lng: -43.3503 },
  "33": { city: "Gov. Valadares", state: "MG", lat: -18.8512, lng: -41.9494 },
  "34": { city: "Uberlândia", state: "MG", lat: -18.9186, lng: -48.2772 },
  "35": { city: "Poços de Caldas", state: "MG", lat: -21.7878, lng: -46.5614 },
  "37": { city: "Divinópolis", state: "MG", lat: -20.1389, lng: -44.8910 },
  "38": { city: "Montes Claros", state: "MG", lat: -16.7286, lng: -43.8582 },
  "41": { city: "Curitiba", state: "PR", lat: -25.4284, lng: -49.2733 },
  "42": { city: "Ponta Grossa", state: "PR", lat: -25.0950, lng: -50.1619 },
  "43": { city: "Londrina", state: "PR", lat: -23.3045, lng: -51.1696 },
  "44": { city: "Maringá", state: "PR", lat: -23.4205, lng: -51.9331 },
  "45": { city: "Cascavel", state: "PR", lat: -24.9555, lng: -53.4552 },
  "46": { city: "Francisco Beltrão", state: "PR", lat: -26.0779, lng: -53.0552 },
  "47": { city: "Joinville", state: "SC", lat: -26.3045, lng: -48.8487 },
  "48": { city: "Florianópolis", state: "SC", lat: -27.5954, lng: -48.5480 },
  "49": { city: "Chapecó", state: "SC", lat: -27.0961, lng: -52.6181 },
  "51": { city: "Porto Alegre", state: "RS", lat: -30.0346, lng: -51.2177 },
  "53": { city: "Pelotas", state: "RS", lat: -31.7654, lng: -52.3376 },
  "54": { city: "Caxias do Sul", state: "RS", lat: -29.1678, lng: -51.1794 },
  "55": { city: "Santa Maria", state: "RS", lat: -29.6914, lng: -53.8008 },
  "61": { city: "Brasília", state: "DF", lat: -15.7942, lng: -47.8825 },
  "62": { city: "Goiânia", state: "GO", lat: -16.6869, lng: -49.2648 },
  "63": { city: "Palmas", state: "TO", lat: -10.1842, lng: -48.3336 },
  "64": { city: "Rio Verde", state: "GO", lat: -17.7920, lng: -50.9264 },
  "65": { city: "Cuiabá", state: "MT", lat: -15.6014, lng: -56.0979 },
  "66": { city: "Rondonópolis", state: "MT", lat: -16.4706, lng: -54.6356 },
  "67": { city: "Campo Grande", state: "MS", lat: -20.4486, lng: -54.6295 },
  "68": { city: "Rio Branco", state: "AC", lat: -9.9747, lng: -67.8243 },
  "69": { city: "Porto Velho", state: "RO", lat: -8.7619, lng: -63.9039 },
  "71": { city: "Salvador", state: "BA", lat: -12.9714, lng: -38.5014 },
  "73": { city: "Itabuna", state: "BA", lat: -14.7876, lng: -39.2782 },
  "74": { city: "Juazeiro", state: "BA", lat: -9.4111, lng: -40.4986 },
  "75": { city: "Feira de Santana", state: "BA", lat: -12.2664, lng: -38.9663 },
  "77": { city: "Vitória da Conquista", state: "BA", lat: -14.8615, lng: -40.8442 },
  "79": { city: "Aracaju", state: "SE", lat: -10.9472, lng: -37.0731 },
  "81": { city: "Recife", state: "PE", lat: -8.0476, lng: -34.8770 },
  "82": { city: "Maceió", state: "AL", lat: -9.6498, lng: -35.7089 },
  "83": { city: "João Pessoa", state: "PB", lat: -7.1195, lng: -34.8450 },
  "84": { city: "Natal", state: "RN", lat: -5.7945, lng: -35.2110 },
  "85": { city: "Fortaleza", state: "CE", lat: -3.7172, lng: -38.5433 },
  "86": { city: "Teresina", state: "PI", lat: -5.0892, lng: -42.8016 },
  "87": { city: "Petrolina", state: "PE", lat: -9.3891, lng: -40.5031 },
  "88": { city: "Juazeiro do Norte", state: "CE", lat: -7.2128, lng: -39.3158 },
  "89": { city: "Picos", state: "PI", lat: -7.0772, lng: -41.4669 },
  "91": { city: "Belém", state: "PA", lat: -1.4558, lng: -48.5039 },
  "92": { city: "Manaus", state: "AM", lat: -3.1190, lng: -60.0217 },
  "93": { city: "Santarém", state: "PA", lat: -2.4431, lng: -54.7083 },
  "94": { city: "Marabá", state: "PA", lat: -5.3686, lng: -49.1175 },
  "95": { city: "Boa Vista", state: "RR", lat: 2.8197, lng: -60.6733 },
  "96": { city: "Macapá", state: "AP", lat: 0.0349, lng: -51.0694 },
  "97": { city: "Coari", state: "AM", lat: -4.0853, lng: -63.1414 },
  "98": { city: "São Luís", state: "MA", lat: -2.5307, lng: -44.3068 },
  "99": { city: "Imperatriz", state: "MA", lat: -5.5264, lng: -47.4779 },
};

function extractDDD(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  // Brasil: 55 + DDD(2) + número
  let candidate = digits;
  if (candidate.startsWith("55") && candidate.length >= 12) candidate = candidate.slice(2);
  if (candidate.length < 10) return null;
  const ddd = candidate.slice(0, 2);
  return DDD_MAP[ddd] ? ddd : null;
}

export type GeoPoint = {
  ddd: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  contacts: number;
  tickets_open: number;
  tickets_total: number;
};

export type GeoPayload = {
  points: GeoPoint[];
  totals: { contacts: number; tickets_open: number; tickets_total: number; regions: number };
};

const InputSchema = z.object({ scope: z.enum(["workspace", "admin"]).default("workspace") });

export const getGeoMap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let workspaceId: string | null = null;

    if (data.scope === "admin") {
      const { data: isAdmin } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
      if (!isAdmin) throw new Error("Acesso negado: apenas Super Admin.");
    } else {
      const { data: m } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      workspaceId = m?.workspace_id ?? null;
      if (!workspaceId) return { points: [], totals: { contacts: 0, tickets_open: 0, tickets_total: 0, regions: 0 } } as GeoPayload;
    }


    const contactsQ = supabaseAdmin.from("contacts").select("phone, workspace_id").limit(5000);
    const ticketsQ = supabaseAdmin.from("tickets").select("status, contact_id, workspace_id").limit(5000);
    if (workspaceId) {
      contactsQ.eq("workspace_id", workspaceId);
      ticketsQ.eq("workspace_id", workspaceId);
    }
    const [{ data: contacts }, { data: tickets }, { data: contactsForTickets }] = await Promise.all([
      contactsQ,
      ticketsQ,
      supabaseAdmin.from("contacts").select("id, phone").limit(5000),
    ]);

    const phoneById = new Map<string, string | null>();
    for (const c of contactsForTickets ?? []) phoneById.set(c.id, c.phone);

    const agg = new Map<string, GeoPoint>();
    const ensure = (ddd: string) => {
      if (!agg.has(ddd)) {
        const info = DDD_MAP[ddd];
        agg.set(ddd, { ddd, ...info, contacts: 0, tickets_open: 0, tickets_total: 0 });
      }
      return agg.get(ddd)!;
    };

    for (const c of contacts ?? []) {
      const ddd = extractDDD(c.phone);
      if (ddd) ensure(ddd).contacts++;
    }
    for (const t of tickets ?? []) {
      const phone = phoneById.get(t.contact_id);
      const ddd = extractDDD(phone);
      if (!ddd) continue;
      const p = ensure(ddd);
      p.tickets_total++;
      if (t.status !== "closed" && t.status !== "resolved") p.tickets_open++;
    }

    const points = Array.from(agg.values()).sort((a, b) => b.contacts - a.contacts);
    const totals = points.reduce(
      (acc, p) => ({
        contacts: acc.contacts + p.contacts,
        tickets_open: acc.tickets_open + p.tickets_open,
        tickets_total: acc.tickets_total + p.tickets_total,
        regions: acc.regions + 1,
      }),
      { contacts: 0, tickets_open: 0, tickets_total: 0, regions: 0 },
    );
    return { points, totals } as GeoPayload;
  });

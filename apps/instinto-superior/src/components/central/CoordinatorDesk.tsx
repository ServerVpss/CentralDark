type CoordinatorStage = {
  id: string;
  label: string;
  owner: string;
  status: "READY" | "WAITING_RECEIPT" | "UNKNOWN";
  detail: string;
};

const STAGES: CoordinatorStage[] = [
  { id: "intent", label: "Intenção recebida", owner: "CHEFE → SOL", status: "READY", detail: "Escopo e objetivo registrados." },
  { id: "owner", label: "Owner resolvido", owner: "CentralDark Harness", status: "READY", detail: "Uma caneta por escopo; reutilização antes de criar." },
  { id: "dispatch", label: "Despacho Hermes", owner: "apps/modulos/HERMES-CORE", status: "WAITING_RECEIPT", detail: "Aguardando receipt do executor existente." },
  { id: "readback", label: "Readback da saída", owner: "CentralDark receipt", status: "WAITING_RECEIPT", detail: "Saída só promove o próximo passo após contraprova." },
  { id: "next", label: "Próximo cursor", owner: "SOL coordenadora", status: "UNKNOWN", detail: "Derivado somente do receipt anterior." },
];

function badge(status: CoordinatorStage["status"]) {
  if (status === "READY") return "🟢 READY";
  if (status === "WAITING_RECEIPT") return "🟡 WAITING_RECEIPT";
  return "⚪ UNKNOWN";
}

export function CoordinatorDesk() {
  return (
    <section aria-labelledby="coordinator-desk" className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="coordinator-desk" className="font-semibold">🧭 Mesa do coordenador</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            SOL cria e encadeia receitas; Hermes executa; o receipt autoriza o próximo cursor.
          </p>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">LOOP_DIRECTIONAL</span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[42rem] text-left text-xs">
          <thead className="border-b border-border text-muted-foreground">
            <tr><th className="px-2 py-2">Etapa</th><th className="px-2 py-2">Owner</th><th className="px-2 py-2">Estado</th><th className="px-2 py-2">Regra</th></tr>
          </thead>
          <tbody>
            {STAGES.map((stage) => (
              <tr key={stage.id} className="border-b border-border/60">
                <td className="px-2 py-2 font-medium">{stage.label}</td>
                <td className="px-2 py-2 font-mono text-[10px]">{stage.owner}</td>
                <td className="px-2 py-2 whitespace-nowrap">{badge(stage.status)}</td>
                <td className="px-2 py-2 text-muted-foreground">{stage.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Sem receipt não há avanço automático. A mesa exibe o contrato; o estado vivo depende da leitura da rota Hermes/CI.
      </p>
    </section>
  );
}

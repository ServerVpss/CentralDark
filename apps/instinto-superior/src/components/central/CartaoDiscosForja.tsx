import { HardDrive, FolderClock, Monitor, ArrowDownUp } from "lucide-react";

/** Contrato visual dos destinos; não afirma que a migração física foi concluída. */
export function CartaoDiscosForja() {
  const discos = [
    { unidade: "K:\\", titulo: "Patrimônio e Forja", descricao: "Código, owners, memória e sessões persistentes", Icone: HardDrive, cor: "text-emerald-400" },
    { unidade: "F:\\", titulo: "Transitório", descricao: "Temporários, caches e logs descartáveis", Icone: FolderClock, cor: "text-orange-400" },
    { unidade: "C:\\", titulo: "Compatibilidade", descricao: "Windows e exceções necessárias", Icone: Monitor, cor: "text-foreground" },
  ] as const;
  return (
    <section aria-label="Lei dos discos da CentralDark" className="rounded-xl border border-border bg-background/90 p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
        {discos.map(({ unidade, titulo, descricao, Icone, cor }) => (
          <div key={unidade} className="flex flex-col items-center gap-1">
            <Icone aria-hidden="true" className={`mb-1 size-5 ${cor}`} />
            <h2 className={`text-xl font-bold ${cor}`}>{unidade}</h2>
            <p className="text-xs font-semibold text-foreground">{titulo}</p>
            <p className="max-w-60 text-sm leading-5 text-muted-foreground">{descricao}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col items-center gap-2 text-center">
        <ArrowDownUp aria-hidden="true" className="size-4 text-muted-foreground" />
        <p className="font-semibold text-foreground">Um Claude oficial · Um Hermes original · Uma CentralDark</p>
        <p className="text-sm text-muted-foreground">Os executáveis permanecem oficiais. A CentralDark governa as instruções, os destinos e a integração por seus owners.</p>
      </div>
    </section>
  );
}

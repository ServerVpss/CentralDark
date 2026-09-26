import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyDomains, addDomain, removeDomain } from "@/lib/domains.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Globe, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

interface Props {
  workspaceId: string;
  whiteLabelActive: boolean;
}

export function DomainsManagerCard({ workspaceId, whiteLabelActive }: Props) {
  const list = useServerFn(listMyDomains);
  const add = useServerFn(addDomain);
  const remove = useServerFn(removeDomain);
  const qc = useQueryClient();
  const [newDomain, setNewDomain] = useState("");

  const { data: domains, isLoading } = useQuery({
    queryKey: ["workspace-domains", workspaceId],
    queryFn: () => list({ data: { workspaceId } }),
  });

  const addMut = useMutation({
    mutationFn: () => add({ data: { workspaceId, domain: newDomain, isPrimary: (domains?.length ?? 0) === 0 } }),
    onSuccess: () => {
      toast.success("Domínio adicionado");
      setNewDomain("");
      qc.invalidateQueries({ queryKey: ["workspace-domains", workspaceId] });
    },
    onError: (e: Error) => toast.error("Erro ao adicionar", { description: e.message }),
  });

  const removeMut = useMutation({
    mutationFn: (domainId: string) => remove({ data: { workspaceId, domainId } }),
    onSuccess: () => {
      toast.success("Domínio removido");
      qc.invalidateQueries({ queryKey: ["workspace-domains", workspaceId] });
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4" /> Domínios próprios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!whiteLabelActive && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" />
            <div>
              Seu plano atual não inclui domínios próprios. Faça upgrade pra liberar
              white-label completo.
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="new_domain">Adicionar domínio ou subdomínio</Label>
          <div className="flex gap-2">
            <Input
              id="new_domain"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="atendimento.minhaempresa.com"
              disabled={!whiteLabelActive}
            />
            <Button
              onClick={() => addMut.mutate()}
              disabled={!whiteLabelActive || !newDomain || addMut.isPending}
            >
              Adicionar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Aponte um <b>CNAME</b> do seu domínio para <code className="rounded bg-muted px-1">multizap.dev</code> antes
            de adicionar aqui. A verificação leva até 1h.
          </p>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>
          ) : !domains || domains.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum domínio cadastrado ainda.</p>
          ) : (
            domains.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {d.domain}
                    {d.is_primary && <Badge variant="secondary">Primário</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {d.is_verified ? (
                      <><CheckCircle2 className="h-3 w-3 text-green-500" /> Verificado</>
                    ) : (
                      <><AlertCircle className="h-3 w-3 text-amber-500" /> Aguardando verificação DNS</>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => removeMut.mutate(d.id)}
                  disabled={removeMut.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

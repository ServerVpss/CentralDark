import React, { useMemo, useState } from 'react';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Brain, Dna, FileCode2, Gem, PackageOpen, Pickaxe, Search, Wrench } from 'lucide-react';
import { SyncButton } from '../catalog/SyncButton';
import { HOUSE_INVENTORY } from '../../generated/houseInventory';

type InventoryGroup = 'CAPACIDADES' | 'SKILLS' | 'APRENDIZADOS' | 'MINERACAO' | 'CRISTAIS' | 'ARTEFATOS' | 'FERRAMENTAS';

type InventoryItem = {
  id: string;
  name: string;
  group: InventoryGroup;
  type: string;
  status: string;
  owner: string;
  where: string;
  consumers: string[];
  proof: string;
  source: string;
  recorded_at: string | null;
  temporal_scope: 'CURRENT_OWNER' | 'HISTORICAL_RECORD';
  sector: string | null;
  used_when: string | null;
  metrics: string[];
  effect: string | null;
  limit: string | null;
  summary: string;
};

const GROUP_META: Record<InventoryGroup, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  CAPACIDADES: { label: 'Capacidades', icon: Brain },
  SKILLS: { label: 'Skills', icon: PackageOpen },
  APRENDIZADOS: { label: 'Aprendizados', icon: Dna },
  MINERACAO: { label: 'Mineração', icon: Pickaxe },
  CRISTAIS: { label: 'Cristais', icon: Gem },
  ARTEFATOS: { label: 'Artefatos', icon: FileCode2 },
  FERRAMENTAS: { label: 'Ferramentas', icon: Wrench },
};

const items = HOUSE_INVENTORY.items as unknown as InventoryItem[];

function count(group: InventoryGroup) {
  return items.filter((item) => item.group === group).length;
}

function when(recordedAt: string | null) {
  if (!recordedAt) return null;
  const parsed = new Date(recordedAt);
  if (Number.isNaN(parsed.getTime())) return recordedAt;
  return parsed.toLocaleString('pt-BR');
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 leading-5">{value}</div>
    </div>
  );
}

export function InventoryTab() {
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<'TODOS' | InventoryGroup>('TODOS');

  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('pt-BR');
    return items.filter((item) => {
      if (group !== 'TODOS' && item.group !== group) return false;
      if (!needle) return true;
      return [
        item.name,
        item.type,
        item.status,
        item.owner,
        item.summary,
        item.sector ?? '',
        item.used_when ?? '',
        item.effect ?? '',
        item.limit ?? '',
        item.recorded_at ?? '',
        ...item.metrics,
        ...item.consumers,
      ]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(needle);
    });
  }, [group, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl gradient-emerald flex items-center justify-center shadow-3d-primary">
              <Dna className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Inventário da Casa</h2>
              <p className="text-sm text-muted-foreground">Poderes, métodos, skills, aprendizados, minério, cristais e artefatos — lidos dos owners reais.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">SOURCE_OF_TRUTH: {HOUSE_INVENTORY.source_of_truth}</Badge>
            <Badge variant="outline">{items.length} itens</Badge>
            <Badge variant="outline">rev {HOUSE_INVENTORY.generated_from}</Badge>
          </div>
        </div>
        <SyncButton />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {(Object.keys(GROUP_META) as InventoryGroup[]).map((key) => {
          const Icon = GROUP_META[key].icon;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setGroup(group === key ? 'TODOS' : key)}
              className={`text-left rounded-xl border p-3 transition-all ${group === key ? 'border-primary bg-primary/10 shadow-3d-primary' : 'border-border/60 bg-background/40 hover:border-primary/40'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-xl font-semibold">{count(key)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">{GROUP_META[key].label}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar percepção, Dream Review, setor, métrica, owner..."
            className="pl-10"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {group === 'TODOS' ? 'Todos os tipos' : GROUP_META[group].label} · {filtered.length} resultado(s)
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhum item encontrado neste recorte. O Inventário não fabrica owner ausente.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="card-premium overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-base leading-5">{item.name}</CardTitle>
                    <div className="mt-1 text-[11px] text-muted-foreground">{GROUP_META[item.group].label} · {item.type}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="shrink-0 text-[10px]">{item.status}</Badge>
                    {item.sector && <Badge variant="secondary" className="text-[10px]">{item.sector}</Badge>}
                    {item.temporal_scope === 'HISTORICAL_RECORD' && <Badge variant="secondary" className="text-[10px]">histórico registrado</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {item.summary && <p className="text-muted-foreground leading-5">{item.summary}</p>}

                <Detail label="Usa quando" value={item.used_when} />
                <Detail label="O que acontece" value={item.effect} />

                {item.metrics.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Mede / campos reais</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.metrics.map((metric) => <Badge key={metric} variant="outline" className="text-[10px]">{metric}</Badge>)}
                    </div>
                  </div>
                )}

                <Detail label="Limite real" value={item.limit} />

                {item.recorded_at && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Registrado em</div>
                    <div className="mt-1">{when(item.recorded_at)}</div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Owner / onde vive</div>
                  <code className="mt-1 block break-all rounded bg-muted/50 px-2 py-1.5 text-[11px]">{item.owner}</code>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Prova</div>
                    <div className="mt-1 break-all">{item.proof}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Consumidores</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.consumers.length ? item.consumers.map((consumer) => <Badge key={consumer} variant="secondary" className="text-[10px]">{consumer}</Badge>) : <span className="text-muted-foreground">não declarado</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground leading-5">
        <strong className="text-foreground">Regra da estante:</strong> o Inventário é índice, não segunda verdade. Cada método mostra <strong>onde pertence, quando entra, o que mede, o efeito e o limite real</strong>. Skills vêm de <code>.agents/skills/</code>, capacidades dos owners canônicos, aprendizados da memória e mineração/cristalização dos motores existentes. Fixed points e candidatos do ledger aparecem como <strong>histórico registrado</strong>, nunca como estado runtime atual. O build recompõe esta visão antes de publicar.
      </div>
    </div>
  );
}

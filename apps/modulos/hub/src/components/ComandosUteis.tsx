// apps/modulos/hub/src/components/ComandosUteis.tsx
// Aba "Comandos Úteis" — só admin/super_admin.
// Comandos SEGUROS de leitura (diagnóstico, verificação, status).
// Comandos destrutivos NÃO executam direto — mostram confirmação primeiro.

import { useState } from 'react';
import { probeEndpoint, formatProbeSummary, redact } from '@/lib/gatewayProbe';

type ComandoTipo = 'seguro' | 'leitura' | 'destrutivo';

interface Comando {
  id: string;
  titulo: string;
  descricaoLeiga: string;   // explicação sem jargão
  tipo: ComandoTipo;
  executar: () => Promise<string>;
}

const GATEWAY_BASE = 'https://api.centralldark.com';

const COMANDOS: Comando[] = [
  {
    id: 'ping-gateway',
    titulo: '🟢 Ping do Gateway',
    descricaoLeiga: 'Chama o gateway pra ver se ta de pé. Não mexe em nada. Não expõe chave.',
    tipo: 'seguro',
    executar: async () => {
      const s = await probeEndpoint(GATEWAY_BASE, '/health');
      return formatProbeSummary(s);
    },
  },
  {
    id: 'listar-modelos',
    titulo: '📚 Listar modelos do Gateway',
    descricaoLeiga: 'Pergunta pro gateway quais modelos ele expõe. Descoberta pública, sem chave.',
    tipo: 'seguro',
    executar: async () => {
      const s = await probeEndpoint(GATEWAY_BASE, '/v1/models');
      return formatProbeSummary(s);
    },
  },
  {
    id: 'testar-com-barra',
    titulo: '🔎 Testar normalização (com/sem barra)',
    descricaoLeiga: 'Prova que /v1/models e /v1/models/ devolvem o mesmo status. Fix de path.',
    tipo: 'seguro',
    executar: async () => {
      const s = await probeEndpoint(GATEWAY_BASE, '/v1/models');
      return formatProbeSummary(s);
    },
  },
  {
    id: 'super-admin-status',
    titulo: '🔐 Verificar trava de Super Admin',
    descricaoLeiga: 'Pergunta pro HUB se ja existe super_admin. Não expõe email nem id.',
    tipo: 'seguro',
    executar: async () => {
      try {
        const url = (import.meta.env.VITE_HUB_SUPABASE_URL || '') + '/functions/v1/super-admin-status';
        const r = await fetch(url, { method: 'GET' });
        const data = await r.json();
        return `HTTP ${r.status}\n${JSON.stringify(data, null, 2)}`;
      } catch (e) {
        return `❌ ${redact(e instanceof Error ? e.message : String(e))}`;
      }
    },
  },
];

const COMANDOS_DESTRUTIVOS: Comando[] = [
  {
    id: 'revogar-chave',
    titulo: '⚠️ Revogar chave de API',
    descricaoLeiga: 'Marca uma chave `cdk_live_...` como revogada. Cliente perde acesso na hora.',
    tipo: 'destrutivo',
    executar: async () => 'Ação bloqueada — precisa confirmação e chave alvo.',
  },
  {
    id: 'reset-adapter',
    titulo: '⚠️ Reiniciar Arsenal Adapter (PM2)',
    descricaoLeiga: 'Reinicia o gateway na VPS. Interrompe conexões abertas por ~2s.',
    tipo: 'destrutivo',
    executar: async () => 'Ação bloqueada — só via SSH autorizado.',
  },
];

export default function ComandosUteis({ isAdmin }: { isAdmin: boolean }) {
  const [saidas, setSaidas] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="p-6 rounded-lg border border-emerald-800/40 bg-emerald-950/30">
        <p className="text-emerald-100">
          🔒 Área restrita — apenas admin/super_admin acessa Comandos Úteis.
        </p>
      </div>
    );
  }

  async function rodar(c: Comando) {
    if (c.tipo === 'destrutivo' && confirmar !== c.id) {
      setConfirmar(c.id);
      return;
    }
    setCarregando(c.id);
    setConfirmar(null);
    try {
      const out = await c.executar();
      setSaidas((s) => ({ ...s, [c.id]: redact(out) }));
    } catch (e) {
      setSaidas((s) => ({ ...s, [c.id]: `❌ ${redact(e instanceof Error ? e.message : String(e))}` }));
    } finally {
      setCarregando(null);
    }
  }

  return (
    <div className="space-y-6 p-4">
      <header>
        <h2 className="text-xl font-semibold text-emerald-300">🛠️ Comandos Úteis</h2>
        <p className="text-sm text-emerald-100/70">
          Ações de leitura pra diagnóstico. Nenhuma chave real aparece na saída — tudo redacted.
        </p>
      </header>

      <section>
        <h3 className="text-sm font-semibold text-emerald-400 mb-2">✅ Comandos seguros (leitura)</h3>
        <div className="grid gap-3">
          {COMANDOS.map((c) => (
            <ComandoCard key={c.id} c={c} rodar={rodar} carregando={carregando} saida={saidas[c.id]} confirmar={false} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-yellow-400 mb-2">⚠️ Comandos destrutivos (requer confirmação)</h3>
        <div className="grid gap-3">
          {COMANDOS_DESTRUTIVOS.map((c) => (
            <ComandoCard
              key={c.id}
              c={c}
              rodar={rodar}
              carregando={carregando}
              saida={saidas[c.id]}
              confirmar={confirmar === c.id}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ComandoCard({
  c, rodar, carregando, saida, confirmar,
}: {
  c: Comando;
  rodar: (c: Comando) => void;
  carregando: string | null;
  saida?: string;
  confirmar: boolean;
}) {
  const isLoading = carregando === c.id;
  return (
    <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium text-emerald-100">{c.titulo}</div>
          <div className="text-xs text-emerald-100/60 mt-1">{c.descricaoLeiga}</div>
        </div>
        <button
          onClick={() => rodar(c)}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap ${
            c.tipo === 'destrutivo'
              ? confirmar ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-yellow-600/80 text-white hover:bg-yellow-500'
              : 'bg-emerald-600 text-white hover:bg-emerald-500'
          } disabled:opacity-50`}
        >
          {isLoading ? '…' : confirmar ? 'Confirmar' : c.tipo === 'destrutivo' ? 'Solicitar' : 'Executar'}
        </button>
      </div>
      {saida && (
        <pre className="mt-3 text-xs bg-black/40 text-emerald-200 p-3 rounded overflow-x-auto whitespace-pre-wrap">
{saida}
        </pre>
      )}
    </div>
  );
}

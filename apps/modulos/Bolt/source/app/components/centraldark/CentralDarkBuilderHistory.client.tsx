import { useCallback, useEffect, useState } from 'react';

type BuildRecord = {
  id: string;
  builder_version: string;
  built_at: string;
  validated_at?: string | null;
  build_status: string;
  runtime_status: string;
  deploy_status: string;
  source_commit?: string;
  source_pr?: string | null;
  artifacts?: { installer?: { sha256?: string; file?: string } };
};
type BuildSnapshot = {
  status: 'READY' | 'UNKNOWN';
  count: number | null;
  entries: BuildRecord[];
  last_success: BuildRecord | null;
  can_rebuild: boolean;
  reason?: string | null;
  activity?: { status: string; at?: string; error?: string };
};
export type BuilderBridge = {
  getBuilderHistory?: () => Promise<BuildSnapshot>;
  requestBuilderRebuild?: () => Promise<{ status: string; reason?: string }>;
};

function formatBahia(utc?: string | null) {
  if (!utc) return 'NÃO PROVADO';
  const date = new Date(utc);
  if (Number.isNaN(date.getTime())) return 'UNKNOWN';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Bahia', day: '2-digit', month: '2-digit',
    year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date);
}

export function CentralDarkBuilderHistory({ bridge }: { bridge?: BuilderBridge }) {
  const [history, setHistory] = useState<BuildSnapshot | null>(null);
  const [notice, setNotice] = useState('');
  const [requesting, setRequesting] = useState(false);
  const refresh = useCallback(async () => {
    if (!bridge?.getBuilderHistory) return;
    try { setHistory(await bridge.getBuilderHistory()); }
    catch { setHistory(null); setNotice('Histórico indisponível: leitura sem recibo'); }
  }, [bridge]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 15000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const last = history?.last_success;
  const busy = history?.activity?.status === 'REQUESTED' || requesting;
  async function rebuild() {
    if (!bridge?.requestBuilderRebuild || !history?.can_rebuild || busy) return;
    const accepted = window.confirm(
      'Rebuild CentralDark: usar a receita canônica no workspace local limpo? ' +
      'A ação instala dependências e gera um novo instalador, sem instalar, fazer push, merge ou deploy.',
    );
    if (!accepted) return;
    setRequesting(true);
    try {
      const answer = await bridge.requestBuilderRebuild();
      setNotice(answer.status === 'REQUESTED'
        ? 'Rebuild solicitado. Atualize para acompanhar; REQUESTED não é BUILD_PASS.'
        : answer.status + (answer.reason ? ': ' + answer.reason : ''));
      await refresh();
    } catch { setNotice('Falha de solicitação: nenhum build confirmado'); }
    finally { setRequesting(false); }
  }

  return (
    <section className="cd-status-card cd-builder-history" aria-label="Histórico canônico de builders CentralDark">
      <div className="cd-status-line">
        <span>🏗️ Builders CentralDark</span>
        <strong>{history?.count === null || history?.count === undefined ? 'UNKNOWN' : history.count + ' builds'}</strong>
      </div>
      <div className="cd-status-line">
        <span>Última versão validada</span>
        <strong>{last ? 'v' + last.builder_version : 'UNKNOWN'}</strong>
      </div>
      <small>Último build: {formatBahia(last?.built_at)} (Bahia)</small>
      <small>Último smoke local: {formatBahia(last?.validated_at)}</small>
      <small>
        {last ? 'Build ' + last.build_status + ' · runtime ' + last.runtime_status +
          ' · deploy ' + last.deploy_status : 'Sem histórico comprovado nesta instalação'}
      </small>
      <div className="cd-builder-history__actions">
        <button
          type="button" className="cd-button cd-button--primary"
          onClick={() => void rebuild()}
          disabled={!history?.can_rebuild || !bridge?.requestBuilderRebuild || busy}
          title={!history?.can_rebuild ? 'Requer checkout de fonte Windows com receita instalada' : 'Rebuild com confirmação explícita'}
        >
          <span className="i-ph:hammer" /> {busy ? 'Rebuild em andamento' : 'Rebuild Windows'}
        </button>
        <button type="button" className="cd-button" onClick={() => void refresh()} aria-label="Atualizar histórico de builders">
          <span className="i-ph:arrows-clockwise" /> Atualizar
        </button>
      </div>
      {notice ? <p className="cd-status-copy" role="status">{notice}</p> : null}
      {history?.activity?.status && history.activity.status !== 'IDLE'
        ? <small>Processo: {history.activity.status}{history.activity.error ? ' · ' + history.activity.error : ''}</small>
        : null}
      {history?.reason ? <small>Fonte: {history.reason}</small> : null}
      <details>
        <summary>📋 Receita do builder + histórico</summary>
        <div className="cd-builder-history__recipe">
          <p>1. Worktree exclusivo e limpo; Node + pnpm no Windows.</p>
          <p>2. NODE_ENV=development; instalar devDependencies com --frozen-lockfile --prod=false.</p>
          <p>3. Executar pnpm centraldark:rebuild:win; versão avança após build exit 0 e hashes de arquivos novos.</p>
          <p>4. Validar CentralDark.exe --enable-logging e a janela separadamente. Smoke != build.</p>
          <p>5. Publicar PR, depois instalar/deploy somente mediante aprovação e gates existentes.</p>
          {history?.entries?.map((entry) => (
            <div className="cd-builder-history__entry" key={entry.id}>
              <strong>Builder {entry.builder_version}</strong>
              <small>{formatBahia(entry.built_at)} · BUILD {entry.build_status} · RUNTIME {entry.runtime_status}</small>
              <small>Commit {entry.source_commit?.slice(0, 10) ?? 'UNKNOWN'}</small>
              {entry.artifacts?.installer?.sha256
                ? <code title={entry.artifacts.installer.sha256}>SHA256 {entry.artifacts.installer.sha256.slice(0, 16)}…</code>
                : null}
              {entry.source_pr ? <a href={entry.source_pr} target="_blank" rel="noreferrer">PR de origem</a> : null}
            </div>
          ))}
        </div>
      </details>
      <small>Contagem de builds PASS registrada, não de tentativas, instalações ou deploys.</small>
    </section>
  );
}

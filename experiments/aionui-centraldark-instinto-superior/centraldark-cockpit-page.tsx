/**
 * CentralDark Cockpit — página inicial da casca Electron.
 * SPDX-License-Identifier: Apache-2.0
 *
 * O cockpit existente (apps/instinto-superior) é hospedado no WebviewHost já existente do AionUi.
 * Não existe segundo cockpit: esta página só aponta para a URL do cockpit publicado.
 * As funções originais do AionUi continuam em /guid.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebviewHost from '@renderer/components/media/WebviewHost';

const DEFAULT_COCKPIT_URL = 'https://admin.centralldark.com/cockpit';

function resolveCockpitBase(): URL {
  const configured = window.localStorage.getItem('centraldark.cockpit.url')?.trim();
  if (configured) {
    try {
      // Só https: um valor inesperado no armazenamento local não pode abrir outro esquema no webview.
      const parsed = new URL(configured);
      if (parsed.protocol === 'https:') return parsed;
    } catch {
      // URL inválida: cai no cockpit padrão.
    }
  }
  return new URL(DEFAULT_COCKPIT_URL);
}

const CentralDarkCockpit: React.FC = () => {
  const navigate = useNavigate();
  const base = useMemo(resolveCockpitBase, []);
  // ?shell=aionui avisa o cockpit que ele está dentro da casca Electron (anti-espelho do CentralDark Estúdio).
  const url = useMemo(() => {
    const withShell = new URL(base.toString());
    withShell.searchParams.set('shell', 'aionui');
    return withShell.toString();
  }, [base]);
  const [failure, setFailure] = useState<string | null>(null);

  // O cockpit pede as funções originais do AionUi com aionui-host=guid. Só o próprio cockpit (mesma origem)
  // pode pedir, e só para esse destino fixo.
  const handleUrlChange = useCallback(
    (next: string) => {
      try {
        const parsed = new URL(next);
        if (parsed.origin === base.origin && parsed.searchParams.get('aionui-host') === 'guid') {
          navigate('/guid');
        }
      } catch {
        // URL inválida: ignora.
      }
    },
    [base, navigate]
  );

  return (
    <div className='flex h-full min-h-0 w-full flex-col'>
      {failure ? (
        <div role='alert' className='flex items-center gap-12px px-16px py-8px text-13px'>
          <span>Cockpit indisponível ({failure}). Estado não comprovado.</span>
          <a href='#/guid'>Abrir AionUi</a>
        </div>
      ) : null}
      <WebviewHost
        id='centraldark-cockpit'
        url={url}
        partition='persist:centraldark-cockpit'
        showNavBar={false}
        className='min-h-0 flex-1'
        onUrlChange={handleUrlChange}
        onDidFinishLoad={() => setFailure(null)}
        onDidFailLoad={(errorCode, errorDescription) => setFailure(`${errorCode} ${errorDescription}`)}
      />
    </div>
  );
};

export default CentralDarkCockpit;

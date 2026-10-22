/**
 * CentralDark Cockpit — página inicial da casca Electron.
 * SPDX-License-Identifier: Apache-2.0
 *
 * O cockpit existente (apps/instinto-superior) é hospedado no WebviewHost já existente do AionUi.
 * Não existe segundo cockpit: esta página só aponta para a URL do cockpit publicado.
 * As funções originais do AionUi continuam em /guid.
 */
import React, { useMemo, useState } from 'react';
import WebviewHost from '@renderer/components/media/WebviewHost';

const DEFAULT_COCKPIT_URL = 'https://admin.centralldark.com/cockpit';

function resolveCockpitUrl(): string {
  const configured = window.localStorage.getItem('centraldark.cockpit.url')?.trim();
  if (configured) {
    try {
      // Só https: um valor inesperado no armazenamento local não pode abrir outro esquema no webview.
      if (new URL(configured).protocol === 'https:') return configured;
    } catch {
      // URL inválida: cai no cockpit padrão.
    }
  }
  return DEFAULT_COCKPIT_URL;
}

const CentralDarkCockpit: React.FC = () => {
  const url = useMemo(resolveCockpitUrl, []);
  const [failure, setFailure] = useState<string | null>(null);

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
        onDidFinishLoad={() => setFailure(null)}
        onDidFailLoad={(errorCode, errorDescription) => setFailure(`${errorCode} ${errorDescription}`)}
      />
    </div>
  );
};

export default CentralDarkCockpit;

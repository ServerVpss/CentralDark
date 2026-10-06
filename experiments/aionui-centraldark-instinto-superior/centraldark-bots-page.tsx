/**
 * CentralDark Bots / Agentes surface.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Rakazo is embedded as a capability surface; CentralDark remains the owner/orchestrator.
 */
import React, { useMemo, useState } from 'react';
import SettingsPageWrapper from '../components/SettingsPageWrapper';
import SettingsPageHeader from '../components/SettingsPageHeader';

function resolveRakazoUrl(): string {
  const host = window.location.hostname || '127.0.0.1';
  return `http://${host}:25810`;
}

const CentralDarkBotsSettings: React.FC = () => {
  const rakazoUrl = useMemo(resolveRakazoUrl, []);
  const [loaded, setLoaded] = useState(false);

  return (
    <SettingsPageWrapper contentClassName='max-w-none'>
      <div className='flex min-h-[720px] h-[calc(100vh-104px)] flex-col gap-14px'>
        <SettingsPageHeader
          sticky={false}
          title='Bots / Agentes'
          description='Rakazo integrado como capability da CentralDark: bots persistentes, browser, desktop, terminal, workers, sandbox, MCP, memória e delegação.'
          actions={
            <a
              href={rakazoUrl}
              target='_blank'
              rel='noreferrer'
              className='rounded-8px border border-border-2 px-12px py-8px text-13px text-t-secondary no-underline hover:text-t-primary'
            >
              Abrir superfície completa
            </a>
          }
        />

        <div className='flex flex-wrap gap-8px text-12px'>
          {['Hermes', 'IA local', 'MCP', 'Memória', 'Browser', 'Desktop', 'Terminal', 'Workers', 'Sandbox'].map(
            (item) => (
              <span key={item} className='rounded-999px border border-border-2 bg-fill-1 px-10px py-5px text-t-secondary'>
                {item}
              </span>
            )
          )}
          <span className='rounded-999px border border-border-2 bg-fill-1 px-10px py-5px text-t-secondary'>
            {loaded ? 'Rakazo online' : 'Conectando Rakazo…'}
          </span>
        </div>

        <div className='relative min-h-0 flex-1 overflow-hidden rounded-12px border border-border-2 bg-fill-1'>
          {!loaded ? (
            <div className='absolute inset-0 z-10 flex items-center justify-center text-14px text-t-tertiary'>
              Carregando Bots / Agentes…
            </div>
          ) : null}
          <iframe
            title='CentralDark Bots / Agentes — Rakazo'
            src={rakazoUrl}
            onLoad={() => setLoaded(true)}
            className='h-full min-h-[620px] w-full border-0 bg-white'
            allow='clipboard-read; clipboard-write; microphone; camera; display-capture'
          />
        </div>
      </div>
    </SettingsPageWrapper>
  );
};

export default CentralDarkBotsSettings;

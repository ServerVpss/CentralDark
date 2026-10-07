/**
 * CentralDark Celestial / Mapas surface.
 * SPDX-License-Identifier: Apache-2.0
 * GraphPanel remains the rendering owner. AionUi is only the shell/menu.
 */
import React, { useMemo, useState } from 'react';
import SettingsPageWrapper from '../components/SettingsPageWrapper';
import SettingsPageHeader from '../components/SettingsPageHeader';

function resolveGraphUrl(): string {
  const configured = window.localStorage.getItem('centraldark.graph.url')?.trim();
  if (configured) return configured;
  if (window.location.protocol === 'file:') return 'http://127.0.0.1:3030/';
  return new URL('/admin/grafo/', window.location.origin).toString();
}

const CentralDarkMapsSettings: React.FC = () => {
  const graphUrl = useMemo(resolveGraphUrl, []);
  const [loaded, setLoaded] = useState(false);
  return (
    <SettingsPageWrapper contentClassName='max-w-none'>
      <div className='flex min-h-[720px] h-[calc(100vh-104px)] flex-col gap-14px'>
        <SettingsPageHeader
          sticky={false}
          title='Celestial / Mapas'
          description='Uma casca, um store e múltiplas vistas: Galáxia, 2D, 3D, Módulos e Vault nas peles Emerald, Operational e Forge.'
          actions={<a href={graphUrl} target='_blank' rel='noreferrer' className='rounded-8px border border-border-2 px-12px py-8px text-13px text-t-secondary no-underline hover:text-t-primary'>Abrir mapa completo</a>}
        />
        <div className='flex flex-wrap gap-8px text-12px'>
          {['Galáxia', '2D', '3D / Celestial', 'Módulos', 'Vault', 'Emerald', 'Operational', 'Forge'].map((item) => (
            <span key={item} className='rounded-999px border border-border-2 bg-fill-1 px-10px py-5px text-t-secondary'>{item}</span>
          ))}
          <span className='rounded-999px border border-border-2 bg-fill-1 px-10px py-5px text-t-secondary'>{loaded ? 'GraphPanel online' : 'Conectando GraphPanel…'}</span>
        </div>
        <div className='relative min-h-0 flex-1 overflow-hidden rounded-12px border border-border-2 bg-fill-1'>
          {!loaded ? <div className='absolute inset-0 z-10 flex items-center justify-center text-14px text-t-tertiary'>Carregando Celestial / Mapas…</div> : null}
          <iframe title='CentralDark Celestial / Mapas' src={graphUrl} onLoad={() => setLoaded(true)} className='h-full min-h-[620px] w-full border-0 bg-black' allow='clipboard-read; clipboard-write; fullscreen' />
        </div>
      </div>
    </SettingsPageWrapper>
  );
};
export default CentralDarkMapsSettings;

import { RemixBrowser } from '@remix-run/react';
import { startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { installCentralDarkDateFormatting } from '../../../../../central-horario/frontend';

installCentralDarkDateFormatting();

startTransition(() => {
  hydrateRoot(document.getElementById('root')!, <RemixBrowser />);
});

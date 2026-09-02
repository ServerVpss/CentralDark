import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { CentralDarkCockpitShell } from '~/components/centraldark/CentralDarkCockpitShell.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';

export const meta: MetaFunction = () => {
  return [{ title: 'CentralDark' }, { name: 'description', content: 'Uma Casa: Hermes por baixo, SOL por cima e bancada de código compartilhada.' }];
};

export const loader = () => json({});

/**
 * A mesma aplicação Remix serve site e desktop. O cockpit envolve a bancada
 * existente sem substituir Chat, Header, editor, terminal ou os owners da Casa.
 */
export default function Index() {
  const workspace = (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );

  return <CentralDarkCockpitShell>{workspace}</CentralDarkCockpitShell>;
}

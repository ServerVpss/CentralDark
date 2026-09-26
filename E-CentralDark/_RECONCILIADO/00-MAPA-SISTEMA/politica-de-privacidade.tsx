import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — MultiZap" },
      { name: "description", content: "Política de Privacidade da MultiZap. Saiba como protegemos seus dados." },
      { property: "og:title", content: "Política de Privacidade — MultiZap" },
      { property: "og:description", content: "Política de Privacidade da MultiZap. Saiba como protegemos seus dados." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PoliticaDePrivacidadePage,
});

function PoliticaDePrivacidadePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header simples */}
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight">MultiZap</span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-primary">Atendimento Profissional</span>
            </div>
          </Link>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Início
          </Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: 19/05/2026
        </p>

        <div className="mt-8 space-y-10 text-sm leading-7 text-foreground/90">
          <section>
            <p>
              A MultiZap respeita a sua privacidade e está comprometida com a proteção dos dados pessoais dos usuários, clientes e empresas que utilizam nossa plataforma de atendimento via WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Dados que coletamos</h2>
            <p className="mt-3">Podemos coletar dados como:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Nome, e-mail, telefone e informações de cadastro;</li>
              <li>Dados da empresa ou workspace;</li>
              <li>Número de WhatsApp conectado;</li>
              <li>Identificadores técnicos da integração com a Meta/WhatsApp, como WABA ID e Phone Number ID;</li>
              <li>Mensagens, contatos, conversas, etiquetas, tickets, campanhas e histórico de atendimento;</li>
              <li>Logs de acesso, endereço IP, navegador, dispositivo e registros de uso da plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Como usamos os dados</h2>
            <p className="mt-3">Utilizamos os dados para:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Operar a plataforma MultiZap;</li>
              <li>Permitir o envio e recebimento de mensagens pelo WhatsApp;</li>
              <li>Gerenciar atendimentos, automações, contatos, campanhas e relatórios;</li>
              <li>Melhorar a segurança, prevenir abuso, fraude e uso indevido;</li>
              <li>Cumprir obrigações legais, regulatórias e contratuais;</li>
              <li>Prestar suporte técnico e atendimento ao cliente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Integração com WhatsApp e Meta</h2>
            <p className="mt-3 text-muted-foreground">
              Ao conectar uma conta WhatsApp Business, o usuário autoriza o MultiZap a acessar dados necessários para operar a integração, como conta WhatsApp Business, número de telefone, mensagens, status de entrega e eventos relacionados.
            </p>
            <p className="mt-2 text-muted-foreground">
              O uso do WhatsApp está sujeito também aos termos e políticas da Meta/WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Compartilhamento de dados</h2>
            <p className="mt-3">Podemos compartilhar dados apenas quando necessário com:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Provedores de infraestrutura, banco de dados e hospedagem;</li>
              <li>Serviços de autenticação, mensagens e notificações;</li>
              <li>Meta/WhatsApp, quando necessário para operar a integração oficial;</li>
              <li>Autoridades públicas, quando exigido por lei.</li>
            </ul>
            <p className="mt-3 text-muted-foreground">Não vendemos dados pessoais dos usuários.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Segurança</h2>
            <p className="mt-3 text-muted-foreground">
              Adotamos medidas técnicas e administrativas para proteger os dados contra acesso não autorizado, perda, uso indevido ou alteração indevida.
            </p>
            <p className="mt-2 text-muted-foreground">
              Credenciais sensíveis, como tokens de acesso e segredos de integração, devem ser armazenadas de forma segura e não devem ser expostas publicamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Retenção dos dados</h2>
            <p className="mt-3 text-muted-foreground">
              Os dados são mantidos enquanto forem necessários para prestação do serviço, cumprimento de obrigações legais, prevenção de fraudes, auditoria e suporte.
            </p>
            <p className="mt-2 text-muted-foreground">
              O usuário pode solicitar exclusão ou correção de dados, quando aplicável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Direitos do titular</h2>
            <p className="mt-3">Nos termos da LGPD, o titular dos dados pode solicitar:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Confirmação de tratamento;</li>
              <li>Acesso aos dados;</li>
              <li>Correção de dados incompletos ou desatualizados;</li>
              <li>Exclusão de dados, quando aplicável;</li>
              <li>Informações sobre compartilhamento;</li>
              <li>Revogação de consentimento, quando aplicável.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Cookies e tecnologias semelhantes</h2>
            <p className="mt-3 text-muted-foreground">
              Podemos usar cookies e tecnologias semelhantes para autenticação, segurança, análise de uso e melhoria da experiência do usuário.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Alterações nesta política</h2>
            <p className="mt-3 text-muted-foreground">
              Esta Política de Privacidade pode ser atualizada periodicamente. A versão mais recente estará sempre disponível nesta página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Contato</h2>
            <p className="mt-3 text-muted-foreground">
              Para dúvidas, solicitações ou exercício de direitos relacionados à privacidade, entre em contato:
            </p>
            <div className="mt-3 rounded-lg border bg-card p-4 text-sm">
              <p><span className="font-medium text-foreground">E-mail:</span> suporte@multizap.dev</p>
              <p className="mt-1"><span className="font-medium text-foreground">Site:</span> https://multizap.dev</p>
            </div>
          </section>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} MultiZap — Atendimento Profissional.
      </footer>
    </div>
  );
}

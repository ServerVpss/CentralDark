import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/termos-de-uso")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — MultiZap" },
      { name: "description", content: "Termos de Uso da MultiZap. Leia as regras de uso da plataforma." },
      { property: "og:title", content: "Termos de Uso — MultiZap" },
      { property: "og:description", content: "Termos de Uso da MultiZap. Leia as regras de uso da plataforma." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: TermosDeUsoPage,
});

function TermosDeUsoPage() {
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
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: 19/05/2026
        </p>

        <div className="mt-8 space-y-10 text-sm leading-7 text-foreground/90">
          <section>
            <p>
              Bem-vindo ao MultiZap. Estes Termos de Uso regulam o acesso e uso da plataforma MultiZap, uma solução de atendimento, automação, CRM e comunicação integrada ao WhatsApp.
            </p>
            <p className="mt-3">
              Ao utilizar o MultiZap, você declara que leu, entendeu e concorda com estes Termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Sobre o MultiZap</h2>
            <p className="mt-3 text-muted-foreground">
              O MultiZap é uma plataforma de atendimento profissional via WhatsApp, permitindo que empresas gerenciem conversas, contatos, automações, campanhas, funis, relatórios e integrações com provedores oficiais ou autorizados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Responsabilidade do usuário</h2>
            <p className="mt-3">O usuário é responsável por:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Fornecer informações verdadeiras e atualizadas;</li>
              <li>Manter a segurança de suas credenciais de acesso;</li>
              <li>Usar a plataforma de acordo com a legislação aplicável;</li>
              <li>Respeitar as políticas da Meta, WhatsApp e demais provedores integrados;</li>
              <li>Não utilizar o sistema para spam, golpes, fraudes, abuso, assédio ou atividades ilegais.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Uso do WhatsApp e Meta</h2>
            <p className="mt-3 text-muted-foreground">
              Ao conectar uma conta WhatsApp Business, o usuário autoriza o MultiZap a acessar os dados necessários para operar a integração, como conta WhatsApp Business, número de telefone, mensagens, status de entrega e eventos relacionados.
            </p>
            <p className="mt-2 text-muted-foreground">
              O uso do WhatsApp está sujeito também aos Termos e Políticas da Meta/WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Mensagens, campanhas e automações</h2>
            <p className="mt-3 text-muted-foreground">
              O usuário é o único responsável pelo conteúdo das mensagens enviadas por meio da plataforma, incluindo campanhas, automações, respostas automáticas, atendimento humano e integrações com inteligência artificial.
            </p>
            <p className="mt-2 text-muted-foreground">
              O MultiZap poderá limitar, suspender ou bloquear o uso da plataforma em caso de abuso, risco de banimento, envio de spam, violação de políticas ou uso indevido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Disponibilidade do serviço</h2>
            <p className="mt-3 text-muted-foreground">
              Buscamos manter a plataforma disponível e funcional, mas não garantimos funcionamento ininterrupto. Instabilidades podem ocorrer por manutenção, falhas técnicas, indisponibilidade de terceiros, mudanças de API, bloqueios da Meta/WhatsApp ou problemas externos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Planos, pagamentos e cancelamento</h2>
            <p className="mt-3 text-muted-foreground">
              O uso de determinados recursos pode depender de plano pago. Os valores, limites e condições comerciais serão informados no momento da contratação.
            </p>
            <p className="mt-2 text-muted-foreground">
              O não pagamento pode resultar em suspensão ou limitação de acesso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Segurança</h2>
            <p className="mt-3 text-muted-foreground">
              O usuário deve proteger suas credenciais, tokens, senhas e acessos administrativos. O MultiZap adota medidas técnicas para proteger dados e integrações, mas o usuário também deve manter boas práticas de segurança.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Propriedade intelectual</h2>
            <p className="mt-3 text-muted-foreground">
              A marca MultiZap, layout, código, funcionalidades, textos, interfaces e elementos visuais pertencem aos seus respectivos titulares. O usuário não recebe direito de copiar, revender, modificar ou explorar comercialmente a plataforma sem autorização.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Limitação de responsabilidade</h2>
            <p className="mt-3">O MultiZap não se responsabiliza por:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Banimentos ou restrições aplicadas pela Meta/WhatsApp;</li>
              <li>Conteúdo enviado pelo usuário;</li>
              <li>Uso indevido da plataforma;</li>
              <li>Falhas de terceiros;</li>
              <li>Perda de acesso causada por credenciais incorretas, permissões removidas ou configurações externas alteradas pelo usuário.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Encerramento de conta</h2>
            <p className="mt-3 text-muted-foreground">
              O usuário pode solicitar encerramento de conta e exclusão de dados, conforme descrito na página de Exclusão de Dados.
            </p>
            <p className="mt-2 text-muted-foreground">
              Também poderemos suspender ou encerrar contas em caso de violação destes Termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">11. Alterações destes Termos</h2>
            <p className="mt-3 text-muted-foreground">
              Estes Termos podem ser atualizados periodicamente. A versão mais recente estará sempre disponível nesta página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">12. Contato</h2>
            <p className="mt-3 text-muted-foreground">
              Para dúvidas, suporte ou solicitações:
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

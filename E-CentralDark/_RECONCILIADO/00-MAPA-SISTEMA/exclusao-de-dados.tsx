import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/exclusao-de-dados")({
  head: () => ({
    meta: [
      { title: "Exclusão de Dados — MultiZap" },
      { name: "description", content: "Solicite a exclusão de seus dados pessoais da MultiZap." },
      { property: "og:title", content: "Exclusão de Dados — MultiZap" },
      { property: "og:description", content: "Solicite a exclusão de seus dados pessoais da MultiZap." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ExclusaoDeDadosPage,
});

function ExclusaoDeDadosPage() {
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
          Solicitação de Exclusão de Dados
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: 19/05/2026
        </p>

        <div className="mt-8 space-y-10 text-sm leading-7 text-foreground/90">
          <section>
            <p>
              Esta página explica como usuários do MultiZap podem solicitar a exclusão de seus dados pessoais e dados relacionados ao uso da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Como solicitar a exclusão</h2>
            <p className="mt-3 text-muted-foreground">
              Para solicitar a exclusão de dados, envie um e-mail para:
            </p>
            <div className="mt-3 rounded-lg border bg-card p-4 text-sm">
              <p><span className="font-medium text-foreground">E-mail:</span> suporte@multizap.dev</p>
              <p className="mt-1"><span className="font-medium text-foreground">Assunto:</span> Solicitação de Exclusão de Dados</p>
            </div>
            <p className="mt-3 text-muted-foreground">No corpo do e-mail, informe:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Nome completo;</li>
              <li>E-mail cadastrado na plataforma;</li>
              <li>Nome da empresa ou workspace;</li>
              <li>Número de WhatsApp conectado, se aplicável;</li>
              <li>Descrição da solicitação.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Dados que podem ser excluídos</h2>
            <p className="mt-3 text-muted-foreground">A solicitação pode abranger:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Dados de cadastro;</li>
              <li>Dados de workspace;</li>
              <li>Contatos importados;</li>
              <li>Conversas e mensagens armazenadas;</li>
              <li>Tickets e histórico de atendimento;</li>
              <li>Campanhas, automações e registros relacionados;</li>
              <li>Tokens e credenciais de integração, quando aplicável.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Dados que podem ser mantidos</h2>
            <p className="mt-3 text-muted-foreground">Alguns dados poderão ser mantidos quando necessário para:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Cumprimento de obrigações legais;</li>
              <li>Prevenção de fraude;</li>
              <li>Auditoria de segurança;</li>
              <li>Cumprimento de obrigações contratuais;</li>
              <li>Defesa em processos administrativos, judiciais ou extrajudiciais.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Prazo de atendimento</h2>
            <p className="mt-3 text-muted-foreground">
              Após o recebimento da solicitação, analisaremos o pedido e responderemos em prazo razoável, conforme a legislação aplicável.
            </p>
            <p className="mt-2 text-muted-foreground">
              Poderemos solicitar informações adicionais para confirmar a identidade do solicitante e evitar exclusões indevidas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Revogação de acesso à Meta/WhatsApp</h2>
            <p className="mt-3 text-muted-foreground">
              Caso tenha conectado uma conta WhatsApp Business ao MultiZap, você também pode revogar permissões diretamente nas configurações da sua conta Meta/Facebook Business.
            </p>
            <p className="mt-2 text-muted-foreground">
              Após a revogação ou exclusão da conexão, o MultiZap poderá deixar de enviar e receber mensagens daquele número.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Contato</h2>
            <p className="mt-3 text-muted-foreground">
              Para solicitações relacionadas à privacidade e exclusão de dados:
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
